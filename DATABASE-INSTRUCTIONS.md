# Database Setup Instructions

## Current Issue
You're getting errors when running the database setup scripts because of existing tables and triggers.

## Solution

### Option 1: Use the Final Setup Script (Recommended)
Run the `database-setup-final.sql` script which handles existing tables and triggers gracefully.

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `database-setup-final.sql`
3. Click "Run"

This script will:
- ✅ Handle existing triggers without errors
- ✅ Create subscriber lists and list memberships tables
- ✅ Set up proper RLS policies
- ✅ Add default template data

### Option 2: Manual Cleanup (If needed)
If you want to start completely fresh:

```sql
-- Drop all tables (BE CAREFUL - THIS DELETES ALL DATA)
DROP TABLE IF EXISTS public.newsletter_recipients CASCADE;
DROP TABLE IF EXISTS public.list_memberships CASCADE;
DROP TABLE IF EXISTS public.subscriber_lists CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.newsletters CASCADE;
DROP TABLE IF EXISTS public.subscribers CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_subscriber_stats() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Now run database-setup-final.sql
```

### Option 3: Quick Fix for Missing Tables
If you just need to add the missing subscriber_lists table:

```sql
-- Create subscriber lists table
CREATE TABLE IF NOT EXISTS public.subscriber_lists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create list memberships table
CREATE TABLE IF NOT EXISTS public.list_memberships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subscriber_id UUID NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
    list_id UUID NOT NULL REFERENCES public.subscriber_lists(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subscriber_id, list_id)
);

-- Enable RLS
ALTER TABLE public.subscriber_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_memberships ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can manage their own subscriber lists" ON public.subscriber_lists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Enable access for list memberships" ON public.list_memberships FOR ALL USING (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_list_memberships_subscriber_id ON public.list_memberships(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_list_memberships_list_id ON public.list_memberships(list_id);
CREATE INDEX IF NOT EXISTS idx_subscriber_lists_user_id ON public.subscriber_lists(user_id);
```

## Verification
After running the setup, verify these tables exist:
- ✅ subscribers
- ✅ newsletters  
- ✅ templates
- ✅ subscriber_lists
- ✅ list_memberships
- ✅ newsletter_recipients

## Current App Status
The app is configured to work with real database data, not mock data. Once the database is properly set up:

1. **Subscribers** will show real imported data
2. **CSV import** will save to the database
3. **Google Sheets import** will save to the database (with proper access)
4. **Email lists** can be organized with names
5. **Templates** will load properly

## Next Steps
1. Run the database setup
2. Test CSV import functionality
3. Configure Google OAuth scopes for Sheets access
4. Test template loading (should work now)
5. Test newsletter sending