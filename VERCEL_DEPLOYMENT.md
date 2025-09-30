# Vercel Deployment Guide

## Environment Variables Required

Set these environment variables in your Vercel dashboard:

### Required Variables:
```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/otree_proxy
SESSION_SECRET=your-super-secret-key-here
NODE_ENV=production
```

### Optional Variables:
```
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=your-secure-password
```

## Deployment Steps:

1. **Push your changes to GitHub**
2. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add the variables listed above

3. **Verify MongoDB Connection:**
   - Ensure your MongoDB Atlas cluster allows connections from `0.0.0.0/0` (all IPs)
   - Or add Vercel's IP ranges to your MongoDB whitelist

4. **Create Admin User:**
   After deployment, you'll need to manually create an admin user in your MongoDB database:
   
   ```javascript
   // Connect to your MongoDB database and run:
   db.admins.insertOne({
     username: "admin",
     password: "your-secure-password",
     created_at: new Date()
   })
   ```

## Testing Deployment:

1. Visit `https://your-app.vercel.app/admin`
2. Try logging in with invalid credentials - should show error
3. Try logging in with valid credentials - should work
4. Check `https://your-app.vercel.app/api/admin/debug-admin` to see admin users

## Troubleshooting:

- **500 Error**: Check Vercel function logs for database connection issues
- **Authentication Issues**: Verify SESSION_SECRET is set
- **MongoDB Issues**: Check DATABASE_URL and network access settings
- **Build Issues**: Check that all dependencies are in package.json

## Important Notes:

- The app now uses Next.js for the frontend and Express for API routes
- All API routes are prefixed with `/api/`
- MongoDB is required for production (SQLite only works locally)
- Sessions are stored in MongoDB for persistence across serverless functions