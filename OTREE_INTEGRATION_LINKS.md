# oTree Integration Links - Quick Guide

## 🔗 Direct Redirect Links

Use these links directly in your oTree experiments:

### Male Participants
```
https://your-domain.com/api/redirect/male
```

### Female Participants  
```
https://your-domain.com/api/redirect/female
```

## 📋 How to Get Your Links

1. Go to your admin dashboard
2. Scroll to "Gender-Based Redirect Settings"
3. Configure your destination URLs
4. Copy the direct links shown in the interface
5. Use these links in your oTree experiment

## 🎯 oTree Implementation Examples

### Simple HTML Link
```html
<a href="https://your-domain.com/api/redirect/male" class="btn btn-primary">
    Continue to Survey
</a>
```

### JavaScript Redirect
```javascript
// Automatic redirect based on gender
if (participant.gender === 'male') {
    window.location.href = 'https://your-domain.com/api/redirect/male';
} else {
    window.location.href = 'https://your-domain.com/api/redirect/female';
}
```

### Button with Conditional Logic
```html
{% if participant.gender == 'male' %}
    <a href="https://your-domain.com/api/redirect/male">Continue</a>
{% else %}
    <a href="https://your-domain.com/api/redirect/female">Continue</a>
{% endif %}
```

## ✅ What Happens

1. Participant clicks the link in oTree
2. They're redirected to your proxy server
3. Server logs the redirect (for analytics)
4. **Participant sees a beautiful "🎉 Experiment Complete!" countdown screen**
5. **5-second countdown timer with animated progress bar**
6. **After 5 seconds, automatic redirect to the configured destination URL**
7. If no URL is configured, they see an error message on the countdown screen

## 🔧 Admin Features

- Set different destination URLs for male/female participants
- Copy-paste ready links for oTree
- Test redirect functionality
- View redirect analytics
- Professional error handling

## 🎨 Beautiful User Experience

Participants will see:
- **Professional "Experiment Complete" screen** with celebration emoji
- **Gender-specific color themes** (blue for male, pink for female)
- **5-second animated countdown** with progress bar
- **"Continue Now" button** for manual redirect
- **"Experiment data saved successfully" confirmation**
- **Smooth animations and transitions**

## 🚀 Ready to Use

The system is now ready! Just:
1. Configure your destination URLs in admin
2. Copy the provided links
3. Add them to your oTree experiment
4. Participants will see the beautiful countdown screen and be redirected after 5 seconds