-- Newsletter Pro Database Setup Script
-- This script creates all necessary tables for the newsletter application
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create subscribers table
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
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(newsletter_id, subscriber_id)
);

-- Create scheduled_newsletters table for future sending
CREATE TABLE IF NOT EXISTS public.scheduled_newsletters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    recipients TEXT[] NOT NULL, -- Array of subscriber emails
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Create analytics table for tracking performance
CREATE TABLE IF NOT EXISTS public.newsletter_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    newsletter_id UUID NOT NULL REFERENCES public.newsletters(id) ON DELETE CASCADE,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(newsletter_id)
);

-- Create user_settings table for user preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    from_name VARCHAR(255),
    from_email VARCHAR(255),
    reply_to VARCHAR(255),
    track_opens BOOLEAN DEFAULT TRUE,
    track_clicks BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public.subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON public.subscribers(created_at);

CREATE INDEX IF NOT EXISTS idx_newsletters_user_id ON public.newsletters(user_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON public.newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_created_at ON public.newsletters(created_at);

CREATE INDEX IF NOT EXISTS idx_newsletter_recipients_newsletter_id ON public.newsletter_recipients(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_recipients_subscriber_id ON public.newsletter_recipients(subscriber_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_newsletters_user_id ON public.scheduled_newsletters(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_newsletters_scheduled_at ON public.scheduled_newsletters(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_newsletters_status ON public.scheduled_newsletters(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_subscribers_updated_at BEFORE UPDATE ON public.subscribers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletters_updated_at BEFORE UPDATE ON public.newsletters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_analytics_updated_at BEFORE UPDATE ON public.newsletter_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default templates
INSERT INTO public.templates (name, description, html_content, is_default) VALUES
('Simple Newsletter', 'A clean and simple newsletter template', 
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <header style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px;">
        <h1 style="color: #2c3e50; margin: 0;">Newsletter</h1>
    </header>
    <main>
        {{content}}
    </main>
    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
        <p>Thank you for subscribing!</p>
        <p><a href="{{unsubscribe_link}}" style="color: #666;">Unsubscribe</a></p>
    </footer>
</body>
</html>', TRUE),

('Professional Business', 'A professional template for business communications',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
</head>
<body style="font-family: Georgia, serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
    <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <header style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a365d; margin: 0; font-size: 28px;">{{company_name}}</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Professional Newsletter</p>
        </header>
        <main>
            {{content}}
        </main>
        <footer style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #1a365d; text-align: center; color: #666; font-size: 14px;">
            <p>Best regards,<br>The {{company_name}} Team</p>
            <p><a href="{{unsubscribe_link}}" style="color: #1a365d;">Unsubscribe</a></p>
        </footer>
    </div>
</body>
</html>', TRUE),

('Modern Minimal', 'A modern, minimal design template',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
    <header style="margin-bottom: 40px;">
        <h1 style="color: #111827; margin: 0; font-size: 32px; font-weight: 300; letter-spacing: -0.5px;">{{title}}</h1>
        <div style="width: 50px; height: 2px; background-color: #3b82f6; margin: 15px 0;"></div>
    </header>
    <main style="margin-bottom: 40px;">
        {{content}}
    </main>
    <footer style="padding-top: 30px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
        <p>Thanks for reading!</p>
        <p><a href="{{unsubscribe_link}}" style="color: #6b7280; text-decoration: none;">Unsubscribe</a></p>
    </footer>
</body>
</html>', TRUE);

-- Enable Row Level Security (RLS)
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Subscribers: Users can manage all subscribers (for now - can be restricted later)
CREATE POLICY "Users can view all subscribers" ON public.subscribers
    FOR SELECT USING (true);

CREATE POLICY "Users can insert subscribers" ON public.subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update subscribers" ON public.subscribers
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete subscribers" ON public.subscribers
    FOR DELETE USING (true);

-- Newsletters: Users can only access their own newsletters
CREATE POLICY "Users can view own newsletters" ON public.newsletters
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own newsletters" ON public.newsletters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own newsletters" ON public.newsletters
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own newsletters" ON public.newsletters
    FOR DELETE USING (auth.uid() = user_id);

-- Templates: All users can view templates, but only admins can modify (for now, allow all)
CREATE POLICY "Users can view all templates" ON public.templates
    FOR SELECT USING (true);

CREATE POLICY "Users can insert templates" ON public.templates
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update templates" ON public.templates
    FOR UPDATE USING (true);

-- Newsletter recipients: Users can access recipients for their newsletters
CREATE POLICY "Users can view newsletter recipients" ON public.newsletter_recipients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.newsletters 
            WHERE newsletters.id = newsletter_recipients.newsletter_id 
            AND newsletters.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert newsletter recipients" ON public.newsletter_recipients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.newsletters 
            WHERE newsletters.id = newsletter_recipients.newsletter_id 
            AND newsletters.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update newsletter recipients" ON public.newsletter_recipients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.newsletters 
            WHERE newsletters.id = newsletter_recipients.newsletter_id 
            AND newsletters.user_id = auth.uid()
        )
    );

-- Scheduled newsletters: Users can only access their own
CREATE POLICY "Users can view own scheduled newsletters" ON public.scheduled_newsletters
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled newsletters" ON public.scheduled_newsletters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled newsletters" ON public.scheduled_newsletters
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled newsletters" ON public.scheduled_newsletters
    FOR DELETE USING (auth.uid() = user_id);

-- Newsletter analytics: Users can view analytics for their newsletters
CREATE POLICY "Users can view newsletter analytics" ON public.newsletter_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.newsletters 
            WHERE newsletters.id = newsletter_analytics.newsletter_id 
            AND newsletters.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert newsletter analytics" ON public.newsletter_analytics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.newsletters 
            WHERE newsletters.id = newsletter_analytics.newsletter_id 
            AND newsletters.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update newsletter analytics" ON public.newsletter_analytics
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.newsletters 
            WHERE newsletters.id = newsletter_analytics.newsletter_id 
            AND newsletters.user_id = auth.uid()
        )
    );

-- User settings: Users can only access their own settings
CREATE POLICY "Users can view own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create a function to get subscriber statistics
CREATE OR REPLACE FUNCTION get_subscriber_stats()
RETURNS TABLE (
    total_subscribers BIGINT,
    active_subscribers BIGINT,
    unsubscribed_subscribers BIGINT,
    bounced_subscribers BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_subscribers,
        COUNT(*) FILTER (WHERE status = 'active') as active_subscribers,
        COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed_subscribers,
        COUNT(*) FILTER (WHERE status = 'bounced') as bounced_subscribers
    FROM public.subscribers;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get newsletter statistics
CREATE OR REPLACE FUNCTION get_newsletter_stats(user_uuid UUID)
RETURNS TABLE (
    total_newsletters BIGINT,
    draft_newsletters BIGINT,
    sent_newsletters BIGINT,
    scheduled_newsletters BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_newsletters,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_newsletters,
        COUNT(*) FILTER (WHERE status = 'sent') as sent_newsletters,
        COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled_newsletters
    FROM public.newsletters
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Newsletter Pro database setup completed successfully!';
    RAISE NOTICE 'Tables created: subscribers, newsletters, templates, newsletter_recipients, scheduled_newsletters, newsletter_analytics, user_settings';
    RAISE NOTICE 'Default templates inserted: Simple Newsletter, Professional Business, Modern Minimal';
    RAISE NOTICE 'Row Level Security enabled with appropriate policies';
    RAISE NOTICE 'Helper functions created: get_subscriber_stats(), get_newsletter_stats()';
END $$;