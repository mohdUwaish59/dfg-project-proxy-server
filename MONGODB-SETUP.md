# 🍃 MongoDB Atlas Setup Guide

## ✅ **MongoDB Atlas is Ready!**

Your oTree Proxy Server now supports MongoDB Atlas with automatic SQL-to-MongoDB query conversion.

## 🚀 **Quick Setup Steps:**

### **1. Set Environment Variable in Vercel**

Go to your Vercel project dashboard → Settings → Environment Variables:

```env
DATABASE_URL=mongodb+srv://muwaish5:tgEk7IUvoLHKVUW0@cluster0.olcx7kr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
SESSION_SECRET=your-generated-secret
NODE_ENV=production
```

### **2. Deploy**

The app will automatically detect MongoDB and use the new adapter:

```bash
vercel --prod
```

## 🔍 **How It Works:**

### **Automatic Detection**
- ✅ Detects `mongodb://` or `mongodb+srv://` in `DATABASE_URL`
- ✅ Automatically switches to MongoDB adapter
- ✅ Converts SQLite queries to MongoDB operations

### **Database Structure**
Your MongoDB database will have these collections:

```javascript
// Database: otree_proxy
{
  "admins": [
    {
      "_id": ObjectId,
      "username": "admin",
      "password": "admin123",
      "created_at": Date
    }
  ],
  
  "proxy_links": [
    {
      "_id": ObjectId,
      "proxy_id": "abc123",
      "real_url": "https://otree-server.com/room/...",
      "group_name": "Group-1",
      "max_uses": 3,
      "current_uses": 0,
      "is_active": true,
      "created_at": Date,
      "created_by": "admin"
    }
  ],
  
  "link_usage": [
    {
      "_id": ObjectId,
      "proxy_id": "abc123",
      "session_id": "session123",
      "user_ip": "192.168.1.1",
      "user_fingerprint": "fingerprint123",
      "participant_number": 1,
      "used_at": Date
    }
  ]
}
```

## 🎯 **Features:**

### **✅ Automatic Query Translation**
- **SQLite SELECT** → **MongoDB findOne/find**
- **SQLite INSERT** → **MongoDB insertOne**
- **SQLite UPDATE** → **MongoDB updateOne**
- **SQLite DELETE** → **MongoDB deleteOne/deleteMany**

### **✅ Built-in Optimizations**
- **Indexes** - Automatic index creation for performance
- **Upserts** - Prevents duplicate admin users
- **Connection Pooling** - Optimized for serverless functions

### **✅ Admin Features**
- **Default Admin** - Automatically creates `admin/admin123`
- **Link Management** - Create, toggle, reset, delete links
- **Usage Tracking** - Track participant usage
- **Real-time Stats** - Dashboard analytics

## 🔧 **Supported Operations:**

| SQL Operation | MongoDB Equivalent | Status |
|---------------|-------------------|--------|
| Admin Login | `findOne({username, password})` | ✅ |
| Create Link | `insertOne(linkDoc)` | ✅ |
| Get All Links | `find({}).sort({created_at: -1})` | ✅ |
| Toggle Link | `updateOne({proxy_id}, {$set: {is_active}})` | ✅ |
| Reset Usage | `updateOne({proxy_id}, {$set: {current_uses: 0}})` | ✅ |
| Delete Link | `deleteOne({proxy_id})` | ✅ |
| Usage Stats | Aggregation queries | ✅ |

## 🚨 **No Database Setup Required!**

Unlike PostgreSQL, MongoDB Atlas doesn't require schema creation:
- ✅ **Collections** are created automatically
- ✅ **Indexes** are created automatically  
- ✅ **Default admin** is created automatically
- ✅ **No SQL scripts** to run

## 📊 **Test Your Deployment:**

1. **Deploy**: `vercel --prod`
2. **Visit**: `https://your-app.vercel.app/admin`
3. **Login**: `admin` / `admin123`
4. **Create Links**: Test the full functionality

## 🔍 **Debug Information:**

The logs will show:
```
🍃 Using MongoDB for production
✅ MongoDB connection test successful - Pinged deployment!
✅ MongoDB indexes created
✅ Default admin user created
```

## 🎉 **Benefits of MongoDB:**

- ✅ **No Schema Required** - Collections created automatically
- ✅ **Better Vercel Support** - Designed for serverless
- ✅ **Flexible Data** - JSON-like documents
- ✅ **Built-in Scaling** - Atlas handles everything
- ✅ **Free Tier** - 512MB storage, perfect for research

Your oTree Proxy Server is now ready with MongoDB Atlas! 🚀