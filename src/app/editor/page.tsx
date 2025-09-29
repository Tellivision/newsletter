'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Send, Eye, FileText, Users, Calendar } from 'lucide-react';
import { GoogleDocsImporter } from '@/components/google-docs/GoogleDocsImporter';
import { SubscriberListManager } from '@/components/subscribers/SubscriberListManager';
import SendNewsletterModal from '@/components/newsletters/SendNewsletterModal';
import { RichTextEditor } from '@/components/editor/RichTextEditor';

interface NewsletterData {
  subject: string;
  content: string;
  previewText: string;
}

export default function NewsletterEditor() {
  const { user, loading } = useAuth();
  const [newsletter, setNewsletter] = useState<NewsletterData>({
    subject: '',
    content: '',
    previewText: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [subscriberStats, setSubscriberStats] = useState({ total: 0, active: 0 });
  const [templateLoaded, setTemplateLoaded] = useState(false);

  const loadTemplateFromStorage = useCallback(() => {
    try {
      const templateData = localStorage.getItem('selectedTemplate');
      
      if (templateData) {
        const template = JSON.parse(templateData);
        console.log('Loading template data:', template);
        
        setNewsletter({
          subject: template.subject || '',
          content: template.content || '',
          previewText: template.previewText || ''
        });
        
        // Clear the template from storage after loading
        localStorage.removeItem('selectedTemplate');
        setTemplateLoaded(true);
        
        // Show success message
        console.log('Template loaded successfully');
        
        // Auto-hide the notification after 3 seconds
        setTimeout(() => setTemplateLoaded(false), 3000);
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  }, []);

  // Fetch subscribers and load template on component mount
  useEffect(() => {
    fetchSubscribers();
    loadTemplateFromStorage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/subscribers?status=active');
      if (response.ok) {
        const data = await response.json();
        const activeEmails = data.subscribers.map((sub: { email: string }) => sub.email);
        setSubscribers(activeEmails);
        setSubscriberStats({
          total: data.stats.total,
          active: data.stats.active
        });
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
      // Fallback to mock data if API fails
      setSubscribers([
        'user1@example.com',
        'user2@example.com',
        'user3@example.com'
      ]);
      setSubscriberStats({ total: 3, active: 3 });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleSend = () => {
    setShowSendModal(true);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const convertToHtml = (content: string) => {
    // Simple conversion - in production, use a proper markdown/rich text converter
    return content.replace(/\n/g, '<br>');
  };

  const handleGoogleDocsImport = (content: string) => {
    setNewsletter(prev => ({
      ...prev,
      content: content
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please sign in to access the newsletter editor.</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Newsletter</TabsTrigger>
            <TabsTrigger value="subscribers">Manage Subscribers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-6">
            {templateLoaded && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-green-800 font-medium">Template loaded successfully!</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-brand-secondary">Newsletter Editor</h1>
                <p className="text-brand-primary mt-1">Create and customize your newsletter content</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={togglePreview}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {showPreview ? 'Edit' : 'Preview'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button
                  onClick={handleSend}
                  className="flex items-center gap-2"
                  disabled={!newsletter.subject || !newsletter.content}
                >
                  <Send className="h-4 w-4" />
                  Send Newsletter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Editor */}
              <div className="lg:col-span-3">
                {!showPreview ? (
                  <div className="space-y-6">
                    {/* Newsletter Content Import */}
                    <div>
                      <GoogleDocsImporter onImport={handleGoogleDocsImport} />
                    </div>
                    
                    {/* Newsletter Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Newsletter Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-brand-secondary mb-2">
                            Subject Line
                          </label>
                          <Input
                            value={newsletter.subject}
                            onChange={(e) => setNewsletter(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="Enter your newsletter subject..."
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-brand-secondary mb-2">
                            Preview Text
                          </label>
                          <Input
                            value={newsletter.previewText}
                            onChange={(e) => setNewsletter(prev => ({ ...prev, previewText: e.target.value }))}
                            placeholder="Brief preview text that appears in email clients..."
                            className="w-full"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Content Editor */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Newsletter Content</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <RichTextEditor
                          content={newsletter.content}
                          onChange={(content) => setNewsletter(prev => ({ ...prev, content }))}
                          placeholder="Start writing your newsletter content..."
                        />
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  /* Preview Mode */
                  <Card>
                    <CardHeader>
                      <CardTitle>Newsletter Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white border rounded-lg p-6 max-w-2xl mx-auto">
                        <div className="border-b pb-4 mb-4">
                          <h2 className="text-2xl font-bold text-brand-secondary">{newsletter.subject || 'Newsletter Subject'}</h2>
                          {newsletter.previewText && (
                            <p className="text-brand-primary mt-2">{newsletter.previewText}</p>
                          )}
                        </div>
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: convertToHtml(newsletter.content) || '<p>Newsletter content will appear here...</p>' }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  {/* Templates Link */}
                  <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="mb-3">
                          <FileText className="h-8 w-8 text-purple-600 mx-auto" />
                        </div>
                        <h3 className="font-semibold text-purple-900 mb-2">Use a Template</h3>
                        <p className="text-purple-700 text-sm mb-3">Start with a professional template</p>
                        <Button
                          asChild
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <a href="/templates">
                            Browse Templates
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Subscriber Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Subscriber Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total:</span>
                          <span className="font-semibold">{subscriberStats.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Active:</span>
                          <span className="font-semibold text-green-600">{subscriberStats.active}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start" 
                        asChild
                      >
                        <a href="/newsletters/scheduled">
                          <Calendar className="h-4 w-4 mr-2" />
                          Scheduled Newsletters
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="subscribers" className="space-y-6">
            <SubscriberListManager onSubscriberUpdate={fetchSubscribers} />
          </TabsContent>
        </Tabs>

        {/* Send Newsletter Modal */}
        <SendNewsletterModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          newsletter={{
            subject: newsletter.subject,
            content: convertToHtml(newsletter.content),
            previewText: newsletter.previewText
          }}
          subscribers={subscribers}
        />
      </div>
    </MainLayout>
  );
}