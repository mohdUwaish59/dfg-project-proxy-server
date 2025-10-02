// Direct redirect endpoint for female participants
const { connectToDatabase } = require('../../../lib/database');

export default async function handler(req, res) {
  try {
    const db = await connectToDatabase();
    
    // Get redirect settings
    const settings = await db.collection('redirect_settings').findOne({ type: 'gender_redirect' });
    
    if (!settings || !settings.femaleRedirectUrl) {
      // Redirect to the female redirect page if no URL is configured
      return res.redirect(302, '/redirect/female');
    }
    
    // Log the redirect for analytics (optional)
    await db.collection('redirect_logs').insertOne({
      gender: 'female',
      redirected_to: settings.femaleRedirectUrl,
      timestamp: new Date(),
      user_agent: req.headers['user-agent'] || '',
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''
    });
    
    // Always redirect to the countdown page first
    res.redirect(302, '/redirect/female');
    
  } catch (error) {
    console.error('Female redirect error:', error);
    // Fallback to the redirect page
    res.redirect(302, '/redirect/female');
  }
}