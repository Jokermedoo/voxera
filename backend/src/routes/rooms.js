const express = require('express');
const { body, query: queryValidator, validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { authenticateToken, requireOwnership, optionalAuth } = require('../middleware/auth');
const { generateAgoraToken } = require('../utils/agora');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route GET /api/rooms
 * @desc الحصول على قائمة الغرف النشطة
 * @access Public
 */
router.get('/', [
  queryValidator('page').optional().isInt({ min: 1 }).withMessage('رقم الصفحة يجب أن يكون رقم موجب'),
  queryValidator('limit').optional().isInt({ min: 1, max: 50 }).withMessage('حد النتائج يجب أن يكون بين 1-50'),
  queryValidator('type').optional().isIn(['public', 'private']).withMessage('نوع الغرفة غير صحيح'),
  queryValidator('mode').optional().isIn(['conversation', 'music', 'podcast', 'broadcast']).withMessage('وضع الصوت غير صحيح')
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'معاملات البحث غير صحيحة',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const roomType = req.query.type;
    const audioMode = req.query.mode;
    const search = req.query.search;

    // بناء الاستعلام
    let whereConditions = ['r.is_active = true'];
    let queryParams = [];
    let paramIndex = 1;

    if (roomType) {
      whereConditions.push(`r.room_type = $${paramIndex}`);
      queryParams.push(roomType);
      paramIndex++;
    }

    if (audioMode) {
      whereConditions.push(`r.audio_mode = $${paramIndex}`);
      queryParams.push(audioMode);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(r.title ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // إضافة معاملات الترقيم
    queryParams.push(limit, offset);

    const roomsResult = await query(`
      SELECT 
        r.id, r.title, r.description, r.room_type, r.audio_mode,
        r.max_participants, r.current_participants, r.background_image,
        r.tags, r.language, r.created_at,
        u.id as host_id, u.username as host_username, 
        u.display_name as host_display_name, u.avatar_url as host_avatar,
        u.is_verified as host_verified,
        COUNT(rp.id) as participant_count
      FROM rooms r
      JOIN users u ON r.host_id = u.id
      LEFT JOIN room_participants rp ON r.id = rp.room_id AND rp.left_at IS NULL
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY r.id, u.id
      ORDER BY r.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, queryParams);

    // حساب العدد الإجمالي
    const countResult = await query(`
      SELECT COUNT(DISTINCT r.id) as total
      FROM rooms r
      JOIN users u ON r.host_id = u.id
      WHERE ${whereConditions.join(' AND ')}
    `, queryParams.slice(0, -2)); // إزالة limit و offset

    const rooms = roomsResult.rows.map(room => ({
      id: room.id,
      title: room.title,
      description: room.description,
      room_type: room.room_type,
      audio_mode: room.audio_mode,
      max_participants: room.max_participants,
      current_participants: parseInt(room.participant_count),
      background_image: room.background_image,
      tags: room.tags,
      language: room.language,
      created_at: room.created_at,
      host: {
        id: room.host_id,
        username: room.host_username,
        display_name: room.host_display_name,
        avatar_url: room.host_avatar,
        is_verified: room.host_verified
      }
    }));

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        rooms,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_items: total,
          items_per_page: limit
        }
      }
    });

  } catch (error) {
    logger.error('خطأ في جلب الغرف:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم، يرجى المحاولة لاحقاً'
    });
  }
});

/**
 * @route POST /api/rooms
 * @desc إنشاء غرفة جديدة
 * @access Private
 */
router.post('/', authenticateToken, [
  body('title').isLength({ min: 3, max: 200 }).withMessage('عنوان الغرفة يجب أن يكون بين 3-200 حرف'),
  body('description').optional().isLength({ max: 1000 }).withMessage('وصف الغرفة يجب أن يكون أقل من 1000 حرف'),
  body('room_type').isIn(['public', 'private']).withMessage('نوع الغرفة يجب أن يكون public أو private'),
  body('audio_mode').isIn(['conversation', 'music', 'podcast', 'broadcast']).withMessage('وضع الصوت غير صحيح'),
  body('max_participants').optional().isInt({ min: 2, max: 1000 }).withMessage('عدد المشاركين يجب أن يكون بين 2-1000'),
  body('tags').optional().isArray().withMessage('العلامات يجب أن تكون مصفوفة')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'بيانات الغرفة غير صحيحة',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      room_type,
      audio_mode,
      max_participants = 50,
      background_image,
      tags = [],
      language = 'ar'
    } = req.body;

    // إنشاء اسم قناة Agora فريد
    const agoraChannelName = `voxera_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const result = await transaction(async (client) => {
      // إنشاء الغرفة
      const roomResult = await client.query(`
        INSERT INTO rooms (
          title, description, host_id, room_type, audio_mode,
          max_participants, background_image, tags, language, agora_channel_name
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        title, description, req.user.id, room_type, audio_mode,
        max_participants, background_image, tags, language, agoraChannelName
      ]);

      const room = roomResult.rows[0];

      // إضافة المضيف كمشارك
      await client.query(`
        INSERT INTO room_participants (room_id, user_id, role)
        VALUES ($1, $2, 'host')
      `, [room.id, req.user.id]);

      // تحديث عدد المشاركين
      await client.query(`
        UPDATE rooms SET current_participants = 1 WHERE id = $1
      `, [room.id]);

      return room;
    });

    // إنشاء Agora Token للمضيف
    const agoraToken = generateAgoraToken(agoraChannelName, req.user.id, 'host');

    logger.info(`تم إنشاء غرفة جديدة: ${title} بواسطة ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الغرفة بنجاح',
      data: {
        room: {
          ...result,
          host: {
            id: req.user.id,
            username: req.user.username,
            display_name: req.user.display_name,
            avatar_url: req.user.avatar_url,
            is_verified: req.user.is_verified
          }
        },
        agora_token: agoraToken,
        agora_channel: agoraChannelName
      }
    });

  } catch (error) {
    logger.error('خطأ في إنشاء الغرفة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم، يرجى المحاولة لاحقاً'
    });
  }
});

/**
 * @route GET /api/rooms/:id
 * @desc الحصول على تفاصيل غرفة محددة
 * @access Public
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const roomId = req.params.id;

    // جلب تفاصيل الغرفة
    const roomResult = await query(`
      SELECT 
        r.*, 
        u.id as host_id, u.username as host_username,
        u.display_name as host_display_name, u.avatar_url as host_avatar,
        u.is_verified as host_verified
      FROM rooms r
      JOIN users u ON r.host_id = u.id
      WHERE r.id = $1
    `, [roomId]);

    if (roomResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الغرفة غير موجودة'
      });
    }

    const room = roomResult.rows[0];

    // التحقق من صلاحية الوصول للغرف الخاصة
    if (room.room_type === 'private' && req.user) {
      const participantResult = await query(`
        SELECT id FROM room_participants 
        WHERE room_id = $1 AND user_id = $2
      `, [roomId, req.user.id]);

      if (participantResult.rows.length === 0 && room.host_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'هذه غرفة خاصة، تحتاج دعوة للدخول'
        });
      }
    }

    // جلب المشاركين
    const participantsResult = await query(`
      SELECT 
        rp.id, rp.role, rp.is_muted, rp.is_speaking, rp.joined_at,
        u.id as user_id, u.username, u.display_name, u.avatar_url, u.is_verified
      FROM room_participants rp
      JOIN users u ON rp.user_id = u.id
      WHERE rp.room_id = $1 AND rp.left_at IS NULL
      ORDER BY rp.joined_at ASC
    `, [roomId]);

    const roomData = {
      id: room.id,
      title: room.title,
      description: room.description,
      room_type: room.room_type,
      audio_mode: room.audio_mode,
      max_participants: room.max_participants,
      current_participants: room.current_participants,
      is_active: room.is_active,
      background_image: room.background_image,
      tags: room.tags,
      language: room.language,
      created_at: room.created_at,
      host: {
        id: room.host_id,
        username: room.host_username,
        display_name: room.host_display_name,
        avatar_url: room.host_avatar,
        is_verified: room.host_verified
      },
      participants: participantsResult.rows.map(p => ({
        id: p.id,
        role: p.role,
        is_muted: p.is_muted,
        is_speaking: p.is_speaking,
        joined_at: p.joined_at,
        user: {
          id: p.user_id,
          username: p.username,
          display_name: p.display_name,
          avatar_url: p.avatar_url,
          is_verified: p.is_verified
        }
      }))
    };

    res.json({
      success: true,
      data: roomData
    });

  } catch (error) {
    logger.error('خطأ في جلب تفاصيل الغرفة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم، يرجى المحاولة لاحقاً'
    });
  }
});

/**
 * @route POST /api/rooms/:id/join
 * @desc الانضمام إلى غرفة
 * @access Private
 */
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.user.id;

    // التحقق من وجود الغرفة وحالتها
    const roomResult = await query(`
      SELECT id, title, room_type, max_participants, current_participants, 
             is_active, agora_channel_name, host_id
      FROM rooms 
      WHERE id = $1
    `, [roomId]);

    if (roomResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'الغرفة غير موجودة'
      });
    }

    const room = roomResult.rows[0];

    if (!room.is_active) {
      return res.status(400).json({
        success: false,
        message: 'الغرفة غير نشطة'
      });
    }

    // التحقق من عدم تجاوز الحد الأقصى للمشاركين
    if (room.current_participants >= room.max_participants) {
      return res.status(400).json({
        success: false,
        message: 'الغرفة ممتلئة'
      });
    }

    // التحقق من عدم وجود المستخدم في الغرفة مسبقاً
    const existingParticipant = await query(`
      SELECT id FROM room_participants 
      WHERE room_id = $1 AND user_id = $2 AND left_at IS NULL
    `, [roomId, userId]);

    if (existingParticipant.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'أنت موجود في الغرفة بالفعل'
      });
    }

    const result = await transaction(async (client) => {
      // إضافة المشارك
      const participantResult = await client.query(`
        INSERT INTO room_participants (room_id, user_id, role)
        VALUES ($1, $2, 'listener')
        RETURNING *
      `, [roomId, userId]);

      // تحديث عدد المشاركين
      await client.query(`
        UPDATE rooms 
        SET current_participants = current_participants + 1 
        WHERE id = $1
      `, [roomId]);

      return participantResult.rows[0];
    });

    // إنشاء Agora Token للمشارك
    const agoraToken = generateAgoraToken(room.agora_channel_name, userId, 'listener');

    logger.info(`انضم ${req.user.username} إلى الغرفة: ${room.title}`);

    res.json({
      success: true,
      message: 'تم الانضمام إلى الغرفة بنجاح',
      data: {
        participant: result,
        agora_token: agoraToken,
        agora_channel: room.agora_channel_name
      }
    });

  } catch (error) {
    logger.error('خطأ في الانضمام إلى الغرفة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم، يرجى المحاولة لاحقاً'
    });
  }
});

