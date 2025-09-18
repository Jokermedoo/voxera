const winston = require('winston');
const path = require('path');

// إنشاء مجلد السجلات إذا لم يكن موجوداً
const logsDir = path.join(__dirname, '../../logs');

// تكوين Winston Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'voxera-backend' },
  transports: [
    // كتابة جميع السجلات مع مستوى 'error' وأقل إلى error.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // كتابة جميع السجلات مع مستوى 'info' وأقل إلى combined.log
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// إذا لم نكن في بيئة الإنتاج، أضف سجل إلى وحدة التحكم
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
      })
    )
  }));
}

// دالة لتسجيل طلبات API
const logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    if (res.statusCode >= 400) {
      logger.error('HTTP Request Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

// دالة لتسجيل أخطاء قاعدة البيانات
const logDatabaseError = (error, query, params) => {
  logger.error('Database Error', {
    error: error.message,
    stack: error.stack,
    query: query,
    params: params
  });
};

// دالة لتسجيل أحداث Socket.IO
const logSocketEvent = (event, data, socketId) => {
  logger.info('Socket Event', {
    event,
    data,
    socketId
  });
};

// دالة لتسجيل أحداث المصادقة
const logAuthEvent = (event, userId, details) => {
  logger.info('Auth Event', {
    event,
    userId,
    details,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  logger,
  logRequest,
  logDatabaseError,
  logSocketEvent,
  logAuthEvent
};

// تصدير logger كـ default أيضاً
module.exports.default = logger;