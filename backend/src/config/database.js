const { Pool } = require('pg');
const logger = require('../utils/logger');

// إعداد اتصال قاعدة البيانات
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'voxera',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // الحد الأقصى للاتصالات
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// اختبار الاتصال
pool.on('connect', () => {
  logger.info('✅ تم الاتصال بقاعدة البيانات بنجاح');
});

pool.on('error', (err) => {
  logger.error('❌ خطأ في قاعدة البيانات:', err);
  process.exit(-1);
});

// دالة لتنفيذ الاستعلامات
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`تم تنفيذ الاستعلام في ${duration}ms`);
    return res;
  } catch (error) {
    logger.error('خطأ في تنفيذ الاستعلام:', error);
    throw error;
  }
};

// دالة للحصول على عميل من المجموعة
const getClient = async () => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    logger.error('خطأ في الحصول على عميل قاعدة البيانات:', error);
    throw error;
  }
};

// دالة لتنفيذ معاملة
const transaction = async (callback) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// دالة لإنشاء الجداول الأساسية
const createTables = async () => {
  try {
    // جدول المستخدمين
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE,
        username VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        bio TEXT,
        birth_date DATE,
        gender VARCHAR(10),
        country VARCHAR(50),
        city VARCHAR(50),
        is_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        last_seen TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // جدول الغرف
    await query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        room_type VARCHAR(20) NOT NULL CHECK (room_type IN ('public', 'private')),
        audio_mode VARCHAR(20) NOT NULL CHECK (audio_mode IN ('conversation', 'music', 'podcast', 'broadcast')),
        max_participants INTEGER DEFAULT 50,
        current_participants INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        is_recording BOOLEAN DEFAULT FALSE,
        background_image TEXT,
        tags TEXT[],
        language VARCHAR(10) DEFAULT 'ar',
        agora_channel_name VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // جدول المشاركين في الغرف
    await query(`
      CREATE TABLE IF NOT EXISTS room_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL CHECK (role IN ('host', 'co-host', 'speaker', 'listener')),
        is_muted BOOLEAN DEFAULT FALSE,
        is_speaking BOOLEAN DEFAULT FALSE,
        audio_quality VARCHAR(20) DEFAULT 'high',
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        left_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(room_id, user_id)
      )
    `);

    // باقي الجداول...
    logger.info('✅ تم إنشاء جميع الجداول بنجاح');
  } catch (error) {
    logger.error('❌ خطأ في إنشاء الجداول:', error);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  getClient,
  transaction,
  createTables
};