/**
 * @route POST /api/rooms/:id/leave
 * @desc مغادرة الغرفة
 * @access Private
 */
router.post('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.user.id;

    // التحقق من وجود المشارك في الغرفة
    const participantResult = await query(`
      SELECT id, role FROM room_participants 
      WHERE room_id = $1 AND user_id = $2 AND left_at IS NULL
    `, [roomId, userId]);

    if (participantResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'أنت لست في هذه الغرفة'
      });
    }

    const participant = participantResult.rows[0];

    await transaction(async (client) => {
      // تحديث وقت المغادرة
      await client.query(`
        UPDATE room_participants 
        SET left_at = NOW() 
        WHERE id = $1
      `, [participant.id]);

      // تقليل عدد المشاركين
      await client.query(`
        UPDATE rooms 
        SET current_participants = current_participants - 1 
        WHERE id = $1
      `, [roomId]);

      // إذا كان المضيف، إنهاء الغرفة أو نقل الاستضافة
      if (participant.role === 'host') {
        // البحث عن مضيف مساعد لنقل الاستضافة
        const coHostResult = await client.query(`
          SELECT id, user_id FROM room_participants 
          WHERE room_id = $1 AND role = 'co-host' AND left_at IS NULL
          ORDER BY joined_at ASC
          LIMIT 1
        `, [roomId]);

        if (coHostResult.rows.length > 0) {
          // نقل الاستضافة للمضيف المساعد
          await client.query(`
            UPDATE room_participants 
            SET role = 'host' 
            WHERE id = $1
          `, [coHostResult.rows[0].id]);

          await client.query(`
            UPDATE rooms 
            SET host_id = $1 
            WHERE id = $2
          `, [coHostResult.rows[0].user_id, roomId]);
        } else {
          // إنهاء الغرفة إذا لم يوجد مضيف مساعد
          await client.query(`
            UPDATE rooms 
            SET is_active = false 
            WHERE id = $1
          `, [roomId]);
        }
      }
    });

    logger.info(`غادر ${req.user.username} الغرفة: ${roomId}`);

    res.json({
      success: true,
      message: 'تم مغادرة الغرفة بنجاح'
    });

  } catch (error) {
    logger.error('خطأ في مغادرة الغرفة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم، يرجى المحاولة لاحقاً'
    });
  }
});

module.exports = router;