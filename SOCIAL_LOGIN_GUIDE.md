# Social Login Implementation Guide

## ✅ What's Been Implemented

I've successfully implemented **Google and Facebook OAuth authentication** for your Sharans e-commerce application. Users can now login/register using their social media accounts!

### Backend Changes:

1. **Installed Packages:**
   - `passport` - Authentication middleware
   - `passport-google-oauth20` - Google OAuth strategy
   - `passport-facebook` - Facebook OAuth strategy

2. **New Files Created:**
   - `config/passport.js` - Passport configuration with Google & Facebook strategies

3. **Modified Files:**
   - `models/user.model.js` - Added social auth fields (googleId, facebookId, authProvider, avatar)
   - `routes/auth.routes.js` - Added OAuth routes for Google and Facebook
   - `server.js` - Initialized Passport middleware
   - `.env.example` - Added OAuth configuration variables

4. **OAuth Routes Added:**
   - `GET /api/auth/google` - Initiates Google OAuth flow
   - `GET /api/auth/google/callback` - Google OAuth callback
   - `GET /api/auth/facebook` - Initiates Facebook OAuth flow
   - `GET /api/auth/facebook/callback` - Facebook OAuth callback

### Frontend Changes:

1. **New Files Created:**
   - `client/src/pages/AuthCallback.jsx` - Handles OAuth redirect and token storage

2. **Modified Files:**
   - `client/src/pages/Login.jsx` - Added functional Google & Facebook buttons
   - `client/src/pages/Register.jsx` - Added social login buttons
   - `client/src/App.jsx` - Added `/auth/callback` route

---

## 🔧 Setup Instructions

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Set **Authorized redirect URIs**:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
7. Copy your **Client ID** and **Client Secret**

### Step 2: Get Facebook OAuth Credentials

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing one
3. Add **Facebook Login** product
4. Go to **Settings** → **Basic**
5. Copy your **App ID** and **App Secret**
6. In **Facebook Login** → **Settings**, add **Valid OAuth Redirect URIs**:
   ```
   http://localhost:5000/api/auth/facebook/callback
   ```

### Step 3: Configure Environment Variables

Create or update your `.env` file in the backend root:

```bash
# Backend URL
BACKEND_URL=http://localhost:5000

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your-actual-google-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret-here

# Facebook OAuth
FACEBOOK_APP_ID=your-actual-facebook-app-id-here
FACEBOOK_APP_SECRET=your-actual-facebook-app-secret-here

# JWT Secret (already exists)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1d
```

### Step 4: Restart Your Servers

After adding the environment variables, restart both servers:

**Backend:**
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

**Frontend:**
```bash
# The client should auto-reload, but if not:
# Stop and restart
npm run dev
```

---

## 🧪 Testing Social Login

### Test Flow:

1. **Open the application**: Navigate to `http://localhost:5173/login`

2. **Click "Google" button**:
   - You'll be redirected to Google's login page
   - Sign in with your Google account
   - Grant permissions
   - You'll be redirected back to your app and automatically logged in

3. **Click "Facebook" button**:
   - You'll be redirected to Facebook's login page
   - Sign in with your Facebook account
   - Grant permissions
   - You'll be redirected back to your app and automatically logged in

### What Happens Behind the Scenes:

1. User clicks social login button
2. Redirected to OAuth provider (Google/Facebook)
3. User authenticates and grants permissions
4. OAuth provider redirects to `/api/auth/{provider}/callback`
5. Backend creates/finds user in database
6. Backend generates JWT token
7. Redirects to frontend `/auth/callback?token=xxx`
8. Frontend stores token and user data
9. User is logged in and redirected to home page

---

## 📊 Database Schema Updates

The User model now includes:

```javascript
{
  // Existing fields...
  
  // New Social Auth Fields
  googleId: String,           // Google user ID
  facebookId: String,         // Facebook user ID
  authProvider: String,       // 'local', 'google', or 'facebook'
  avatar: String,             // Profile picture from social provider
  isEmailVerified: Boolean,   // Auto-set to true for social logins
}
```

---

## 🔒 Security Features

✅ **Password Optional**: Social login users don't need passwords
✅ **Email Verification**: Social login emails are auto-verified
✅ **JWT Tokens**: Secure token-based authentication
✅ **Session-less**: Using JWT instead of sessions for better scalability
✅ **CORS Protected**: Only allowed origins can access OAuth endpoints

---

## 🚀 Production Deployment

### For Production:

1. **Update Redirect URIs** in Google and Facebook consoles:
   ```
   https://yourdomain.com/api/auth/google/callback
   https://yourdomain.com/api/auth/facebook/callback
   ```

2. **Update Environment Variables**:
   ```bash
   BACKEND_URL=https://api.yourdomain.com
   FRONTEND_URL=https://yourdomain.com
   ```

3. **Update Frontend OAuth URLs** in `Login.jsx` and `Register.jsx`:
   ```javascript
   // Replace hardcoded localhost with environment variable
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
   
   onClick={() => window.location.href = `${API_URL}/api/auth/google`}
   ```

---

## 🐛 Troubleshooting

### Issue: "Redirect URI mismatch"
**Solution**: Make sure the redirect URI in Google/Facebook console exactly matches your callback URL

### Issue: "User not found after OAuth"
**Solution**: Check if the OAuth provider is returning email in the profile. Some providers require explicit email scope.

### Issue: "CORS error"
**Solution**: Add your frontend URL to `ALLOWED_ORIGINS` in `.env`

### Issue: "Token not received"
**Solution**: Check browser console for errors. Ensure `/auth/callback` route is properly configured.

---

## 📝 Next Steps (Optional Enhancements)

1. **Add More Providers**: Twitter, GitHub, LinkedIn
2. **Link Accounts**: Allow users to link multiple social accounts
3. **Profile Sync**: Sync profile picture and info from social accounts
4. **Account Merging**: Handle cases where user signs up with email then tries social login

---

## ✨ Features Summary

✅ Google OAuth Login
✅ Facebook OAuth Login  
✅ Automatic user creation
✅ JWT token generation
✅ Seamless redirect flow
✅ Social profile picture support
✅ Email auto-verification
✅ Works on both Login and Register pages

---

**Need Help?** If you encounter any issues during setup, let me know and I'll help you troubleshoot!
