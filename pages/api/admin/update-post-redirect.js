// API endpoint to update post-experiment redirect URL for a specific proxy link
const { requireAuth } = require('../../../lib/auth');
const { updatePostExperimentRedirectUrl, getProxyLink } = require('../../../lib/database');

export default async function handler(req, res) {
  // Check authentication
  const user = requireAuth(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { proxyId, postExperimentRedirectUrl } = req.body;

  if (!proxyId) {
    return res.status(400).json({ error: 'Proxy ID is required' });
  }

  if (!postExperimentRedirectUrl) {
    return res.status(400).json({ error: 'Post-experiment redirect URL is required' });
  }

  // Validate URL format
  try {
    new URL(postExperimentRedirectUrl);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    // Check if proxy link exists
    const link = await getProxyLink(proxyId);
    if (!link) {
      return res.status(404).json({ error: 'Proxy link not found' });
    }

    // Update the post-experiment redirect URL
    await updatePostExperimentRedirectUrl(proxyId, postExperimentRedirectUrl);

    res.status(200).json({ 
      success: true,
      message: 'Post-experiment redirect URL updated successfully',
      proxyId,
      postExperimentRedirectUrl
    });
  } catch (error) {
    console.error('Error updating post-experiment redirect URL:', error);
    res.status(500).json({ error: 'Failed to update redirect URL' });
  }
}
