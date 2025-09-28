import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseSession, createUnauthorizedResponse } from '@/lib/auth-helpers'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch all subscribers
export async function GET(request: NextRequest) {
  try {
    const { session, error } = await getSupabaseSession()
    
    if (error || !session) {
      return createUnauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const tag = searchParams.get('tag')

    let query = supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Filter by tag
    if (tag && tag !== 'all') {
      query = query.contains('tags', [tag])
    }

    const { data: subscribers, error: fetchError } = await query

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch subscribers from database' },
        { status: 500 }
      )
    }

    // Get subscriber statistics
    const { data: stats, error: statsError } = await supabase
      .rpc('get_subscriber_stats')

    if (statsError) {
      console.error('Supabase stats error:', statsError)
    }

    const statsData = stats?.[0] || {
      total_subscribers: subscribers?.length || 0,
      active_subscribers: subscribers?.filter(s => s.status === 'active').length || 0,
      unsubscribed_subscribers: subscribers?.filter(s => s.status === 'unsubscribed').length || 0,
      bounced_subscribers: subscribers?.filter(s => s.status === 'bounced').length || 0
    }

    return NextResponse.json({
      subscribers: subscribers || [],
      stats: {
        total: Number(statsData.total_subscribers),
        active: Number(statsData.active_subscribers),
        inactive: Number(statsData.unsubscribed_subscribers),
        bounced: Number(statsData.bounced_subscribers)
      }
    })

  } catch (error) {
    console.error('Subscribers fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}

// POST - Add new subscriber or bulk import
export async function POST(request: NextRequest) {
  try {
    const { session, error } = await getSupabaseSession()
    
    if (error || !session) {
      return createUnauthorizedResponse()
    }

    const body = await request.json()
    
    // Handle bulk email import
    if (body.action === 'bulk_add' && body.emails) {
      const emails = body.emails as string[]
      const listName = body.listName || `Imported List ${new Date().toLocaleDateString()}`
      
      // Prepare subscriber data
      const subscriberData = emails.map(email => ({
        email: email.toLowerCase().trim(),
        name: email.split('@')[0], // Use email prefix as default name
        status: 'active',
        tags: ['imported', listName],
        subscribed_at: new Date().toISOString()
      }))

      // Insert subscribers (on conflict, do nothing to avoid duplicates)
      const { data: insertedSubscribers, error: insertError } = await supabase
        .from('subscribers')
        .upsert(subscriberData, { 
          onConflict: 'email',
          ignoreDuplicates: true 
        })
        .select()

      if (insertError) {
        console.error('Supabase insert error:', insertError)
        return NextResponse.json(
          { error: 'Failed to import subscribers to database' },
          { status: 500 }
        )
      }

      const addedCount = insertedSubscribers?.length || 0
      
      return NextResponse.json({ 
        message: `Successfully added ${addedCount} new subscribers to "${listName}" (${emails.length - addedCount} duplicates skipped)`,
        added_count: addedCount,
        total_count: emails.length,
        list_name: listName,
        subscribers: insertedSubscribers || []
      })
    }

    // Handle individual subscriber with proper structure
    if (body.emails && Array.isArray(body.emails)) {
      const subscriberEmails = body.emails as Array<{email: string; first_name?: string; last_name?: string}>
      
      const subscriberData = subscriberEmails.map(sub => ({
        email: sub.email.toLowerCase().trim(),
        name: sub.first_name && sub.last_name 
          ? `${sub.first_name} ${sub.last_name}` 
          : sub.first_name || sub.email.split('@')[0],
        status: 'active',
        tags: ['manual'],
        subscribed_at: new Date().toISOString()
      }))

      const { data: insertedSubscribers, error: insertError } = await supabase
        .from('subscribers')
        .upsert(subscriberData, { 
          onConflict: 'email',
          ignoreDuplicates: true 
        })
        .select()

      if (insertError) {
        console.error('Supabase insert error:', insertError)
        return NextResponse.json(
          { error: 'Failed to add subscribers to database' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        subscribers: insertedSubscribers || [],
        message: `Added ${insertedSubscribers?.length || 0} new subscribers`
      })
    }

    // Handle single subscriber (existing logic)
    const { email, name, tags } = body
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Create new subscriber
    const { data: newSubscriber, error: insertError } = await supabase
      .from('subscribers')
      .insert({
        email: email.toLowerCase().trim(),
        name: name || email.split('@')[0],
        status: 'active',
        tags: tags || ['newsletter'],
        subscribed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      if (insertError.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'Subscriber already exists' },
          { status: 409 }
        )
      }
      console.error('Supabase insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to add subscriber to database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscriber: newSubscriber
    })

  } catch (error) {
    console.error('Add subscriber error:', error)
    return NextResponse.json(
      { error: 'Failed to add subscriber' },
      { status: 500 }
    )
  }
}

// DELETE - Remove subscriber
export async function DELETE(request: NextRequest) {
  try {
    const { session, error } = await getSupabaseSession()
    
    if (error || !session) {
      return createUnauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Subscriber ID is required' },
        { status: 400 }
      )
    }

    const { error: deleteError } = await supabase
      .from('subscribers')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Supabase delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete subscriber from database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Subscriber removed successfully'
    })

  } catch (error) {
    console.error('Delete subscriber error:', error)
    return NextResponse.json(
      { error: 'Failed to delete subscriber' },
      { status: 500 }
    )
  }
}