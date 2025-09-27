'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { MainLayout } from '@/components/layout/main-layout'
import { DashboardGrid, DashboardCard } from '@/components/layout/dashboard-grid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, Users, FileText, TrendingUp, Calendar, Mail } from 'lucide-react'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const mockStats = {
  totalSubscribers: 1247,
  totalNewsletters: 23,
  lastSent: 'Yesterday',
  upcoming: 2
}

const recentNewsletters = [
  { id: 1, title: 'Weekly Update #23', status: 'sent', sentAt: '2 days ago' },
  { id: 2, title: 'Product Launch Announcement', status: 'scheduled', scheduledAt: 'Tomorrow' },
  { id: 3, title: 'Monthly Newsletter', status: 'draft', updatedAt: '1 week ago' },
]

// OAuth callback handler component
function OAuthCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    
    if (code || error) {
      console.log('OAuth callback detected at root, cleaning URL')
      // Clean the URL by removing OAuth parameters
      router.replace('/')
    }
  }, [searchParams, router])

  return null
}

// Simple landing page for unauthenticated users
function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <Mail className="h-12 w-12 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">GoogLetter</h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              Create and manage professional newsletters with seamless Google integration
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Rich Editor</h3>
              <p className="text-gray-600">Create beautiful newsletters with our professional editor</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Manage Subscribers</h3>
              <p className="text-gray-600">Easily organize and manage your subscriber lists</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-gray-600">Track engagement and optimize your campaigns</p>
            </div>
          </div>

          <div className="space-y-4">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
              <Link href="/auth/signin">
                Get Started Free
              </Link>
            </Button>
            <p className="text-sm text-gray-500">
              Sign in with Google to start creating newsletters
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LandingPage />
  }

  const meta = user.user_metadata as { name?: string; full_name?: string; avatar_url?: string; picture?: string }
  const uiUser = {
    name: meta.name ?? meta.full_name ?? (user.email ? user.email.split('@')[0] : 'User'),
    email: user.email ?? '',
    image: meta.avatar_url ?? meta.picture,
  }

  return (
    <MainLayout title="Dashboard" user={uiUser}>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {uiUser.name || 'User'}!
        </h1>
        <p className="text-gray-600">
          Here&apos;s what&apos;s happening with your newsletters today.
        </p>
      </div>

      {/* Stats Grid */}
      <DashboardGrid className="mb-8">
        <DashboardCard>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{mockStats.totalSubscribers.toLocaleString()}</div>
              <p className="text-xs text-gray-600">
                +12% from last month
              </p>
            </CardContent>
          </Card>
        </DashboardCard>

        <DashboardCard>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Newsletters</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{mockStats.totalNewsletters}</div>
              <p className="text-xs text-gray-600">Last sent {mockStats.lastSent}</p>
            </CardContent>
          </Card>
        </DashboardCard>

        <DashboardCard>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Open Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">24.5%</div>
              <p className="text-xs text-gray-600">+2.1% from last month</p>
            </CardContent>
          </Card>
        </DashboardCard>

        <DashboardCard>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Upcoming Sends</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{mockStats.upcoming}</div>
              <p className="text-xs text-gray-600">Next: Tomorrow</p>
            </CardContent>
          </Card>
        </DashboardCard>
      </DashboardGrid>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/newsletters/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Newsletter
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
            <Link href="/subscribers">
              <Users className="mr-2 h-4 w-4" />
              View Subscribers
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Newsletters */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Newsletters</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentNewsletters.map((newsletter) => (
                <div key={newsletter.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{newsletter.title}</h3>
                    <p className="text-sm text-gray-600">
                      {newsletter.status === 'sent' && `Sent ${newsletter.sentAt}`}
                      {newsletter.status === 'scheduled' && `Scheduled for ${newsletter.scheduledAt}`}
                      {newsletter.status === 'draft' && `Draft • Updated ${newsletter.updatedAt}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      newsletter.status === 'sent' ? 'bg-green-100 text-green-800' :
                      newsletter.status === 'scheduled' ? 'bg-blue-600 text-white' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {newsletter.status}
                    </span>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-gray-100">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default function Dashboard() {
  return (
    <>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }>
        <OAuthCallbackHandler />
      </Suspense>
      <DashboardContent />
    </>
  )
}
