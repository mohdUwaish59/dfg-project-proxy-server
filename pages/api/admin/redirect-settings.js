// API endpoint for managing gender-based redirect URLs
const { connectToDatabase } = require('../../../lib/database');

export default async function handler(req, res) {
  try {
    const db = await connectToDatabase();
    
    if (req.method === 'GET') {
      // Get current redirect settings
      const settings = await db.collection('redirect_settings').findOne({ type: 'gender_redirect' });
      
      res.status(200).json({
        maleRedirectUrl: settings?.maleRedirectUrl || '',
        femaleRedirectUrl: settings?.femaleRedirectUrl || ''
      });
      
    } else if (req.method === 'POST') {
      // Update redirect settings
      const { maleRedirectUrl, femaleRedirectUrl } = req.body;
      
      if (!maleRedirectUrl || !femaleRedirectUrl) {
        return res.status(400).json({ error: 'Both male and female redirect URLs are required' });
      }
      
      // Validate URLs
      try {
        new URL(maleRedirectUrl);
        new URL(femaleRedirectUrl);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid URL format' });
      }
      
      await db.collection('redirect_settings').updateOne(
        { type: 'gender_redirect' },
        { 
          $set: { 
            type: 'gender_redirect',
            maleRedirectUrl,
            femaleRedirectUrl,
            updated_at: new Date(),
            updated_by: 'admin'
          }
        },
        { upsert: true }
      );
      
      res.status(200).json({ message: 'Redirect settings updated successfully' });
      
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Redirect settings API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}