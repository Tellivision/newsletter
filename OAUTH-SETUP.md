# OAuth Setup Guide for GoogLetter

This guide will help you configure Google OAuth and Supabase Auth properly for both development and production environments.

## 🔧 Required Configuration

### 1. Supabase Configuration

In your Supabase project dashboard:

1. Go to **Authentication → Settings → URL Configuration**
2. Set the following URLs:

**Site URL:**
```
https://newsletter-orcin-delta.vercel.app
```

**Redirect URLs (add all of these):**
```
http://localhost:3000/auth/callback
https://newsletter-orcin-delta.vercel.app/auth/callback
https://vercel.app/**
```

### 2. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project or create a new one
3. Enable the following APIs:
   - Google+ API
   - Gmail API
   - Google Docs API
   - Google Drive API

4. Go to **APIs & Services → Credentials**
5. Create **OAuth 2.0 Client ID** with these settings:

**Application Type:** Web application

**Authorized JavaScript origins:**
```
http://localhost:3000
https://newsletter-orcin-delta.vercel.app
https://vercel.app
```

**Authorized redirect URIs:**
```
https://newsletter-orcin-delta.vercel.app/auth/callback
http://localhost:3000/auth/callback
https://[your-supabase-project-id].supabase.co/auth/v1/callback
```

### 3. Supabase Auth Provider Configuration

1. In Supabase Dashboard → **Authentication → Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console

### 4. Environment Variables

Make sure these are set in both Vercel and your local `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google OAuth (these should match Supabase provider config)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Gmail for sending
GMAIL_USER=your-gmail-address@gmail.com
```

## 🚀 Vercel Deployment Configuration

1. In Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all the environment variables listed above
3. Make sure they're available for all environments (Production, Preview, Development)

## 🔍 Troubleshooting

### Issue: Redirects to localhost after Google auth

**Solution:** 
1. Check that your Supabase redirect URLs include your Vercel domain
2. Verify Google OAuth app has the correct authorized redirect URIs
3. Check that environment variables are properly set in Vercel

### Issue: "redirect_uri_mismatch" error

**Solution:**
1. The redirect URI in Google Cloud Console must exactly match what's being sent
2. Add both localhost and production URLs to Google OAuth app
3. Check Supabase provider configuration

### Issue: "Invalid redirect URL" error

**Solution:**
1. Add your Vercel domain to Supabase Auth → URL Configuration → Redirect URLs
2. Use wildcard patterns like `https://vercel.app/**` for Vercel previews

## 📝 Testing

1. **Local Development:** Should redirect to `http://localhost:3000/auth/callback`
2. **Production:** Should redirect to `https://newsletter-orcin-delta.vercel.app/auth/callback`

## 🔗 Useful Links

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)