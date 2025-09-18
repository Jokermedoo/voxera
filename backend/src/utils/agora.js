const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

/**
 * إنشاء Agora Token للمصادقة
 */
const generateAgoraToken = (channelName, userId, role = 'listener') => {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  
  if (!appId || !appCertificate) {
    throw new Error('Agora credentials are not configured');
  }

  // تحديد دور المستخدم في Agora
  const agoraRole = role === 'host' || role === 'co-host' || role === 'speaker' 
    ? RtcRole.PUBLISHER 
    : RtcRole.SUBSCRIBER;

  // مدة صلاحية الرمز (24 ساعة)
  const expirationTimeInSeconds = 3600 * 24;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  // إنشاء الرمز
  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    userId,
    agoraRole,
    privilegeExpiredTs
  );

  return token;
};

/**
 * تجديد Agora Token
 */
const renewAgoraToken = (channelName, userId, role = 'listener') => {
  return generateAgoraToken(channelName, userId, role);
};

/**
 * التحقق من صحة معرف القناة
 */
const validateChannelName = (channelName) => {
  // قواعد Agora لأسماء القنوات
  const channelNameRegex = /^[a-zA-Z0-9_-]{1,64}$/;
  return channelNameRegex.test(channelName);
};

/**
 * إنشاء اسم قناة فريد
 */
const generateChannelName = (roomId) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `voxera_${roomId}_${timestamp}_${random}`;
};

module.exports = {
  generateAgoraToken,
  renewAgoraToken,
  validateChannelName,
  generateChannelName
};