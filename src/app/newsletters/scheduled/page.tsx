'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Calendar, Users, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface ScheduledNewsletter {
  id: string
  subject: string
  scheduledAt: string
  recipientCount: number
  status: 'scheduled' | 'sent' | 'failed'
  createdAt: string
}

export default function ScheduledNewslettersPage() {
  const { user } = useAuth()
  const [scheduledNewsletters, setScheduledNewsletters] = useState<ScheduledNewsletter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchScheduledNewsletters()
    }
  }, [user])

  const fetchScheduledNewsletters = async () => {
    try {
      const response = await fetch('/api/newsletters/schedule')
      if (response.ok) {
        const data = await response.json()
        setScheduledNewsletters(data.scheduledNewsletters)
      }
    } catch (error) {
      console.error('Failed to fetch scheduled newsletters:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const cancelScheduledNewsletter = async (id: string) => {
    setCancellingId(id)
    try {
      const response = await fetch(`/api/newsletters/schedule?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setScheduledNewsletters(prev => prev.filter(newsletter => newsletter.id !== id))
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to cancel newsletter')
      }
    } catch (error) {
      console.error('Failed to cancel newsletter:', error)
      alert('Failed to cancel newsletter')
    } finally {
      setCancellingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-600 bg-blue-50'
      case 'sent':
        return 'text-green-600 bg-green-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (!user) {
    return (
      <MainLayout title="Scheduled Newsletters">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Please sign in to view scheduled newsletters.</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title="Scheduled Newsletters">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scheduled Newsletters</h1>
            <p className="text-gray-600 mt-1">
              Manage your upcoming newsletter sends
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {scheduledNewsletters.filter(n => n.status === 'scheduled').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {scheduledNewsletters.filter(n => n.status === 'sent').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {scheduledNewsletters.filter(n => n.status === 'failed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scheduled Newsletters List */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sends</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="ml-2 text-gray-600">Loading scheduled newsletters...</span>
              </div>
            ) : scheduledNewsletters.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No scheduled newsletters
                </h3>
                <p className="text-gray-600 mb-4">
                  You don't have any newsletters scheduled for sending.
                </p>
                <Button onClick={() => window.location.href = '/editor'}>
                  Create Newsletter
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledNewsletters.map((newsletter) => (
                  <div
                    key={newsletter.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(newsletter.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(newsletter.status)}`}>
                          {newsletter.status.charAt(0).toUpperCase() + newsletter.status.slice(1)}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {newsletter.subject}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(newsletter.scheduledAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{newsletter.recipientCount} recipients</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {newsletter.status === 'scheduled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelScheduledNewsletter(newsletter.id)}
                          disabled={cancellingId === newsletter.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {cancellingId === newsletter.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-1" />
                              Cancel
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}