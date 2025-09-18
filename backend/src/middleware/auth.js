const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Middleware للتحقق من صحة JWT Token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة مطلوب'
      });
    }

    // التحقق من صحة الرمز
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'voxera-secret-key');
    
    // التحقق من وجود المستخدم في قاعدة البيانات
    const userResult = await query(`
      SELECT id, email, username, display_name, avatar_url, 
             is_verified, is_active, last_seen
      FROM users 
      WHERE id = $1
    `, [decoded.userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة غير صحيح'
      });
    }

    const user = userResult.rows[0];

    // التحقق من حالة الحساب
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'الحساب معطل'
      });
    }

    // إضافة بيانات المستخدم إلى الطلب
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة غير صحيح'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'انتهت صلاحية رمز المصادقة'
      });
    }

    logger.error('خطأ في middleware المصادقة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

/**
 * Middleware للتحقق من صلاحيات الإدارة
 */
const requireAdmin = async (req, res, next) => {
  try {
    // التحقق من وجود المستخدم (يجب استدعاء authenticateToken أولاً)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'مطلوب تسجيل الدخول'
      });
    }

    // التحقق من صلاحيات الإدارة
    const adminResult = await query(`
      SELECT role FROM users WHERE id = $1 AND role IN ('admin', 'super_admin')
    `, [req.user.id]);

    if (adminResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول لهذا المورد'
      });
    }

    req.user.role = adminResult.rows[0].role;
    next();

  } catch (error) {
    logger.error('خطأ في middleware صلاحيات الإدارة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

/**
 * Middleware للتحقق من ملكية المورد
 */
const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      let ownershipQuery;

      switch (resourceType) {
        case 'room':
          ownershipQuery = 'SELECT host_id FROM rooms WHERE id = $1';
          break;
        case 'user':
          // المستخدم يملك ملفه الشخصي فقط
          if (req.params.id !== req.user.id) {
            return res.status(403).json({
              success: false,
              message: 'غير مصرح لك بتعديل هذا المورد'
            });
          }
          return next();
        default:
          return res.status(400).json({
            success: false,
            message: 'نوع المورد غير صحيح'
          });
      }

      const result = await query(ownershipQuery, [resourceId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'المورد غير موجود'
        });
      }

      const ownerId = result.rows[0].host_id || result.rows[0].user_id;
      
      if (ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح لك بتعديل هذا المورد'
        });
      }

      next();

    } catch (error) {
      logger.error('خطأ في middleware ملكية المورد:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في الخادم'
      });
    }
  };
};

/**
 * Middleware اختياري للمصادقة (لا يرفض الطلب إذا لم يكن هناك رمز)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // لا يوجد رمز، متابعة بدون مستخدم
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'voxera-secret-key');
    
    const userResult = await query(`
      SELECT id, email, username, display_name, avatar_url, 
             is_verified, is_active
      FROM users 
      WHERE id = $1 AND is_active = true
    `, [decoded.userId]);

    if (userResult.rows.length > 0) {
      req.user = userResult.rows[0];
    }

    next();

  } catch (error) {
    // في حالة الخطأ، نتابع بدون مستخدم
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnership,
  optionalAuth
};