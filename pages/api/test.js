// Simple test API route to verify deployment
export default function handler(req, res) {
  res.json({ 
    message: 'API is working!', 
    timestamp: new Date().toISOString(),
    method: req.method,
    mongodb: !!process.env.DATABASE_URL,
    sessionSecret: !!process.env.SESSION_SECRET
  });
}