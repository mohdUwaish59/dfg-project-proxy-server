# 🚀 Deploy to Vercel - Step by Step Guide

## ✅ **Yes, it WILL work on Vercel!** 

With the right setup, your oTree Proxy Server will work perfectly on Vercel. Here's how:

## 🎯 **Quick Setup (5 minutes)**

### Step 1: Create Free Database

**Option A: Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Create new project
3. Go to SQL Editor → Run this query:

```sql
-- Copy and paste the contents of setup-database.sql
```

4. Go to Settings → Database → Copy connection string

**Option B: Neon**
1. Go to [neon.tech](https://neon.tech) → Sign up (free)
2. Create database
3. Run the SQL schema from `setup-database.sql`
4. Copy connection string

### Step 2: Deploy to Vercel

**Method 1: One-Click Deploy**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   ```
   DATABASE_URL=your-postgresql-connection-string
   SESSION_SECRET=your-super-secret-key
   NODE_ENV=production
   ```
5. Deploy!

**Method 2: CLI Deploy**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
vercel env add NODE_ENV

# Redeploy
vercel --prod
```

### Step 3: Test Your Deployment

1. Visit `https://your-app.vercel.app/admin`
2. Login with `admin` / `admin123`
3. Create a test experiment link
4. Test the proxy functionality

## 🔧 **Environment Variables**

Set these in your Vercel dashboard:

```env
# Required
DATABASE_URL=postgresql://user:pass@host:port/db
SESSION_SECRET=your-super-secret-key-min-32-chars
NODE_ENV=production

# Optional
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=your-secure-password
```

## 🎉 **What Works on Vercel:**

✅ **Admin Dashboard** - Full functionality  
✅ **Link Creation** - Create experiment links  
✅ **Participant Tracking** - Track usage and prevent duplicates  
✅ **Real-time Analytics** - View statistics  
✅ **Session Management** - Admin login/logout  
✅ **Database Persistence** - Data survives deployments  
✅ **Auto-scaling** - Handles traffic spikes  
✅ **HTTPS** - Secure by default  
✅ **Global CDN** - Fast worldwide access  

## 🚨 **Common Issues & Solutions**

### Issue: "Database not initialized"
**Solution**: Make sure `DATABASE_URL` is set in Vercel environment variables

### Issue: "Cannot connect to database"
**Solution**: Check your PostgreSQL connection string format:
```
postgresql://username:password@host:port/database?sslmode=require
```

### Issue: "Admin login doesn't work"
**Solution**: 
1. Check if `SESSION_SECRET` is set
2. Make sure you ran the SQL schema to create the admins table

### Issue: "Links don't persist"
**Solution**: You're probably still using SQLite. Switch to PostgreSQL with `DATABASE_URL`

## 📊 **Performance on Vercel**

- **Cold Start**: ~1-2 seconds (first request after idle)
- **Warm Requests**: ~100-300ms
- **Concurrent Users**: Scales automatically
- **Database**: Depends on your PostgreSQL provider

## 💰 **Cost Breakdown (FREE)**

- **Vercel**: Free tier (100GB bandwidth, 100 serverless functions)
- **Supabase**: Free tier (500MB database, 50MB file storage)
- **Total**: $0/month for small to medium usage

## 🔄 **Updating Your App**

```bash
# Make changes to your code
git add .
git commit -m "Update app"
git push

# Vercel auto-deploys from GitHub
# Or manually redeploy:
vercel --prod
```

## 🎯 **Production Checklist**

- [ ] Database schema created
- [ ] Environment variables set
- [ ] Default admin password changed
- [ ] SSL/HTTPS enabled (automatic on Vercel)
- [ ] Custom domain configured (optional)
- [ ] Error monitoring set up (optional)

## 🆘 **Need Help?**

1. **Check Vercel logs**: Go to your project dashboard → Functions tab
2. **Test database connection**: Use a PostgreSQL client
3. **Verify environment variables**: Check Vercel project settings

## 🎉 **You're Ready!**

Your oTree Proxy Server will work perfectly on Vercel with this setup. The combination of Vercel's serverless functions + PostgreSQL database gives you:

- **Reliability**: No server maintenance
- **Scalability**: Handles any traffic load
- **Performance**: Global edge network
- **Cost**: Free for most research projects

**Happy experimenting! 🧪**