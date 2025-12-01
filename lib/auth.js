// Pure Next.js authentication module
const crypto = require('crypto');

const JWT_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Simple JWT implementation
function createToken(payload) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const now = Date.now();
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRY
  };
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  try {
    if (!token) return null;
    
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    
    if (signature !== expectedSignature) {
      console.log('❌ JWT signature verification failed');
      return null;
    }
    
    // Decode payload
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    
    // Check expiry
    if (payload.exp < Date.now()) {
      console.log('❌ JWT token expired');
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('❌ JWT verification error:', error);
    return null;
  }
}

function setAuthCookie(res, payload) {
  const token = createToken(payload);
  
  res.setHeader('Set-Cookie', [
    `auth-token=${token}; HttpOnly; Path=/; Max-Age=${JWT_EXPIRY / 1000}; SameSite=Lax`
  ]);
}

function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', [
    'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
  ]);
}

function getTokenFromRequest(req) {
  // Try to get token from cookies
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenMatch = cookies.match(/auth-token=([^;]+)/);
    if (tokenMatch) {
      return tokenMatch[1];
    }
  }
  return null;
}

function requireAuth(req) {
  const token = getTokenFromRequest(req);
  const user = verifyToken(token);
  
  if (!user) {
    console.log('❌ Authentication required');
    return null;
  }
  
  return user;
}

module.exports = {
  createToken,
  verifyToken,
  setAuthCookie,
  clearAuthCookie,
  getTokenFromRequest,
  requireAuth
};