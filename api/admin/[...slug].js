// Vercel API route for admin endpoints
const app = require('../../server');

export default app;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    externalResolver: true,
  },
}