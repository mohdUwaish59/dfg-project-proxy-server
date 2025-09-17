// Simple JWT-based authentication for Vercel serverless functions
const crypto = require('crypto');

const JWT_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Simple JWT implementation (for basic use)
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
        
        console.log('✅ JWT token verified:', payload);
        return payload;
    } catch (error) {
        console.error('❌ JWT verification error:', error);
        return null;
    }
}

function setAuthCookie(res, payload) {
    const token = createToken(payload);
    res.cookie('auth-token', token, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        maxAge: JWT_EXPIRY,
        sameSite: 'lax'
    });
    console.log('✅ Auth cookie set');
}

function clearAuthCookie(res) {
    res.clearCookie('auth-token');
    console.log('✅ Auth cookie cleared');
}

function requireAuth(req, res, next) {
    const token = req.cookies['auth-token'];
    const payload = verifyToken(token);
    
    if (!payload) {
        console.log('❌ Authentication required');
        return res.status(401).json({ error: 'Unauthorized - Admin login required' });
    }
    
    // Add user info to request
    req.user = payload;
    req.isAuthenticated = true;
    console.log('✅ User authenticated:', payload.username);
    next();
}

module.exports = {
    createToken,
    verifyToken,
    setAuthCookie,
    clearAuthCookie,
    requireAuth
};