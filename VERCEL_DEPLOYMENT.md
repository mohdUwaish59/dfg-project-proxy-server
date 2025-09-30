# Vercel Deployment Guide - FIXED VERSION

## What Was Fixed:

The previous deployment was failing because we were trying to run the full Express server as a serverless function. I've now restructured the app to use proper Vercel API routes.

## New Structure:

- **Frontend**: Next.js pages (app directory)
- **API Routes**: Individual serverless functions in `pages/api/`
- **Database**: MongoDB with proper serverless initialization

## Environment Variables Required

Set these environment variables in your Vercel dashboard:

### Required Variables:

```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/otree_proxy
SESSION_SECRET=your-super-secret-key-here
NODE_ENV=production
```

## Deployment Steps:

1. **Push these changes to GitHub** (the new API structure)
2. **Set environment variables in Vercel dashboard:**

   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add the variables listed above

3. **Verify MongoDB Connection:**

   - Ensure your MongoDB Atlas cluster allows connections from `0.0.0.0/0` (all IPs)
   - Or add Vercel's IP ranges to your MongoDB whitelist

4. **Create Admin User:**
   After deployment, create an admin user in your MongoDB database:

   ```javascript
   // Connect to your MongoDB database and run:
   db.admins.insertOne({
     username: "admin",
     password: "your-secure-password",
     created_at: new Date(),
   });
   ```

## API Endpoints Now Available:

- `GET /api/admin/check-auth` - Check authentication status
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/links` - Get proxy links (authenticated)
- `GET /api/admin/stats` - Get statistics (authenticated)
- `GET /api/admin/debug-admin` - Debug admin users
- `POST /api/proxy/[id]/check` - Check proxy access

## Testing Deployment:

1. Visit `https://your-app.vercel.app/` - Should load homepage
2. Visit `https://your-app.vercel.app/admin` - Should show login form
3. Test `https://your-app.vercel.app/api/admin/debug-admin` - Should show admin users
4. Try logging in with invalid credentials - should show error
5. Try logging in with valid credentials - should work

## Troubleshooting:

### If you still get 500 errors:

1. Check Vercel function logs in your dashboard
2. Verify all environment variables are set
3. Check MongoDB Atlas network access (allow 0.0.0.0/0)
4. Ensure DATABASE_URL is correct

### Common Issues:

- **Database connection**: Make sure MongoDB Atlas allows all IPs
- **Missing environment variables**: Double-check DATABASE_URL and SESSION_SECRET
- **No admin users**: Create an admin user in your MongoDB database

## Key Changes Made:

1. **Removed Express server dependency** for API routes
2. **Created individual serverless functions** for each endpoint
3. **Added proper database initialization** in each function
4. **Simplified vercel.json** configuration
5. **Fixed authentication flow** to work with serverless functions

The app should now deploy and work correctly on Vercel!
