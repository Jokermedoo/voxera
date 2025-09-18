const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * معالج Socket.IO للاتصالات المباشرة
 */
const socketHandler = (io) => {
  // Middleware للمصادقة
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'voxera-secret-key');
      
      const userResult = await query(`
        SELECT id, username, display_name, avatar_url, is_verified
        FROM users 
        WHERE id = $1 AND is_active = true
      `, [decoded.userId]);

      if (userResult.rows.length === 0) {
        return next(new Error('User not found'));
      }

      socket.user = userResult.rows[0];
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`مستخدم متصل: ${socket.user.username} (${socket.id})`);

    // الانضمام إلى غرفة
    socket.on('join-room', async (data) => {
      try {
        const { roomId } = data;

        // التحقق من صلاحية الانضمام للغرفة
        const participantResult = await query(`
          SELECT rp.id, rp.role, r.title
          FROM room_participants rp
          JOIN rooms r ON rp.room_id = r.id
          WHERE rp.room_id = $1 AND rp.user_id = $2 AND rp.left_at IS NULL
        `, [roomId, socket.user.id]);

        if (participantResult.rows.length === 0) {
          socket.emit('error', { message: 'غير مصرح لك بالدخول لهذه الغرفة' });
          return;
        }

        const participant = participantResult.rows[0];
        
        // الانضمام لغرفة Socket.IO
        socket.join(roomId);
        socket.currentRoom = roomId;
        socket.participantRole = participant.role;

        // إشعار باقي المشاركين
        socket.to(roomId).emit('user-joined', {
          user: {
            id: socket.user.id,
            username: socket.user.username,
            display_name: socket.user.display_name,
            avatar_url: socket.user.avatar_url,
            is_verified: socket.user.is_verified
          },
          role: participant.role
        });

        socket.emit('joined-room', {
          roomId,
          roomTitle: participant.title,
          role: participant.role
        });

        logger.info(`${socket.user.username} انضم للغرفة: ${roomId}`);

      } catch (error) {
        logger.error('خطأ في الانضمام للغرفة:', error);
        socket.emit('error', { message: 'خطأ في الانضمام للغرفة' });
      }
    });

    // مغادرة الغرفة
    socket.on('leave-room', async (data) => {
      try {
        const { roomId } = data;
        
        if (socket.currentRoom === roomId) {
          socket.leave(roomId);
          
          // إشعار باقي المشاركين
          socket.to(roomId).emit('user-left', {
            userId: socket.user.id,
            username: socket.user.username
          });

          socket.currentRoom = null;
          socket.participantRole = null;

          logger.info(`${socket.user.username} غادر الغرفة: ${roomId}`);
        }

      } catch (error) {
        logger.error('خطأ في مغادرة الغرفة:', error);
      }
    });

    // إرسال رسالة نصية
    socket.on('send-message', async (data) => {
      try {
        const { roomId, message } = data;

        if (socket.currentRoom !== roomId) {
          socket.emit('error', { message: 'يجب الانضمام للغرفة أولاً' });
          return;
        }

        // حفظ الرسالة في قاعدة البيانات
        const messageResult = await query(`
          INSERT INTO messages (room_id, user_id, message, message_type)
          VALUES ($1, $2, $3, 'text')
          RETURNING id, created_at
        `, [roomId, socket.user.id, message]);

        const messageData = {
          id: messageResult.rows[0].id,
          message,
          user: {
            id: socket.user.id,
            username: socket.user.username,
            display_name: socket.user.display_name,
            avatar_url: socket.user.avatar_url,
            is_verified: socket.user.is_verified
          },
          created_at: messageResult.rows[0].created_at
        };

        // إرسال الرسالة لجميع المشاركين
        io.to(roomId).emit('new-message', messageData);

      } catch (error) {
        logger.error('خطأ في إرسال الرسالة:', error);
        socket.emit('error', { message: 'خطأ في إرسال الرسالة' });
      }
    });

    // تحديث حالة الصوت
    socket.on('audio-state-change', async (data) => {
      try {
        const { roomId, isMuted, isSpeaking } = data;

        if (socket.currentRoom !== roomId) {
          return;
        }

        // تحديث حالة الصوت في قاعدة البيانات
        await query(`
          UPDATE room_participants 
          SET is_muted = $1, is_speaking = $2
          WHERE room_id = $3 AND user_id = $4 AND left_at IS NULL
        `, [isMuted, isSpeaking, roomId, socket.user.id]);

        // إشعار باقي المشاركين
        socket.to(roomId).emit('user-audio-change', {
          userId: socket.user.id,
          isMuted,
          isSpeaking
        });

      } catch (error) {
        logger.error('خطأ في تحديث حالة الصوت:', error);
      }
    });

    // إرسال هدية
    socket.on('send-gift', async (data) => {
      try {
        const { roomId, giftId, recipientId, quantity = 1 } = data;

        if (socket.currentRoom !== roomId) {
          socket.emit('error', { message: 'يجب الانضمام للغرفة أولاً' });
          return;
        }

        // التحقق من الهدية والمستلم
        const giftResult = await query(`
          SELECT id, name, icon_url, price FROM gifts WHERE id = $1
        `, [giftId]);

        const recipientResult = await query(`
          SELECT u.id, u.username, u.display_name, u.avatar_url
          FROM users u
          JOIN room_participants rp ON u.id = rp.user_id
          WHERE u.id = $1 AND rp.room_id = $2 AND rp.left_at IS NULL
        `, [recipientId, roomId]);

        if (giftResult.rows.length === 0 || recipientResult.rows.length === 0) {
          socket.emit('error', { message: 'الهدية أو المستلم غير صحيح' });
          return;
        }

        const gift = giftResult.rows[0];
        const recipient = recipientResult.rows[0];
        const totalPrice = gift.price * quantity;

        // حفظ معاملة الهدية
        const transactionResult = await query(`
          INSERT INTO gift_transactions (gift_id, sender_id, receiver_id, room_id, quantity, total_price)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, created_at
        `, [giftId, socket.user.id, recipientId, roomId, quantity, totalPrice]);

        const giftData = {
          id: transactionResult.rows[0].id,
          gift: {
            id: gift.id,
            name: gift.name,
            icon_url: gift.icon_url
          },
          sender: {
            id: socket.user.id,
            username: socket.user.username,
            display_name: socket.user.display_name,
            avatar_url: socket.user.avatar_url
          },
          recipient,
          quantity,
          total_price: totalPrice,
          created_at: transactionResult.rows[0].created_at
        };

        // إرسال إشعار الهدية لجميع المشاركين
        io.to(roomId).emit('gift-sent', giftData);

        // حفظ رسالة نظام عن الهدية
        await query(`
          INSERT INTO messages (room_id, user_id, message, message_type, metadata)
          VALUES ($1, $2, $3, 'gift', $4)
        `, [
          roomId, 
          socket.user.id, 
          `أرسل ${gift.name} إلى ${recipient.display_name}`,
          JSON.stringify(giftData)
        ]);

      } catch (error) {
        logger.error('خطأ في إرسال الهدية:', error);
        socket.emit('error', { message: 'خطأ في إرسال الهدية' });
      }
    });

    // إدارة المشاركين (للمضيفين فقط)
    socket.on('manage-participant', async (data) => {
      try {
        const { roomId, participantId, action } = data;

        if (socket.currentRoom !== roomId) {
          return;
        }

        // التحقق من صلاحيات الإدارة
        if (!['host', 'co-host'].includes(socket.participantRole)) {
          socket.emit('error', { message: 'ليس لديك صلاحية لإدارة المشاركين' });
          return;
        }

        let updateQuery = '';
        let updateParams = [];

        switch (action) {
          case 'mute':
            updateQuery = 'UPDATE room_participants SET is_muted = true WHERE id = $1';
            updateParams = [participantId];
            break;
          case 'unmute':
            updateQuery = 'UPDATE room_participants SET is_muted = false WHERE id = $1';
            updateParams = [participantId];
            break;
          case 'promote-speaker':
            updateQuery = 'UPDATE room_participants SET role = $1 WHERE id = $2';
            updateParams = ['speaker', participantId];
            break;
          case 'demote-listener':
            updateQuery = 'UPDATE room_participants SET role = $1 WHERE id = $2';
            updateParams = ['listener', participantId];
            break;
          case 'kick':
            updateQuery = 'UPDATE room_participants SET left_at = NOW() WHERE id = $1';
            updateParams = [participantId];
            break;
          default:
            socket.emit('error', { message: 'إجراء غير صحيح' });
            return;
        }

        await query(updateQuery, updateParams);

        // إشعار جميع المشاركين بالتغيير
        io.to(roomId).emit('participant-managed', {
          participantId,
          action,
          managedBy: socket.user.id
        });

      } catch (error) {
        logger.error('خطأ في إدارة المشارك:', error);
        socket.emit('error', { message: 'خطأ في إدارة المشارك' });
      }
    });

    // قطع الاتصال
    socket.on('disconnect', () => {
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('user-left', {
          userId: socket.user.id,
          username: socket.user.username
        });
      }
      
      logger.info(`مستخدم منقطع: ${socket.user.username} (${socket.id})`);
    });
  });
};

module.exports = socketHandler;