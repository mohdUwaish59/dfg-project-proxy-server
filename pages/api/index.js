// API index route for Vercel
export default function handler(req, res) {
  res.json({ 
    message: 'oTree Proxy Server API',
    version: '2.0.0',
    endpoints: {
      admin: {
        login: 'POST /api/admin/login',
        logout: 'POST /api/admin/logout',
        checkAuth: 'GET /api/admin/check-auth',
        links: 'GET /api/admin/links',
        stats: 'GET /api/admin/stats',
        createLink: 'POST /api/admin/create-link',
        toggleLink: 'POST /api/admin/toggle-link',
        deleteLink: 'POST /api/admin/delete-link'
      },
      proxy: {
        check: 'POST /api/proxy/[id]/check',
        info: 'GET /api/proxy/[id]'
      }
    }
  });
}