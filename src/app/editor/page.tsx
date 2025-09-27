'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Send, Eye, FileText, Users, Calendar } from 'lucide-react';
import { GoogleDocsImporter } from '@/components/google-docs/GoogleDocsImporter';
import SendNewsletterModal from '@/components/newsletters/SendNewsletterModal';
import { RichTextEditor } from '@/components/editor/RichTextEditor';

interface NewsletterData {
  subject: string;
  content: string;
  previewText: string;
}

export default function NewsletterEditor() {
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

  // Fetch subscribers and load template on component mount
  useEffect(() => {
    fetchSubscribers();
    loadTemplateFromStorage();
  }, []);

  const loadTemplateFromStorage = () => {
    try {
      const templateData = localStorage.getItem('selectedTemplate');
      console.log('Raw template data from localStorage:', templateData);
      
      if (templateData) {
        const template = JSON.parse(templateData);
        console.log('Parsed template:', template);
        console.log('Template content length:', template.content?.length);
        console.log('Template content preview:', template.content?.substring(0, 200) + '...');
        
        setNewsletter(prev => {
          const newState = {
            subject: template.subject || '',
            content: template.content || '',
            previewText: template.previewText || ''
          };
          console.log('Setting newsletter state:', newState);
          return newState;
        });
        
        // Clear the template from storage after loading
        localStorage.removeItem('selectedTemplate');
        console.log('Template loaded successfully into editor');
        
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          console.log('Current newsletter state after delay:', {
            subject: newsletter.subject,
            contentLength: newsletter.content.length,
            previewText: newsletter.previewText
          });
        }, 100);
      } else {
        console.log('No template found in storage');
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  };

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



  const convertToHtml = (content: string) => {
    // If content is already HTML (from rich text editor), convert Tailwind classes to inline styles
    if (content.includes('<p>') || content.includes('<h1>') || content.includes('<strong>')) {
      return content
        // Convert Tailwind list classes to inline styles for email compatibility
        .replace(/class="list-disc list-inside space-y-1"/g, 'style="list-style-type: disc; padding-left: 20px; margin: 10px 0;"')
        .replace(/class="list-decimal list-inside space-y-1"/g, 'style="list-style-type: decimal; padding-left: 20px; margin: 10px 0;"')
        .replace(/class="text-blue-600 underline"/g, 'style="color: #2563eb; text-decoration: underline;"')
        // Add margin to list items for proper spacing
        .replace(/<li>/g, '<li style="margin-bottom: 8px;">');
    }
    
    // Fallback for plain text content
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #2563eb; text-decoration: underline;">$1</a>')
      .replace(/^- (.+)$/gm, '<li style="margin-bottom: 8px;">$1</li>')
      .replace(/((<li.*?<\/li>\s*)+)/g, '<ul style="list-style-type: disc; padding-left: 20px; margin: 10px 0;">$1</ul>')
      .replace(/\n/g, '<br />');
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Newsletter saved successfully!');
  };

  const handleSend = () => {
    if (!newsletter.subject || !newsletter.content) {
      alert('Please fill in subject and content before sending.');
      return;
    }
    setShowSendModal(true);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleGoogleDocsImport = (content: string, title: string) => {
    setNewsletter(prev => ({
      ...prev,
      subject: prev.subject || title,
      content: content
    }));
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-brand-secondary">Newsletter Editor</h1>
            <p className="text-brand-primary mt-1">Create and customize your newsletter content</p>
          </div>
          <div className="flex gap-3">
            {/* Always show debug button */}
            <Button
              variant="outline"
              onClick={() => {
                const testContent = `<h2>Test Template</h2><p>This is a test template to verify the editor is working.</p><ul><li>Item 1</li><li>Item 2</li></ul>`;
                console.log('Loading test template:', testContent);
                setNewsletter(prev => ({ 
                  ...prev, 
                  content: testContent,
                  subject: 'Test Template Subject'
                }));
              }}
              className="flex items-center gap-2"
            >
              🧪 Test Editor
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Fetch and load a real template
                fetch('/api/templates')
                  .then(res => res.json())
                  .then(data => {
                    if (data.templates && data.templates.length > 0) {
                      const template = data.templates[0];
                      console.log('Loading real template:', template.name, template.content.length);
                      setNewsletter(prev => ({
                        ...prev,
                        subject: template.subject,
                        content: template.content,
                        previewText: template.previewText
                      }));
                    }
                  })
                  .catch(err => console.error('Template fetch error:', err));
              }}
              className="flex items-center gap-2"
            >
              📋 Load Template
            </Button>
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
                {/* Google Docs Import */}
                <GoogleDocsImporter onImport={handleGoogleDocsImport} />

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
                    {/* Always show debug info */}
                    <div className="text-xs text-gray-500 mt-2">
                      Content length: {newsletter.content.length} characters
                      {newsletter.content && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-blue-600">📊 Show debug info</summary>
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                            <div><strong>Subject:</strong> {newsletter.subject}</div>
                            <div><strong>Preview:</strong> {newsletter.previewText}</div>
                            <div><strong>Content preview:</strong></div>
                            <pre className="mt-1 p-2 bg-gray-200 rounded text-xs max-h-20 overflow-y-auto">
                              {newsletter.content.substring(0, 300)}...
                            </pre>
                            <button 
                              onClick={() => {
                                console.log('Full newsletter state:', newsletter);
                                console.log('Content:', newsletter.content);
                              }}
                              className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                            >
                              Log to Console
                            </button>
                          </div>
                        </details>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RichTextEditor
                      content={newsletter.content}
                      onChange={(content) => {
                        console.log('RichTextEditor onChange called with:', { 
                          contentLength: content.length,
                          contentPreview: content.substring(0, 100) + '...'
                        });
                        setNewsletter(prev => ({ ...prev, content }));
                      }}
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
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Audience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-brand-primary">Total Subscribers</span>
                    <span className="font-semibold text-brand-secondary">{subscriberStats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-brand-primary">Active Subscribers</span>
                    <span className="font-semibold text-brand-secondary">{subscriberStats.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-brand-primary">Expected Reach</span>
                    <span className="font-semibold text-brand-primary">~{Math.floor(subscriberStats.active * 0.95)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowSendModal(true)}
                    disabled={!newsletter.subject || !newsletter.content}
                  >
                    Send Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowSendModal(true)}
                    disabled={!newsletter.subject || !newsletter.content}
                  >
                    Schedule for Later
                  </Button>
                  <div className="text-xs text-gray-500 mt-2">
                    Best time to send: Tuesday 10:00 AM
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                    onClick={() => setNewsletter(prev => ({
                      ...prev,
                      content: '<h2>Welcome to our Newsletter!</h2><p>Thank you for subscribing. Here\'s what\'s new...</p>'
                    }))}
                  >
                    Welcome Template
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                    onClick={() => setNewsletter(prev => ({
                      ...prev,
                      content: '<h2>Weekly Update</h2><p>Here are the highlights from this week...</p>'
                    }))}
                  >
                    Weekly Update
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-xs"
                    onClick={() => setNewsletter(prev => ({
                      ...prev,
                      content: '<h2>Product Announcement</h2><p>We\'re excited to announce...</p>'
                    }))}
                  >
                    Product News
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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
    </MainLayout>
  );
}