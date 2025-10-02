# Gender-Based Redirection System

This system provides gender-based redirection for participants after they complete their oTree experiments.

## Features

### 1. Redirect Pages
- **Male Participants**: `/redirect/male`
- **Female Participants**: `/redirect/female`

Both pages provide:
- Automatic redirection after 5 seconds
- Manual "Continue Now" button
- Professional UI with gender-specific styling
- Error handling for missing configurations

### 2. Admin Configuration
In the admin dashboard, you'll find a new "Gender-Based Redirect Settings" section where you can:
- Set the redirect URL for male participants
- Set the redirect URL for female participants
- Test both redirect pages
- View usage instructions

### 3. Database Schema
The system adds a new collection `redirect_settings` with:
```javascript
{
  type: 'gender_redirect',
  maleRedirectUrl: 'https://example.com/male-survey',
  femaleRedirectUrl: 'https://example.com/female-survey',
  updated_at: Date,
  updated_by: 'admin'
}
```

## How to Use

### For Administrators:
1. Go to the admin dashboard
2. Scroll to "Gender-Based Redirect Settings"
3. Enter the destination URLs for both male and female participants
4. Click "Save Settings"
5. Use the "Test" buttons to verify the redirect pages work correctly

### For oTree Integration:
Use these **direct redirect links** in your oTree experiment:
- Male participants: `https://your-proxy-domain.com/api/redirect/male`
- Female participants: `https://your-proxy-domain.com/api/redirect/female`

These links will automatically redirect participants to the configured destination URLs.

### Example oTree Implementation:

#### Method 1: HTML Links in Template
```html
<!-- In your final page template -->
{% if participant.gender == 'male' %}
    <a href="https://your-proxy-domain.com/api/redirect/male" class="btn btn-primary">
        Continue to Next Phase
    </a>
{% elif participant.gender == 'female' %}
    <a href="https://your-proxy-domain.com/api/redirect/female" class="btn btn-primary">
        Continue to Next Phase
    </a>
{% endif %}
```

#### Method 2: JavaScript Redirect
```javascript
// In your final page's JavaScript
if (js_vars.participant.gender === 'male') {
    window.location.href = 'https://your-proxy-domain.com/api/redirect/male';
} else if (js_vars.participant.gender === 'female') {
    window.location.href = 'https://your-proxy-domain.com/api/redirect/female';
}
```

#### Method 3: Python Redirect (in pages.py)
```python
# In your final page class
class FinalPage(Page):
    def before_next_page(self):
        if self.participant.gender == 'male':
            self.participant.redirect_url = 'https://your-proxy-domain.com/api/redirect/male'
        elif self.participant.gender == 'female':
            self.participant.redirect_url = 'https://your-proxy-domain.com/api/redirect/female'
```

## API Endpoints

### Direct Redirect Endpoints (for oTree)
- **GET /api/redirect/male** - Redirects male participants to configured URL
- **GET /api/redirect/female** - Redirects female participants to configured URL

### Admin Configuration Endpoints
- **GET /api/admin/redirect-settings** - Returns current redirect URLs
- **POST /api/admin/redirect-settings** - Updates redirect URLs
- **GET /api/admin/redirect-analytics** - Returns redirect usage statistics

### Example Response:
```json
{
  "maleRedirectUrl": "https://example.com/male-survey",
  "femaleRedirectUrl": "https://example.com/female-survey"
}
```

## Error Handling
- If redirect URLs are not configured, users see an error message
- Invalid URLs are rejected during configuration
- Network errors are handled gracefully with user-friendly messages

## Security
- Admin authentication required for configuration changes
- URL validation prevents malicious redirects
- HTTPS recommended for all redirect destinations

## Styling
- Male redirect page: Blue/indigo theme
- Female redirect page: Pink/rose theme
- Responsive design works on all devices
- Professional appearance matching the main application