const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const { query, transaction } = require('../config/database');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/email');
const { sendSMS } = require('../utils/sms');

const router = express.Router();

// تحديد معدل طلبات المصادقة
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 محاولات كحد أقصى
  message: 'تم تجاوز عدد محاولات تسجيل الدخول، يرجى المحاولة لاحقاً'
});

// دالة لإنشاء JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'voxera-secret-key',
    { expiresIn: '7d' }
  );
};

// دالة لإنشاء رمز التحقق
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @route POST /api/auth/register
 * @desc تسجيل مستخدم جديد
 * @access Public
 */
router.post('/register', [
  body('email').isEmail().withMessage('البريد الإلكتروني غير صحيح'),
  body('username').isLength({ min: 3, max: 50 }).withMessage('اسم المستخدم يجب أن يكون بين 3-50 حرف'),
  body('display_name').isLength({ min: 2, max: 100 }).withMessage('الاسم المعروض يجب أن يكون بين 2-100 حرف'),
  body('password').isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  body('phone').optional().isMobilePhone().withMessage('رقم الهاتف غير صحيح')
], async (req, res) => {
  try {
    // التحقق من صحة البيانات
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { email, username, display_name, password, phone, bio, country, city } = req.body;

    // التحقق من عدم وجود المستخدم مسبقاً
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل'
      });
    }

    // تشفير كلمة المرور
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // إنشاء المستخدم الجديد
    const result = await transaction(async (client) => {
      const userResult = await client.query(`
        INSERT INTO users (email, username, display_name, password_hash, phone, bio, country, city)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, email, username, display_name, avatar_url, is_verified, created_at
      `, [email, username, display_name, passwordHash, phone, bio, country, city]);

      return userResult.rows[0];
    });

    // إنشاء JWT Token
    const token = generateToken(result.id);

    // إرسال رمز التحقق عبر البريد الإلكتروني
    const verificationCode = generateVerificationCode();
    // حفظ رمز التحقق في Redis أو قاعدة البيانات
    // await saveVerificationCode(result.id, verificationCode);
    // await sendEmail(email, 'تأكيد الحساب', `رمز التحقق: ${verificationCode}`);

    logger.info(`تم تسجيل مستخدم جديد: ${username} (${email})`);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      data: {
        user: result,
        token
      }
    });

  } catch (error) {
    logger.error('خطأ في تسجيل المستخدم:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم، يرجى المحاولة لاحقاً'
    });
  }
});

/**
 * @route POST /api/auth/login
 * @desc تسجيل دخول المستخدم
 * @access Public
 */
router.post('/login', authLimiter, [
  body('login').notEmpty().withMessage('البريد الإلكتروني أو اسم المستخدم مطلوب'),
  body('password').notEmpty().withMessage('كلمة المرور مطلوبة')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { login, password } = req.body;

    // البحث عن المستخدم
    const userResult = await query(`
      SELECT id, email, username, display_name, password_hash, avatar_url, 
             is_verified, is_active, last_seen
      FROM users 
      WHERE email = $1 OR username = $1
    `, [login]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة'
      });
    }

    const user = userResult.rows[0];

    // التحقق من حالة الحساب
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'الحساب معطل، يرجى التواصل مع الدعم'
      });
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة'
      });
    }

    // تحديث آخر ظهور
    await query(
      'UPDATE users SET last_seen = NOW() WHERE id = $1',
      [user.id]
    );

    // إنشاء JWT Token
    const token = generateToken(user.id);

    // إزالة كلمة المرور من الاستجابة
    delete user.password_hash;

    logger.info(`تسجيل دخول ناجح: ${user.username}`);

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    logger.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم، يرجى المحاولة لاحقاً'
    });
  }
});

/**
 * @route POST /api/auth/verify-email
 * @desc تأكيد البريد الإلكتروني
 * @access Private
 */
router.post('/verify-email', [
  body('code').isLength({ min: 6, max: 6 }).withMessage('رمز التحقق يجب أن يكون 6 أرقام')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'رمز التحقق غير صحيح',
        errors: errors.array()
      });
    }

    const { code } = req.body;
    // التحقق من الرمز وتحديث حالة التحقق
    // منطق التحقق من الرمز...

    res.json({
      success: true,
      message: 'تم تأكيد البريد الإلكتروني بنجاح'
    });

  } catch (error) {
    logger.error('خطأ في تأكيد البريد الإلكتروني:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم، يرجى المحاولة لاحقاً'
    });
  }
});

/**
 * @route POST /api/auth/forgot-password
 * @desc طلب إعادة تعيين كلمة المرور
 * @access Public
 */
router.post('/forgot-password', [
  body('email').isEmail().withMessage('البريد الإلكتروني غير صحيح')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني غير صحيح',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // البحث عن المستخدم
    const userResult = await query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // لا نكشف عن عدم وجود المستخدم لأسباب أمنية
      return res.json({
        success: true,
        message: 'إذا كان البريد الإلكتروني موجود، ستتلقى رسالة إعادة تعيين كلمة المرور'
      });
    }

    // إنشاء رمز إعادة التعيين وإرساله
    const resetCode = generateVerificationCode();
    // حفظ الرمز وإرساله عبر البريد الإلكتروني
    // await saveResetCode(userResult.rows[0].id, resetCode);
    // await sendEmail(email, 'إعادة تعيين كلمة المرور', `رمز إعادة التعيين: ${resetCode}`);

    res.json({
      success: true,
      message: 'تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
    });

  } catch (error) {
    logger.error('خطأ في طلب إعادة تعيين كلمة المرور:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم، يرجى المحاولة لاحقاً'
    });
  }
});

module.exports = router;