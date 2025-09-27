# 🚀 Quick Setup Guide for Your New Google OAuth

## Your Google OAuth Credentials

**Client ID (Public):** `1038254346839-d8inf8ggnuqjh8n0soivmgpldp58bamu.apps.googleusercontent.com`
**Client Secret:** ⚠️ **REGENERATE IMMEDIATELY** (was exposed publicly)

## 🔥 URGENT: Security Steps (Do First!)

### 1. Regenerate Client Secret
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client: `1038254346839-d8inf8ggnuqjh8n0soivmgpldp58bamu.apps.googleusercontent.com`
3. Click edit → Reset Secret
4. Copy the NEW secret

### 2. Configure Google OAuth URLs
Add these to your Google OAuth 2.0 Client:

**Authorized JavaScript origins:**
```
http://localhost:3000
https://newsletter-omega-smoky.vercel.app
https://vercel.app
```

**Authorized redirect URIs:**
```
http://localhost:3000/auth/callback
https://newsletter-omega-smoky.vercel.app/auth/callback
https://vercel.app/auth/callback
```

## 🔧 Vercel Configuration

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

```bash
GOOGLE_CLIENT_ID=1038254346839-d8inf8ggnuqjh8n0soivmgpldp58bamu.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_NEW_REGENERATED_SECRET

# Also ensure you have:
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📊 Supabase Configuration

1. **Auth Provider Setup:**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Client ID: `1038254346839-d8inf8ggnuqjh8n0soivmgpldp58bamu.apps.googleusercontent.com`
   - Client Secret: Your new regenerated secret

2. **URL Configuration:**
   - Site URL: `https://newsletter-omega-smoky.vercel.app`
   - Redirect URLs:
     ```
     http://localhost:3000/auth/callback
     https://newsletter-omega-smoky.vercel.app/auth/callback
     https://*.vercel.app/auth/callback
     ```

## ✅ Testing Steps

1. **Complete above configurations**
2. **Visit debug tool:** https://newsletter-omega-smoky.vercel.app/oauth-debug
3. **Test OAuth flow:** https://newsletter-omega-smoky.vercel.app
4. **Click "Get Started Free"**
5. **Should redirect properly after Google auth**

## 🔗 Quick Links

- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard/projects)
- [OAuth Debug Tool](https://newsletter-omega-smoky.vercel.app/oauth-debug)

## 🚨 Remember
- **Regenerate the Client Secret** before using it anywhere
- **Never share Client Secrets** publicly again
- The **Client ID is safe** to be public