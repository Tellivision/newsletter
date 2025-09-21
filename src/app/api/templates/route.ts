import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseSession, createUnauthorizedResponse } from '@/lib/auth-helpers'

// Professional newsletter templates
const templates = [
  {
    id: 'welcome-series',
    name: 'Welcome Series',
    description: 'Perfect for onboarding new subscribers',
    category: 'Welcome',
    thumbnail: '/templates/welcome-series.svg',
    subject: 'Welcome to {{company_name}}! 🎉',
    content: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Welcome to {{company_name}}!</h1>
    <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">We're thrilled to have you join our community</p>
  </div>
  
  <div style="padding: 40px 20px;">
    <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Hi {{name}},</h2>
    
    <p style="font-size: 16px; margin-bottom: 20px;">Thank you for subscribing to our newsletter! You've just joined a community of amazing people who are passionate about staying informed and connected.</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <h3 style="color: #333; margin-top: 0;">What to expect:</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Weekly insights and updates</li>
        <li style="margin-bottom: 8px;">Exclusive content and offers</li>
        <li style="margin-bottom: 8px;">Tips and best practices</li>
        <li>Community highlights and stories</li>
      </ul>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 30px;">We respect your inbox and promise to only send you valuable content. You can update your preferences or unsubscribe at any time.</p>
    
    <div style="text-align: center;">
      <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Get Started</a>
    </div>
  </div>
  
  <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666;">
    <p style="margin: 0;">Best regards,<br>The {{company_name}} Team</p>
  </div>
</div>`,
    previewText: 'Welcome to our community! Here\'s what you can expect from us.'
  },
  {
    id: 'weekly-update',
    name: 'Weekly Update',
    description: 'Clean layout for regular updates and news',
    category: 'Newsletter',
    thumbnail: '/templates/weekly-update.svg',
    subject: 'Weekly Update - {{date}}',
    content: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="background: #2563eb; padding: 30px 20px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 26px; font-weight: bold;">Weekly Update</h1>
    <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">{{date}}</p>
  </div>
  
  <div style="padding: 40px 20px;">
    <h2 style="color: #333; font-size: 22px; margin-bottom: 20px;">Hi {{name}},</h2>
    
    <p style="font-size: 16px; margin-bottom: 30px;">Here are the highlights from this week that we thought you'd find interesting.</p>
    
    <!-- Article 1 -->
    <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 30px; margin-bottom: 30px;">
      <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 10px;">📈 This Week's Highlight</h3>
      <p style="font-size: 16px; margin-bottom: 15px;">Brief description of your main story or update. Keep it engaging and informative to encourage readers to learn more.</p>
      <a href="#" style="color: #2563eb; text-decoration: none; font-weight: bold;">Read more →</a>
    </div>
    
    <!-- Article 2 -->
    <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 30px; margin-bottom: 30px;">
      <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 10px;">🚀 Product Updates</h3>
      <p style="font-size: 16px; margin-bottom: 15px;">Share recent improvements, new features, or upcoming releases that your subscribers should know about.</p>
      <a href="#" style="color: #2563eb; text-decoration: none; font-weight: bold;">Learn more →</a>
    </div>
    
    <!-- Article 3 -->
    <div style="margin-bottom: 30px;">
      <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 10px;">💡 Quick Tips</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Tip #1: Keep your content concise and valuable</li>
        <li style="margin-bottom: 8px;">Tip #2: Use clear call-to-action buttons</li>
        <li>Tip #3: Maintain consistent branding</li>
      </ul>
    </div>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
      <p style="margin: 0; font-size: 16px;">Have feedback or suggestions? We'd love to hear from you!</p>
      <a href="mailto:feedback@company.com" style="color: #2563eb; text-decoration: none; font-weight: bold;">Send us a message</a>
    </div>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #666;">
    <p style="margin: 0;">Thanks for reading!<br>The {{company_name}} Team</p>
  </div>
</div>`,
    previewText: 'Your weekly dose of updates, insights, and tips.'
  },
  {
    id: 'product-announcement',
    name: 'Product Announcement',
    description: 'Eye-catching template for product launches',
    category: 'Announcement',
    thumbnail: '/templates/product-announcement.svg',
    subject: '🚀 Introducing {{product_name}} - You\'ll Love This!',
    content: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 50px 20px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 32px; font-weight: bold;">🚀 Big News!</h1>
    <p style="margin: 15px 0 0; font-size: 18px; opacity: 0.95;">We've been working on something special</p>
  </div>
  
  <div style="padding: 40px 20px;">
    <h2 style="color: #333; font-size: 28px; margin-bottom: 20px; text-align: center;">Introducing {{product_name}}</h2>
    
    <p style="font-size: 18px; margin-bottom: 30px; text-align: center; color: #666;">The solution you've been waiting for is finally here!</p>
    
    <div style="background: #fff; border: 2px solid #f5576c; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
      <h3 style="color: #f5576c; font-size: 24px; margin-top: 0;">What makes it special?</h3>
      <div style="display: grid; gap: 20px; margin-top: 25px;">
        <div>
          <h4 style="color: #333; margin-bottom: 8px;">✨ Feature One</h4>
          <p style="margin: 0; color: #666;">Brief description of your key feature and its benefits</p>
        </div>
        <div>
          <h4 style="color: #333; margin-bottom: 8px;">⚡ Feature Two</h4>
          <p style="margin: 0; color: #666;">Another compelling feature that solves user problems</p>
        </div>
        <div>
          <h4 style="color: #333; margin-bottom: 8px;">🎯 Feature Three</h4>
          <p style="margin: 0; color: #666;">The feature that sets you apart from competitors</p>
        </div>
      </div>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="#" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px;">Try It Now</a>
    </div>
    
    <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #f5576c;">
      <h4 style="color: #333; margin-top: 0;">Special Launch Offer</h4>
      <p style="margin: 0; font-size: 16px;">As a valued subscriber, you get <strong>early access</strong> and <strong>20% off</strong> for the first month. Use code: <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">EARLY20</code></p>
    </div>
  </div>
  
  <div style="background: #f8f9fa; padding: 25px; text-align: center; font-size: 14px; color: #666;">
    <p style="margin: 0;">Questions? We're here to help!<br>Reply to this email or visit our <a href="#" style="color: #f5576c;">support center</a></p>
  </div>
</div>`,
    previewText: 'Exciting news! We\'re launching something amazing just for you.'
  },
  {
    id: 'event-invitation',
    name: 'Event Invitation',
    description: 'Professional template for event announcements',
    category: 'Event',
    thumbnail: '/templates/event-invitation.svg',
    subject: 'You\'re Invited: {{event_name}} - {{date}}',
    content: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 30px; font-weight: bold;">You're Invited!</h1>
    <p style="margin: 15px 0 0; font-size: 16px; opacity: 0.9;">Join us for an exclusive event</p>
  </div>
  
  <div style="padding: 40px 20px;">
    <h2 style="color: #333; font-size: 26px; margin-bottom: 20px; text-align: center;">{{event_name}}</h2>
    
    <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; margin: 30px 0;">
      <div style="display: grid; gap: 20px;">
        <div style="display: flex; align-items: center;">
          <span style="background: #667eea; color: white; padding: 8px; border-radius: 50%; margin-right: 15px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">📅</span>
          <div>
            <strong>Date & Time</strong><br>
            <span style="color: #666;">{{date}} at {{time}}</span>
          </div>
        </div>
        
        <div style="display: flex; align-items: center;">
          <span style="background: #667eea; color: white; padding: 8px; border-radius: 50%; margin-right: 15px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">📍</span>
          <div>
            <strong>Location</strong><br>
            <span style="color: #666;">{{location}}</span>
          </div>
        </div>
        
        <div style="display: flex; align-items: center;">
          <span style="background: #667eea; color: white; padding: 8px; border-radius: 50%; margin-right: 15px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">👥</span>
          <div>
            <strong>Who Should Attend</strong><br>
            <span style="color: #666;">{{target_audience}}</span>
          </div>
        </div>
      </div>
    </div>
    
    <h3 style="color: #333; font-size: 20px; margin-bottom: 15px;">What You'll Learn</h3>
    <ul style="margin: 0 0 30px; padding-left: 20px;">
      <li style="margin-bottom: 8px;">Key insights from industry experts</li>
      <li style="margin-bottom: 8px;">Practical strategies you can implement immediately</li>
      <li style="margin-bottom: 8px;">Networking opportunities with like-minded professionals</li>
      <li>Exclusive resources and materials</li>
    </ul>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="#" style="background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px;">Reserve Your Spot</a>
    </div>
    
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; text-align: center;">
      <p style="margin: 0; color: #856404;"><strong>Limited Seats Available!</strong><br>Only {{seats_left}} spots remaining. Register now to secure your place.</p>
    </div>
  </div>
  
  <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666;">
    <p style="margin: 0;">Can't make it? <a href="#" style="color: #667eea;">Let us know</a> and we'll send you the recording.<br>Questions? Contact us at <a href="mailto:events@company.com" style="color: #667eea;">events@company.com</a></p>
  </div>
</div>`,
    previewText: 'Join us for an exclusive event - limited seats available!'
  },
  {
    id: 'newsletter-digest',
    name: 'Newsletter Digest',
    description: 'Perfect for curated content and link roundups',
    category: 'Newsletter',
    thumbnail: '/templates/newsletter-digest.svg',
    subject: '📰 This Week\'s Top Picks - {{date}}',
    content: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="background: #1f2937; padding: 30px 20px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">📰 Weekly Digest</h1>
    <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.8;">Curated content just for you</p>
  </div>
  
  <div style="padding: 40px 20px;">
    <p style="font-size: 16px; margin-bottom: 30px;">Hi {{name}}, here are this week's most interesting articles, tools, and resources we've discovered.</p>
    
    <!-- Article 1 -->
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <div style="display: flex; align-items: flex-start; gap: 15px;">
        <span style="background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; min-width: fit-content;">TRENDING</span>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 8px; font-size: 18px; color: #1f2937;">
            <a href="#" style="color: #1f2937; text-decoration: none;">Article Title: The Future of Technology</a>
          </h3>
          <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Brief description of the article and why it's worth reading. Keep it concise but compelling.</p>
          <a href="#" style="color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: bold;">Read more →</a>
        </div>
      </div>
    </div>
    
    <!-- Article 2 -->
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <div style="display: flex; align-items: flex-start; gap: 15px;">
        <span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; min-width: fit-content;">TOOLS</span>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 8px; font-size: 18px; color: #1f2937;">
            <a href="#" style="color: #1f2937; text-decoration: none;">New Tool: Productivity Booster</a>
          </h3>
          <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">A game-changing tool that will revolutionize how you work. Here's what makes it special.</p>
          <a href="#" style="color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: bold;">Try it out →</a>
        </div>
      </div>
    </div>
    
    <!-- Article 3 -->
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
      <div style="display: flex; align-items: flex-start; gap: 15px;">
        <span style="background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; min-width: fit-content;">TUTORIAL</span>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 8px; font-size: 18px; color: #1f2937;">
            <a href="#" style="color: #1f2937; text-decoration: none;">How-to Guide: Master This Skill</a>
          </h3>
          <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Step-by-step tutorial that will help you level up your skills in just 10 minutes.</p>
          <a href="#" style="color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: bold;">Learn now →</a>
        </div>
      </div>
    </div>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
      <h4 style="margin: 0 0 10px; color: #1f2937;">💡 Quick Tip of the Week</h4>
      <p style="margin: 0; font-size: 16px; color: #4b5563;">Always test your newsletter templates across different email clients to ensure consistent rendering.</p>
    </div>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #666;">
    <p style="margin: 0;">Enjoyed this digest? <a href="#" style="color: #3b82f6;">Share it with a friend</a><br>Have suggestions? <a href="#" style="color: #3b82f6;">Let us know</a></p>
  </div>
</div>`,
    previewText: 'This week\'s curated collection of the best articles, tools, and resources.'
  }
]

// GET - Fetch all templates
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await getSupabaseSession()
    
    if (error || !session) {
      return createUnauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let filteredTemplates = templates

    // Filter by category if specified
    if (category && category !== 'all') {
      filteredTemplates = templates.filter(template => 
        template.category.toLowerCase() === category.toLowerCase()
      )
    }

    // Get unique categories for filtering
    const categories = [...new Set(templates.map(t => t.category))]

    return NextResponse.json({
      templates: filteredTemplates,
      categories
    })

  } catch (error) {
    console.error('Templates fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// GET specific template by ID
export async function POST(request: NextRequest) {
  try {
    const { session, error } = await getSupabaseSession()
    
    if (error || !session) {
      return createUnauthorizedResponse()
    }

    const { templateId } = await request.json()
    
    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const template = templates.find(t => t.id === templateId)
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ template })

  } catch (error) {
    console.error('Template fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}