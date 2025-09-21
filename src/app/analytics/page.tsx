'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Mail, 
  Eye, 
  MousePointer, 
  Users,
  Calendar,
  Download,
  Filter
} from 'lucide-react';

const deliveryData = [
  { name: 'Jan', delivered: 1200, opened: 480, clicked: 96 },
  { name: 'Feb', delivered: 1350, opened: 540, clicked: 108 },
  { name: 'Mar', delivered: 1100, opened: 440, clicked: 88 },
  { name: 'Apr', delivered: 1450, opened: 580, clicked: 116 },
  { name: 'May', delivered: 1600, opened: 640, clicked: 128 },
  { name: 'Jun', delivered: 1750, opened: 700, clicked: 140 }
];

const engagementData = [
  { name: 'Week 1', openRate: 35, clickRate: 8 },
  { name: 'Week 2', openRate: 42, clickRate: 12 },
  { name: 'Week 3', openRate: 38, clickRate: 9 },
  { name: 'Week 4', openRate: 45, clickRate: 14 }
];

const deviceData = [
  { name: 'Desktop', value: 45, color: '#3B82F6' },
  { name: 'Mobile', value: 40, color: '#10B981' },
  { name: 'Tablet', value: 15, color: '#F59E0B' }
];

const recentCampaigns = [
  {
    id: 1,
    name: 'Weekly Newsletter #24',
    sentDate: '2024-01-20',
    delivered: 1234,
    opened: 567,
    clicked: 89,
    openRate: 45.9,
    clickRate: 7.2
  },
  {
    id: 2,
    name: 'Product Update January',
    sentDate: '2024-01-15',
    delivered: 1156,
    opened: 498,
    clicked: 76,
    openRate: 43.1,
    clickRate: 6.6
  },
  {
    id: 3,
    name: 'Welcome Series #3',
    sentDate: '2024-01-10',
    delivered: 892,
    opened: 401,
    clicked: 67,
    openRate: 45.0,
    clickRate: 7.5
  }
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6months');

  const totalStats = {
    totalSent: 8500,
    totalDelivered: 8245,
    totalOpened: 3298,
    totalClicked: 659,
    deliveryRate: 97.0,
    openRate: 40.0,
    clickRate: 8.0,
    unsubscribeRate: 0.5
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Track your newsletter performance and engagement</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="3months">Last 3 months</option>
              <option value="6months">Last 6 months</option>
              <option value="1year">Last year</option>
            </select>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.deliveryRate}%</p>
                  <p className="text-xs text-green-600 mt-1">↑ 2.1% from last month</p>
                </div>
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.openRate}%</p>
                  <p className="text-xs text-green-600 mt-1">↑ 5.3% from last month</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Click Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.clickRate}%</p>
                  <p className="text-xs text-green-600 mt-1">↑ 1.2% from last month</p>
                </div>
                <MousePointer className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unsubscribe Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.unsubscribeRate}%</p>
                  <p className="text-xs text-red-600 mt-1">↓ 0.2% from last month</p>
                </div>
                <Users className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Delivery Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Delivery Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deliveryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="delivered" fill="#3B82F6" name="Delivered" />
                  <Bar dataKey="opened" fill="#10B981" name="Opened" />
                  <Bar dataKey="clicked" fill="#8B5CF6" name="Clicked" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Engagement Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="openRate" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Open Rate %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="clickRate" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    name="Click Rate %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Device Breakdown and Recent Campaigns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {deviceData.map((device, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: device.color }}
                      />
                      <span className="text-sm text-gray-600">{device.name}</span>
                    </div>
                    <span className="text-sm font-medium">{device.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Campaigns */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium text-gray-600 text-sm">Campaign</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600 text-sm">Sent Date</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600 text-sm">Delivered</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600 text-sm">Open Rate</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600 text-sm">Click Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-3">
                          <div className="font-medium text-gray-900 text-sm">{campaign.name}</div>
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-600">
                          {new Date(campaign.sentDate).toISOString().split('T')[0]}
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-900">
                          {campaign.delivered.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {campaign.openRate}%
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${campaign.openRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {campaign.clickRate}%
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${campaign.clickRate * 5}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}