# Google OAuth Setup for Newsletter Pro

This guide explains how to configure Google OAuth with the proper scopes for both authentication and Google Docs access.

## Current Google Credentials

**Client ID:** `1038254346839-d8inf8ggnuqjh8n0soivmgpldp58bamu.apps.googleusercontent.com`
**Client Secret:** Use your newly regenerated secret (the old one was exposed)

## 1. Google Cloud Console Setup

### Enable Required APIs
In your Google Cloud Console project, enable these APIs:
- Google+ API (for authentication)
- Gmail API (for sending emails)
- Google Docs API (for importing documents)
- Google Sheets API (for importing spreadsheets)

### OAuth 2.0 Client Configuration

1. Go to [Google Cloud Console > APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. Configure the authorized domains and redirect URIs:

**Authorized JavaScript Origins:**
```
http://localhost:3000
https://newsletter-omega-smoky.vercel.app
https://*.vercel.app
```

**Authorized Redirect URIs:**
```
http://localhost:3000/auth/callback
https://newsletter-omega-smoky.vercel.app/auth/callback
https://*.vercel.app/auth/callback
https://[your-supabase-project-id].supabase.co/auth/v1/callback
```

## 2. Supabase Auth Configuration

### Update Google Provider

1. Go to your Supabase Dashboard
2. Navigate to **Authentication > Providers**
3. Find the **Google** provider and click to edit
4. Update the configuration:

**Client ID:** `1038254346839-d8inf8ggnuqjh8n0soivmgpldp58bamu.apps.googleusercontent.com`
**Client Secret:** [Your regenerated secret]

### Add Additional Scopes

In the Google provider configuration, add these scopes to the **Additional Scopes** field:
```
https://www.googleapis.com/auth/documents.readonly https://www.googleapis.com/auth/spreadsheets.readonly
```

This allows access to:
- Google Docs (read-only) for importing newsletter content
- Google Sheets (read-only) for importing subscriber lists

### URL Configuration

1. In Supabase Dashboard, go to **Authentication > URL Configuration**
2. Set the **Site URL** to:
```
https://newsletter-omega-smoky.vercel.app
```

3. Add these **Redirect URLs**:
```
http://localhost:3000/auth/callback
https://newsletter-omega-smoky.vercel.app/auth/callback
https://*.vercel.app/auth/callback
```

## 3. Environment Variables

Make sure these are set in Vercel:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google OAuth (optional - Supabase handles this)
GOOGLE_CLIENT_ID=1038254346839-d8inf8ggnuqjh8n0soivmgpldp58bamu.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-regenerated-secret
```

## 4. Testing the Setup

### Test Authentication
1. Visit your deployed app: https://newsletter-omega-smoky.vercel.app
2. Click "Get Started Free"
3. Should redirect to Google OAuth
4. After authorization, should redirect back to dashboard

### Test Google Docs Import
1. After successful login, go to the Editor page
2. Try importing from Google Docs
3. If you get "Google access token not found", you need to sign out and sign back in to get the new token with the updated scopes

### Test Google Sheets Import
1. Go to Editor > Manage Subscribers tab
2. Use the Google Sheets importer
3. Make sure your Google Sheets is publicly accessible

## 5. Troubleshooting

### "redirect_uri_mismatch" Error
- Check that your redirect URIs in Google Cloud Console match exactly
- Use wildcard patterns: `https://*.vercel.app/auth/callback`

### "Google access token not found"
- Sign out and sign back in to get a new token with the updated scopes
- Check that additional scopes are configured in Supabase

### Google Sheets Access Denied
- Make sure your Google Sheets is shared with "Anyone with the link can view"
- The sheet must be publicly accessible for the import to work

### Vercel Deployment Issues
- Make sure all environment variables are set in Vercel
- Check that the build completes successfully
- Verify that the Supabase URL and keys are correct

## 6. Current Status

✅ **Working Features:**
- Google OAuth authentication
- CSV file upload for subscribers
- Template selection and loading
- Newsletter editor
- Email sending (via Gmail API)

🔧 **Features requiring setup:**
- Google Docs import (needs additional scopes)
- Google Sheets import (needs public sheet access)

## Notes

- The app automatically detects the current deployment URL for OAuth redirects
- Preview deployments on Vercel will work with the wildcard redirect URIs
- Always test locally first before deploying
- Keep your client secret secure and never commit it to version control