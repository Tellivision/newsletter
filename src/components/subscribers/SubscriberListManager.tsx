'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Search, Mail, Trash2, Plus, Upload } from 'lucide-react'
import { CSVImporter } from './CSVImporter'
import { SheetsImporter } from './SheetsImporter'

interface Subscriber {
  id: string
  email: string
  name?: string
  status: 'active' | 'unsubscribed' | 'bounced'
  tags?: string[]
  subscribed_at: string
}

interface SubscriberStats {
  total: number
  active: number
  inactive: number
  bounced: number
}

interface SubscriberListManagerProps {
  onSubscriberUpdate?: () => void
}

export function SubscriberListManager({ onSubscriberUpdate }: SubscriberListManagerProps) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [stats, setStats] = useState<SubscriberStats>({ total: 0, active: 0, inactive: 0, bounced: 0 })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showImporter, setShowImporter] = useState<'csv' | 'sheets' | null>(null)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true)
      const statusParam = selectedStatus !== 'all' ? `?status=${selectedStatus}` : ''
      const response = await fetch(`/api/subscribers${statusParam}`)
      
      if (response.ok) {
        const data = await response.json()
        setSubscribers(data.subscribers || [])
        setStats(data.stats || { total: 0, active: 0, inactive: 0, bounced: 0 })
      } else {
        console.error('Failed to fetch subscribers')
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedStatus])

  useEffect(() => {
    fetchSubscribers()
  }, [selectedStatus, fetchSubscribers])

  const handleAddSubscriber = async () => {
    if (!newEmail.trim()) return

    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newEmail,
          name: newName || newEmail.split('@')[0],
          tags: ['manual']
        })
      })

      if (response.ok) {
        setNewEmail('')
        setNewName('')
        fetchSubscribers()
        onSubscriberUpdate?.()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to add subscriber')
      }
    } catch (error) {
      console.error('Error adding subscriber:', error)
      alert('Failed to add subscriber')
    }
  }

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return

    try {
      const response = await fetch(`/api/subscribers?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchSubscribers()
        onSubscriberUpdate?.()
      } else {
        alert('Failed to remove subscriber')
      }
    } catch (error) {
      console.error('Error removing subscriber:', error)
      alert('Failed to remove subscriber')
    }
  }

  const handleImport = async (emails: string[], listName?: string) => {
    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'bulk_add',
          emails,
          listName
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        fetchSubscribers()
        onSubscriberUpdate?.()
        setShowImporter(null)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to import subscribers')
      }
    } catch (error) {
      console.error('Error importing subscribers:', error)
      alert('Failed to import subscribers')
    }
  }

  const filteredSubscribers = subscribers.filter(sub =>
    sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'unsubscribed': return 'bg-gray-100 text-gray-800'
      case 'bounced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Mail className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unsubscribed</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
              <Users className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bounced</p>
                <p className="text-2xl font-bold text-red-600">{stats.bounced}</p>
              </div>
              <Mail className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Subscribers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add subscriber */}
          <div className="flex gap-2">
            <Input
              placeholder="Email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSubscriber()}
            />
            <Input
              placeholder="Name (optional)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSubscriber()}
            />
            <Button onClick={handleAddSubscriber} disabled={!newEmail.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {/* Import options */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowImporter('csv')}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowImporter('sheets')}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import from Google Sheets
            </Button>
          </div>

          {/* Search and filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search subscribers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
              <option value="bounced">Bounced</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Import modals */}
      {showImporter === 'csv' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Import CSV</h3>
              <Button
                variant="ghost"
                onClick={() => setShowImporter(null)}
                className="p-1"
              >
                ×
              </Button>
            </div>
            <CSVImporter 
              onImport={handleImport} 
              onImportComplete={() => {
                setShowImporter(null)
                fetchSubscribers()
                onSubscriberUpdate?.()
              }}
            />
          </div>
        </div>
      )}

      {showImporter === 'sheets' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Import from Google Sheets</h3>
              <Button
                variant="ghost"
                onClick={() => setShowImporter(null)}
                className="p-1"
              >
                ×
              </Button>
            </div>
            <SheetsImporter 
              onImport={handleImport} 
              onImportComplete={() => {
                setShowImporter(null)
                fetchSubscribers()
                onSubscriberUpdate?.()
              }}
            />
          </div>
        </div>
      )}

      {/* Subscriber list */}
      <Card>
        <CardHeader>
          <CardTitle>Subscribers ({filteredSubscribers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No subscribers found. Start by importing a list or adding subscribers manually.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSubscribers.map((subscriber) => (
                <div
                  key={subscriber.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{subscriber.email}</span>
                      {subscriber.name && (
                        <span className="text-gray-600">({subscriber.name})</span>
                      )}
                      <Badge className={getStatusColor(subscriber.status)}>
                        {subscriber.status}
                      </Badge>
                    </div>
                    {subscriber.tags && subscriber.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {subscriber.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Subscribed {new Date(subscriber.subscribed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubscriber(subscriber.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}