-- Newsletter Pro Database Setup Script (Fixed Version)
-- This script creates all necessary tables for the newsletter application
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing triggers if they exist to avoid conflicts
DROP TRIGGER IF EXISTS update_subscribers_updated_at ON public.subscribers;
DROP TRIGGER IF EXISTS update_newsletters_updated_at ON public.newsletters;
DROP TRIGGER IF EXISTS update_templates_updated_at ON public.templates;
DROP TRIGGER IF EXISTS update_subscriber_lists_updated_at ON public.subscriber_lists;
DROP TRIGGER IF EXISTS update_list_memberships_updated_at ON public.list_memberships;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS get_subscriber_stats();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create subscriber lists table
CREATE TABLE IF NOT EXISTS public.subscriber_lists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscribers table (updated with list support)
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
    tags TEXT[] DEFAULT '{}',
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create list memberships table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.list_memberships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subscriber_id UUID NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
    list_id UUID NOT NULL REFERENCES public.subscriber_lists(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subscriber_id, list_id)
);

-- Create newsletters table
CREATE TABLE IF NOT EXISTS public.newsletters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    preview_text TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    recipient_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    html_content TEXT NOT NULL,
    thumbnail_url TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create newsletter_recipients table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.newsletter_recipients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    newsletter_id UUID NOT NULL REFERENCES public.newsletters(id) ON DELETE CASCADE,
    subscriber_id UUID NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'bounced', 'failed')),
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriber stats function
CREATE OR REPLACE FUNCTION get_subscriber_stats()
RETURNS TABLE(
    total BIGINT,
    active BIGINT,
    inactive BIGINT,
    bounced BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'unsubscribed') as inactive,
        COUNT(*) FILTER (WHERE status = 'bounced') as bounced
    FROM public.subscribers;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers
CREATE TRIGGER update_subscribers_updated_at
    BEFORE UPDATE ON public.subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletters_updated_at
    BEFORE UPDATE ON public.newsletters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON public.templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriber_lists_updated_at
    BEFORE UPDATE ON public.subscriber_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_list_memberships_updated_at
    BEFORE UPDATE ON public.list_memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public.subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON public.subscribers(created_at);
CREATE INDEX IF NOT EXISTS idx_newsletters_user_id ON public.newsletters(user_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON public.newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_recipients_newsletter_id ON public.newsletter_recipients(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_recipients_subscriber_id ON public.newsletter_recipients(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_list_memberships_subscriber_id ON public.list_memberships(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_list_memberships_list_id ON public.list_memberships(list_id);
CREATE INDEX IF NOT EXISTS idx_subscriber_lists_user_id ON public.subscriber_lists(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriber_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_recipients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - adjust based on your needs)
CREATE POLICY "Enable read access for all users" ON public.subscribers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.subscribers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.subscribers FOR DELETE USING (true);

CREATE POLICY "Users can manage their own newsletters" ON public.newsletters FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Enable read access for templates" ON public.templates FOR SELECT USING (true);

CREATE POLICY "Users can manage their own subscriber lists" ON public.subscriber_lists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Enable access for list memberships" ON public.list_memberships FOR ALL USING (true);
CREATE POLICY "Enable access for newsletter recipients" ON public.newsletter_recipients FOR ALL USING (true);

-- Insert sample data (optional - remove if you don't want sample data)
-- Insert default templates if they don't exist
INSERT INTO public.templates (id, name, description, html_content, thumbnail_url, is_default)
SELECT * FROM (VALUES
    (uuid_generate_v4(), 'Welcome Series', 'Perfect for onboarding new subscribers', '<h1>Welcome!</h1><p>Thank you for subscribing.</p>', '/templates/welcome-series.svg', true),
    (uuid_generate_v4(), 'Weekly Update', 'Clean layout for regular updates', '<h1>Weekly Update</h1><p>Here are this weeks highlights.</p>', '/templates/weekly-update.svg', true),
    (uuid_generate_v4(), 'Product Announcement', 'Eye-catching template for launches', '<h1>New Product Launch!</h1><p>Were excited to announce...</p>', '/templates/product-announcement.svg', true),
    (uuid_generate_v4(), 'Event Invitation', 'Professional event announcements', '<h1>Youre Invited!</h1><p>Join us for our upcoming event.</p>', '/templates/event-invitation.svg', true),
    (uuid_generate_v4(), 'Newsletter Digest', 'Perfect for curated content', '<h1>Newsletter Digest</h1><p>This weeks top picks.</p>', '/templates/newsletter-digest.svg', true)
) AS t(id, name, description, html_content, thumbnail_url, is_default)
WHERE NOT EXISTS (SELECT 1 FROM public.templates WHERE name = t.name);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'Tables created: subscribers, newsletters, templates, subscriber_lists, list_memberships, newsletter_recipients';
    RAISE NOTICE 'Triggers and functions created for automatic updated_at handling';
    RAISE NOTICE 'Indexes created for better performance';
    RAISE NOTICE 'Row Level Security enabled with basic policies';
END $$;