'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  UserPlus,
  Upload,
  Download,
  Search,
  Mail,
  Calendar,
  MoreHorizontal,
  Trash2,
  Edit
} from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive' | 'bounced';
  subscribedAt: string;
  lastEngagement: string;
  tags: string[];
}

const mockSubscribers: Subscriber[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    status: 'active',
    subscribedAt: '2024-01-15',
    lastEngagement: '2024-01-20',
    tags: ['premium', 'early-adopter']
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    status: 'active',
    subscribedAt: '2024-01-10',
    lastEngagement: '2024-01-18',
    tags: ['newsletter']
  },
  {
    id: '3',
    email: 'bob.wilson@example.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    status: 'inactive',
    subscribedAt: '2023-12-20',
    lastEngagement: '2023-12-25',
    tags: ['trial']
  },
  {
    id: '4',
    email: 'alice.brown@example.com',
    firstName: 'Alice',
    lastName: 'Brown',
    status: 'bounced',
    subscribedAt: '2024-01-05',
    lastEngagement: '2024-01-08',
    tags: ['newsletter', 'premium']
  }
];

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubscriber, setNewSubscriber] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });

  // Load subscribers from database
  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      const response = await fetch('/api/subscribers');
      if (response.ok) {
        const data = await response.json();
        // Transform database format to component format
        const transformedSubscribers = data.map((sub: { id: string; email: string; first_name?: string; last_name?: string; status?: string; created_at?: string; updated_at?: string; tags?: string[] }) => ({
          id: sub.id,
          email: sub.email,
          firstName: sub.first_name || '',
          lastName: sub.last_name || '',
          status: sub.status || 'active',
          subscribedAt: sub.created_at ? new Date(sub.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          lastEngagement: sub.updated_at ? new Date(sub.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          tags: sub.tags || ['newsletter']
        }));
        setSubscribers(transformedSubscribers);
      }
    } catch (error) {
      console.error('Failed to load subscribers:', error);
      // Fallback to mock data if API fails
      setSubscribers(mockSubscribers);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = 
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subscriber.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'bounced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddSubscriber = async () => {
    if (!newSubscriber.email) return;
    
    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: [{
            email: newSubscriber.email,
            first_name: newSubscriber.firstName,
            last_name: newSubscriber.lastName
          }]
        }),
      });

      if (response.ok) {
        // Reload subscribers to show the new addition
        await loadSubscribers();
        setNewSubscriber({ email: '', firstName: '', lastName: '' });
        setShowAddModal(false);
      } else {
        alert('Failed to add subscriber. Please try again.');
      }
    } catch (error) {
      console.error('Failed to add subscriber:', error);
      alert('Failed to add subscriber. Please try again.');
    }
  };

  const handleImportCSV = () => {
    alert('CSV import functionality would be implemented here');
  };

  const handleExport = () => {
    alert('Export functionality would be implemented here');
  };

  const stats = {
    total: subscribers.length,
    active: subscribers.filter(s => s.status === 'active').length,
    inactive: subscribers.filter(s => s.status === 'inactive').length,
    bounced: subscribers.filter(s => s.status === 'bounced').length
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-brand-secondary">Subscribers</h1>
            <p className="text-brand-primary mt-1">Manage your newsletter subscribers</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleImportCSV}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Subscriber
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-brand-primary">Total Subscribers</p>
                  <p className="text-2xl font-bold text-brand-secondary">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-brand-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-brand-primary">Active</p>
                  <p className="text-2xl font-bold text-brand-secondary">{stats.active}</p>
                </div>
                <Mail className="h-8 w-8 text-brand-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.inactive}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bounced</p>
                  <p className="text-2xl font-bold text-red-600">{stats.bounced}</p>
                </div>
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search subscribers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="bounced">Bounced</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscribers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Subscriber List ({filteredSubscribers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Loading subscribers...</div>
              </div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Users className="h-12 w-12 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No subscribers found</h3>
                <p className="text-sm text-center mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Start building your subscriber list by importing emails or adding subscribers manually'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add First Subscriber
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Subscriber</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Subscribed</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Last Engagement</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Tags</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {subscriber.firstName || subscriber.lastName 
                                ? `${subscriber.firstName} ${subscriber.lastName}`.trim()
                                : 'No Name'
                              }
                            </div>
                            <div className="text-sm text-gray-600">{subscriber.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscriber.status)}`}>
                            {subscriber.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {subscriber.subscribedAt}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {subscriber.lastEngagement}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(subscriber.tags) ? subscriber.tags.map((tag, index) => (
                              <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                {tag}
                              </span>
                            )) : (
                              <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                newsletter
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Subscriber Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add New Subscriber</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={newSubscriber.email}
                    onChange={(e) => setNewSubscriber(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="subscriber@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <Input
                    value={newSubscriber.firstName}
                    onChange={(e) => setNewSubscriber(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <Input
                    value={newSubscriber.lastName}
                    onChange={(e) => setNewSubscriber(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSubscriber}
                  disabled={!newSubscriber.email}
                >
                  Add Subscriber
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}