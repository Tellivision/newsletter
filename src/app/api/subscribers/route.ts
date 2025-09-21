import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseSession, createUnauthorizedResponse } from '@/lib/auth-helpers'

// Mock database - in real app, this would be a proper database
let mockSubscribers = [
  {
    id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    status: 'active',
    subscribedAt: '2024-01-15T10:00:00Z',
    tags: ['newsletter', 'updates']
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    status: 'active',
    subscribedAt: '2024-01-20T14:30:00Z',
    tags: ['newsletter']
  },
  {
    id: '3',
    email: 'bob.wilson@example.com',
    name: 'Bob Wilson',
    status: 'unsubscribed',
    subscribedAt: '2024-01-10T09:15:00Z',
    unsubscribedAt: '2024-02-01T16:45:00Z',
    tags: ['newsletter', 'promotions']
  },
  {
    id: '4',
    email: 'alice.johnson@example.com',
    name: 'Alice Johnson',
    status: 'active',
    subscribedAt: '2024-02-05T11:20:00Z',
    tags: ['updates']
  },
  {
    id: '5',
    email: 'charlie.brown@example.com',
    name: 'Charlie Brown',
    status: 'active',
    subscribedAt: '2024-02-10T08:45:00Z',
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
      unsubscribed: mockSubscribers.filter(sub => sub.status === 'unsubscribed').length,
      growth: '+12%' // Mock growth rate
    }

    return NextResponse.json({
      subscribers: filteredSubscribers,
      stats
    })

  } catch (error) {
    console.error('Subscribers fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}

// POST - Add new subscriber
export async function POST(request: NextRequest) {
  try {
    const { session, error } = await getSupabaseSession()
    
    if (error || !session) {
      return createUnauthorizedResponse()
    }

    const { email, name, tags } = await request.json()
    
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