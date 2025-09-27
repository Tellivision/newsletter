# 🔒 Security Setup Guide

## IMPORTANT: Google Client Secret Exposed

Your Google Client Secret was accidentally shared publicly: `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`

**IMMEDIATE ACTION REQUIRED:**

### 1. Regenerate Client Secret
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID: `1038254346839-d8inf8ggnuqjh8n0soivmgpldp58bamu.apps.googleusercontent.com`
3. Click the edit button (pencil icon)
4. Click "RESET SECRET" or "ADD SECRET" 
5. Copy the new secret securely

### 2. Add to Vercel Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your newsletter project
3. Go to Settings → Environment Variables
4. Add these variables:

```
GOOGLE_CLIENT_ID=1038254346839-d8inf8ggnuqjh8n0soivmgpldp58bamu.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_NEW_REGENERATED_SECRET
```

### 3. Add to Supabase Auth Provider
1. Go to your Supabase Dashboard
2. Navigate to Authentication → Providers
3. Enable Google provider
4. Add:
   - Client ID: `1038254346839-d8inf8ggnuqjh8n0soivmgpldp58bamu.apps.googleusercontent.com`
   - Client Secret: `YOUR_NEW_REGENERATED_SECRET`

## Security Best Practices

### What to Keep Private:
- ❌ Client Secret
- ❌ Supabase Service Role Key
- ❌ API Keys
- ❌ Database passwords

### What Can Be Public:
- ✅ Client ID (designed to be public)
- ✅ Supabase URL
- ✅ Supabase Anon Key (designed for frontend)

### Environment Variable Security:
1. **Never commit secrets** to git repositories
2. **Use environment variables** for all sensitive data
3. **Regenerate compromised secrets** immediately
4. **Use different credentials** for development and production

## Recovery Steps

If you've already added the exposed secret to Vercel:
1. Delete the old environment variable
2. Add the new regenerated secret
3. Redeploy your application

The old secret should be considered compromised and should not be used anywhere.