// Dynamic redirect endpoint for specific proxy link
const { getProxyLink } = require('../../../lib/database');

export default async function handler(req, res) {
  const { proxyId } = req.query;

  if (!proxyId) {
    return res.status(400).json({ error: 'Proxy ID is required' });
  }

  try {
    // Get the proxy link to find its post-experiment redirect URL
    const link = await getProxyLink(proxyId);
    
    if (!link) {
      return res.status(404).json({ error: 'Experiment link not found' });
    }

    if (!link.post_experiment_redirect_url) {
      return res.status(404).json({ 
        error: 'Post-experiment redirect URL not configured for this experiment' 
      });
    }

    // Return the redirect URL for the frontend to use
    res.status(200).json({
      redirectUrl: link.post_experiment_redirect_url,
      groupName: link.group_name,
      category: link.category,
      treatmentTitle: link.treatment_title
    });
    
  } catch (error) {
    console.error('Redirect API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
