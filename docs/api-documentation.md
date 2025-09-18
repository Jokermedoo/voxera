# وثائق API - Voxera

## نظرة عامة
هذا الدليل يوضح جميع نقاط النهاية (Endpoints) المتاحة في API الخاص بتطبيق Voxera.

## المصادقة
جميع الطلبات المحمية تتطلب رمز JWT في رأس Authorization:
```
Authorization: Bearer <your-jwt-token>
```

## الاستجابات العامة

### استجابة ناجحة
```json
{
  "success": true,
  "message": "رسالة النجاح",
  "data": {
    // البيانات المطلوبة
  }
}
```

### استجابة خطأ
```json
{
  "success": false,
  "message": "رسالة الخطأ",
  "errors": [
    // تفاصيل الأخطاء (اختياري)
  ]
}
```

## نقاط النهاية

### 1. المصادقة (Authentication)

#### تسجيل مستخدم جديد
```http
POST /api/auth/register
```

**المعاملات:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "display_name": "الاسم المعروض",
  "password": "password123",
  "phone": "+1234567890", // اختياري
  "bio": "نبذة شخصية", // اختياري
  "country": "السعودية", // اختياري
  "city": "الرياض" // اختياري
}
```

**الاستجابة:**
```json
{
  "success": true,
  "message": "تم إنشاء الحساب بنجاح",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "display_name": "الاسم المعروض",
      "avatar_url": null,
      "is_verified": false,
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": "jwt-token"
  }
}
```

#### تسجيل الدخول
```http
POST /api/auth/login
```

**المعاملات:**
```json
{
  "login": "username_or_email",
  "password": "password123"
}
```

#### طلب إعادة تعيين كلمة المرور
```http
POST /api/auth/forgot-password
```

**المعاملات:**
```json
{
  "email": "user@example.com"
}
```

#### تأكيد البريد الإلكتروني
```http
POST /api/auth/verify-email
```

**المعاملات:**
```json
{
  "code": "123456"
}
```

### 2. المستخدمون (Users)

#### الحصول على الملف الشخصي
```http
GET /api/users/profile
```
*يتطلب مصادقة*

#### تحديث الملف الشخصي
```http
PUT /api/users/profile
```
*يتطلب مصادقة*

**المعاملات:**
```json
{
  "display_name": "الاسم الجديد",
  "bio": "نبذة محدثة",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

#### البحث عن المستخدمين
```http
GET /api/users/search?q=البحث&page=1&limit=20
```

#### متابعة مستخدم
```http
POST /api/users/:userId/follow
```
*يتطلب مصادقة*

#### إلغاء متابعة مستخدم
```http
DELETE /api/users/:userId/follow
```
*يتطلب مصادقة*

### 3. الغرف (Rooms)

#### الحصول على قائمة الغرف
```http
GET /api/rooms?page=1&limit=20&type=public&mode=conversation&search=البحث
```

**معاملات الاستعلام:**
- `page`: رقم الصفحة (افتراضي: 1)
- `limit`: عدد النتائج (افتراضي: 20، أقصى: 50)
- `type`: نوع الغرفة (`public`, `private`)
- `mode`: وضع الصوت (`conversation`, `music`, `podcast`, `broadcast`)
- `search`: نص البحث

**الاستجابة:**
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": "uuid",
        "title": "عنوان الغرفة",
        "description": "وصف الغرفة",
        "room_type": "public",
        "audio_mode": "conversation",
        "max_participants": 50,
        "current_participants": 12,
        "background_image": "https://example.com/bg.jpg",
        "tags": ["تقنية", "برمجة"],
        "language": "ar",
        "created_at": "2024-01-01T00:00:00Z",
        "host": {
          "id": "uuid",
          "username": "host_user",
          "display_name": "المضيف",
          "avatar_url": "https://example.com/avatar.jpg",
          "is_verified": true
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 100,
      "items_per_page": 20
    }
  }
}
```

#### إنشاء غرفة جديدة
```http
POST /api/rooms
```
*يتطلب مصادقة*

**المعاملات:**
```json
{
  "title": "عنوان الغرفة",
  "description": "وصف الغرفة",
  "room_type": "public",
  "audio_mode": "conversation",
  "max_participants": 50,
  "background_image": "https://example.com/bg.jpg",
  "tags": ["تقنية", "برمجة"],
  "language": "ar"
}
```

#### الحصول على تفاصيل غرفة
```http
GET /api/rooms/:roomId
```

#### الانضمام إلى غرفة
```http
POST /api/rooms/:roomId/join
```
*يتطلب مصادقة*

**الاستجابة:**
```json
{
  "success": true,
  "message": "تم الانضمام إلى الغرفة بنجاح",
  "data": {
    "participant": {
      "id": "uuid",
      "role": "listener",
      "is_muted": false,
      "joined_at": "2024-01-01T00:00:00Z"
    },
    "agora_token": "agora-rtc-token",
    "agora_channel": "channel-name"
  }
}
```

#### مغادرة الغرفة
```http
POST /api/rooms/:roomId/leave
```
*يتطلب مصادقة*

#### تحديث إعدادات الغرفة
```http
PUT /api/rooms/:roomId
```
*يتطلب مصادقة وملكية الغرفة*

#### حذف الغرفة
```http
DELETE /api/rooms/:roomId
```
*يتطلب مصادقة وملكية الغرفة*

### 4. الهدايا (Gifts)

#### الحصول على قائمة الهدايا
```http
GET /api/gifts
```

**الاستجابة:**
```json
{
  "success": true,
  "data": {
    "gifts": [
      {
        "id": "uuid",
        "name": "قلب",
        "name_ar": "قلب",
        "icon_url": "https://example.com/heart.png",
        "animation_url": "https://example.com/heart.json",
        "price": 10,
        "category": "emotions"
      }
    ]
  }
}
```

#### إرسال هدية
```http
POST /api/gifts/send
```
*يتطلب مصادقة*

**المعاملات:**
```json
{
  "gift_id": "uuid",
  "receiver_id": "uuid",
  "room_id": "uuid",
  "quantity": 1
}
```

### 5. الإشعارات (Notifications)

#### الحصول على الإشعارات
```http
GET /api/notifications?page=1&limit=20&unread_only=false
```
*يتطلب مصادقة*

#### تحديد إشعار كمقروء
```http
PUT /api/notifications/:notificationId/read
```
*يتطلب مصادقة*

#### تحديد جميع الإشعارات كمقروءة
```http
PUT /api/notifications/read-all
```
*يتطلب مصادقة*

### 6. الإدارة (Admin)

#### إحصائيات عامة
```http
GET /api/admin/stats
```
*يتطلب صلاحيات إدارة*

#### إدارة المستخدمين
```http
GET /api/admin/users?page=1&limit=20&search=البحث
PUT /api/admin/users/:userId/status
DELETE /api/admin/users/:userId
```
*يتطلب صلاحيات إدارة*

#### إدارة الغرف
```http
GET /api/admin/rooms?page=1&limit=20
PUT /api/admin/rooms/:roomId/status
DELETE /api/admin/rooms/:roomId
```
*يتطلب صلاحيات إدارة*

#### البلاغات
```http
GET /api/admin/reports?page=1&limit=20&status=pending
PUT /api/admin/reports/:reportId/resolve
```
*يتطلب صلاحيات إدارة*

## أحداث Socket.IO

### الاتصال
```javascript
// المصادقة
socket.auth = { token: 'your-jwt-token' };
socket.connect();
```

### الأحداث المرسلة من العميل

#### الانضمام لغرفة
```javascript
socket.emit('join-room', { roomId: 'uuid' });
```

#### مغادرة الغرفة
```javascript
socket.emit('leave-room', { roomId: 'uuid' });
```

#### إرسال رسالة
```javascript
socket.emit('send-message', { 
  roomId: 'uuid', 
  message: 'نص الرسالة' 
});
```

#### تحديث حالة الصوت
```javascript
socket.emit('audio-state-change', { 
  roomId: 'uuid', 
  isMuted: false, 
  isSpeaking: true 
});
```

#### إرسال هدية
```javascript
socket.emit('send-gift', { 
  roomId: 'uuid', 
  giftId: 'uuid', 
  recipientId: 'uuid', 
  quantity: 1 
});
```

### الأحداث المستلمة من الخادم

#### تأكيد الانضمام
```javascript
socket.on('joined-room', (data) => {
  console.log('انضممت للغرفة:', data);
});
```

#### مستخدم جديد انضم
```javascript
socket.on('user-joined', (data) => {
  console.log('مستخدم جديد:', data.user);
});
```

#### مستخدم غادر
```javascript
socket.on('user-left', (data) => {
  console.log('مستخدم غادر:', data.userId);
});
```

#### رسالة جديدة
```javascript
socket.on('new-message', (data) => {
  console.log('رسالة جديدة:', data);
});
```

#### هدية مرسلة
```javascript
socket.on('gift-sent', (data) => {
  console.log('هدية مرسلة:', data);
});
```

#### تغيير حالة صوت مستخدم
```javascript
socket.on('user-audio-change', (data) => {
  console.log('تغيير صوت:', data);
});
```

#### خطأ
```javascript
socket.on('error', (data) => {
  console.error('خطأ:', data.message);
});
```

## رموز الحالة HTTP

- `200` - نجح الطلب
- `201` - تم إنشاء المورد بنجاح
- `400` - طلب غير صحيح
- `401` - غير مصادق
- `403` - غير مصرح
- `404` - المورد غير موجود
- `429` - تم تجاوز حد الطلبات
- `500` - خطأ في الخادم

## معدل الطلبات
- طلبات عامة: 100 طلب كل 15 دقيقة لكل IP
- طلبات المصادقة: 5 طلبات كل 15 دقيقة لكل IP
- طلبات الرسائل: 60 رسالة كل دقيقة لكل مستخدم

## أمثلة الاستخدام

### JavaScript/Node.js
```javascript
const axios = require('axios');

// تسجيل الدخول
const login = async () => {
  const response = await axios.post('http://localhost:5000/api/auth/login', {
    login: 'username',
    password: 'password123'
  });
  
  return response.data.data.token;
};

// جلب الغرف
const getRooms = async (token) => {
  const response = await axios.get('http://localhost:5000/api/rooms', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data.data.rooms;
};
```

### React Native
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// إضافة رمز المصادقة تلقائياً
api.interceptors.request.use((config) => {
  const token = getStoredToken(); // دالة للحصول على الرمز المحفوظ
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// استخدام API
const createRoom = async (roomData) => {
  const response = await api.post('/rooms', roomData);
  return response.data;
};
```