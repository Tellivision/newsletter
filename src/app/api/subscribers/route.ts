import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseSession, createUnauthorizedResponse } from '@/lib/auth-helpers'

// Mock database - in real app, this would be a proper database
const mockSubscribers: {
  id: string
  email: string
  first_name?: string
  last_name?: string
  status: string
  created_at: string
  updated_at?: string
  tags?: string[]
}[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    first_name: 'John',
    last_name: 'Doe',
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    tags: ['newsletter', 'updates']
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    first_name: 'Jane',
    last_name: 'Smith',
    status: 'active',
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    tags: ['newsletter']
  },
  {
    id: '3',
    email: 'bob.wilson@example.com',
    first_name: 'Bob',
    last_name: 'Wilson',
    status: 'inactive',
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-02-01T16:45:00Z',
    tags: ['newsletter', 'promotions']
  },
  {
    id: '4',
    email: 'alice.johnson@example.com',
    first_name: 'Alice',
    last_name: 'Johnson',
    status: 'active',
    created_at: '2024-02-05T11:20:00Z',
    updated_at: '2024-02-05T11:20:00Z',
    tags: ['updates']
  },
  {
    id: '5',
    email: 'charlie.brown@example.com',
    first_name: 'Charlie',
    last_name: 'Brown',
    status: 'active',
    created_at: '2024-02-10T08:45:00Z',
    updated_at: '2024-02-10T08:45:00Z',
    tags: ['newsletter', 'updates', 'promotions']
  }
]

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

    let filteredSubscribers = mockSubscribers

    // Filter by status
    if (status && status !== 'all') {
      filteredSubscribers = filteredSubscribers.filter(sub => sub.status === status)
    }

    // Filter by tag
    if (tag && tag !== 'all') {
      filteredSubscribers = filteredSubscribers.filter(sub => sub.tags.includes(tag))
    }

    // Calculate stats
    const stats = {
      total: mockSubscribers.length,
      active: mockSubscribers.filter(sub => sub.status === 'active').length,
      inactive: mockSubscribers.filter(sub => sub.status === 'inactive').length,
      bounced: mockSubscribers.filter(sub => sub.status === 'bounced').length
    }

    return NextResponse.json(filteredSubscribers)

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
    
// Handle bulk email import with proper structure
    if (body.action === 'bulk_add' && body.emails) {
      const emails = body.emails as string[]
      const listName = body.listName || `Imported List ${new Date().toLocaleDateString()}`
      
      // For now, add to mock data (in real app, this would go to Supabase)
      const newSubscribers = emails.map((email, index) => ({
        id: `bulk_${Date.now()}_${index}`,
        email: email.toLowerCase().trim(),
        first_name: '',
        last_name: '',
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['imported', listName]
      }))
      
      // Add to mock database (avoiding duplicates)
      const existingEmails = new Set(mockSubscribers.map(s => s.email))
      const uniqueSubscribers = newSubscribers.filter(s => !existingEmails.has(s.email))
      
      mockSubscribers.push(...uniqueSubscribers)
      
      return NextResponse.json({ 
        message: `Successfully added ${uniqueSubscribers.length} new subscribers to "${listName}" (${emails.length - uniqueSubscribers.length} duplicates skipped)`,
        added_count: uniqueSubscribers.length,
        total_count: emails.length,
        list_name: listName,
        subscribers: uniqueSubscribers 
      })
    }

    // Handle subscriber with proper structure for individual adds
    if (body.emails && Array.isArray(body.emails)) {
      const subscriberEmails = body.emails as Array<{email: string; first_name?: string; last_name?: string}>
      
      const newSubscribers = subscriberEmails.map((sub, index) => ({
        id: `manual_${Date.now()}_${index}`,
        email: sub.email.toLowerCase().trim(),
        first_name: sub.first_name || '',
        last_name: sub.last_name || '',
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['manual']
      }))
      
      // Add to mock database (avoiding duplicates)
      const existingEmails = new Set(mockSubscribers.map(s => s.email))
      const uniqueSubscribers = newSubscribers.filter(s => !existingEmails.has(s.email))
      
      mockSubscribers.push(...uniqueSubscribers)
      
      return NextResponse.json({
        success: true,
        subscribers: uniqueSubscribers,
        message: `Added ${uniqueSubscribers.length} new subscribers`
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

    // Check if subscriber already exists
    const existingSubscriber = mockSubscribers.find(sub => sub.email === email)
    if (existingSubscriber) {
      return NextResponse.json(
        { error: 'Subscriber already exists' },
        { status: 409 }
      )
    }

    // Create new subscriber
    const newSubscriber = {
      id: (mockSubscribers.length + 1).toString(),
      email,
      name: name || email.split('@')[0],
      status: 'active',
      subscribedAt: new Date().toISOString(),
      tags: tags || ['newsletter']
    }

    mockSubscribers.push(newSubscriber)

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

    const subscriberIndex = mockSubscribers.findIndex(sub => sub.id === id)
    if (subscriberIndex === -1) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      )
    }

    mockSubscribers.splice(subscriberIndex, 1)

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