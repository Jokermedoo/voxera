const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const roomRoutes = require('./routes/rooms');
const giftRoutes = require('./routes/gifts');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

const socketHandler = require('./socket/socketHandler');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// الأمان والحماية
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// ضغط الاستجابات
app.use(compression());

// تسجيل الطلبات
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// تحديد معدل الطلبات
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // حد أقصى 100 طلب لكل IP
  message: 'تم تجاوز الحد الأقصى للطلبات، يرجى المحاولة لاحقاً'
});
app.use('/api/', limiter);

// معالجة البيانات
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// الصحة العامة للخادم
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// المسارات الأساسية
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// معالجة Socket.IO
socketHandler(io);

// معالجة الأخطاء
app.use(errorHandler);

// معالجة المسارات غير الموجودة
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'المسار المطلوب غير موجود'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`🚀 خادم Voxera يعمل على المنفذ ${PORT}`);
  logger.info(`🌍 البيئة: ${process.env.NODE_ENV || 'development'}`);
});

// معالجة إغلاق الخادم بشكل آمن
process.on('SIGTERM', () => {
  logger.info('تم استلام إشارة SIGTERM، جاري إغلاق الخادم...');
  server.close(() => {
    logger.info('تم إغلاق الخادم بنجاح');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('تم استلام إشارة SIGINT، جاري إغلاق الخادم...');
  server.close(() => {
    logger.info('تم إغلاق الخادم بنجاح');
    process.exit(0);
  });
});

module.exports = app;