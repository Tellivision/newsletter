'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function DebugTemplatesPage() {
  const [templateData, setTemplateData] = useState<{
    subject: string;
    content: string;
    previewText: string;
  } | null>(null)
  const [testContent, setTestContent] = useState('')
  const [editorContent, setEditorContent] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const router = useRouter()

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(message)
  }

  useEffect(() => {
    // Check for template data in localStorage
    const checkLocalStorage = () => {
      try {
        const data = localStorage.getItem('selectedTemplate')
        addLog(`LocalStorage check: ${data ? 'Found data' : 'No data found'}`)
        if (data) {
          const parsed = JSON.parse(data)
          setTemplateData(parsed)
          addLog(`Template data parsed successfully: ${JSON.stringify(parsed, null, 2)}`)
        }
      } catch (error) {
        addLog(`Error reading localStorage: ${error}`)
      }
    }

    checkLocalStorage()
  }, [])

  const testSimpleContent = () => {
    const simple = '<h2>Simple Test</h2><p>This is a basic test with <strong>bold text</strong>.</p>'
    addLog(`Loading simple content: ${simple}`)
    setTestContent(simple)
  }

  const testComplexContent = () => {
    const complex = `<div style="max-width: 600px; font-family: Arial, sans-serif;">
      <h1 style="color: #333;">Welcome Template</h1>
      <p style="font-size: 16px;">This is a complex template with <strong>inline styles</strong>.</p>
      <ul style="padding-left: 20px;">
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
      <div style="background: #f0f0f0; padding: 20px; margin: 20px 0;">
        <p>Styled div with background</p>
      </div>
    </div>`
    addLog(`Loading complex content: ${complex}`)
    setTestContent(complex)
  }

  const loadTemplateContent = () => {
    if (templateData?.content) {
      addLog(`Loading actual template content (${templateData.content.length} chars)`)
      setTestContent(templateData.content)
    } else {
      addLog('No template content available')
    }
  }

  const simulateTemplateSelection = async () => {
    addLog('Simulating template selection...')
    
    // Fetch a template directly from the API
    try {
      const response = await fetch('/api/templates')
      const data = await response.json()
      
      if (data.templates && data.templates.length > 0) {
        const firstTemplate = data.templates[0]
        addLog(`Got template: ${firstTemplate.name}`)
        
        // Store in localStorage like the template page does
        const templateData = {
          subject: firstTemplate.subject,
          content: firstTemplate.content,
          previewText: firstTemplate.previewText
        }
        
        localStorage.setItem('selectedTemplate', JSON.stringify(templateData))
        addLog('Template stored in localStorage')
        setTemplateData(templateData)
        
        // Load it into the test editor
        setTestContent(firstTemplate.content)
        addLog('Template loaded into test editor')
      }
    } catch (error) {
      addLog(`Error fetching templates: ${error}`)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Template Loading Debug</h1>
          <p className="text-gray-600">Debug template loading issues and test the rich text editor</p>
          <Button onClick={() => router.push('/editor')} className="mt-4">
            Go to Editor
          </Button>
        </div>

        <Tabs defaultValue="test" className="space-y-6">
          <TabsList>
            <TabsTrigger value="test">Test Editor</TabsTrigger>
            <TabsTrigger value="localStorage">LocalStorage</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="test">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Controls</CardTitle>
                  <CardDescription>Test different content types in the editor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={testSimpleContent} className="w-full">
                    Load Simple Content
                  </Button>
                  <Button onClick={testComplexContent} className="w-full">
                    Load Complex HTML
                  </Button>
                  <Button onClick={simulateTemplateSelection} className="w-full">
                    Simulate Template Selection
                  </Button>
                  {templateData && (
                    <Button onClick={loadTemplateContent} className="w-full">
                      Load Actual Template
                    </Button>
                  )}
                  <Button 
                    onClick={() => setTestContent('')} 
                    variant="outline" 
                    className="w-full"
                  >
                    Clear Content
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Test Content</CardTitle>
                  <CardDescription>
                    Length: {testContent.length} characters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded text-xs font-mono max-h-40 overflow-y-auto">
                    <pre>{testContent || 'No content loaded'}</pre>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Rich Text Editor Test</CardTitle>
                <CardDescription>
                  Editor content length: {editorContent.length} characters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={testContent}
                  onChange={(content) => {
                    setEditorContent(content)
                    addLog(`Editor content changed: ${content.length} chars`)
                  }}
                  placeholder="Test content will appear here..."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="localStorage">
            <Card>
              <CardHeader>
                <CardTitle>LocalStorage Data</CardTitle>
                <CardDescription>Current template data stored in browser</CardDescription>
              </CardHeader>
              <CardContent>
                {templateData ? (
                  <div className="space-y-4">
                    <div>
                      <strong>Subject:</strong> {templateData.subject}
                    </div>
                    <div>
                      <strong>Preview Text:</strong> {templateData.previewText}
                    </div>
                    <div>
                      <strong>Content Length:</strong> {templateData.content?.length || 0} characters
                    </div>
                    <div>
                      <strong>Content Preview:</strong>
                      <div className="bg-gray-100 p-4 rounded text-xs font-mono max-h-60 overflow-y-auto mt-2">
                        <pre>{templateData.content}</pre>
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        localStorage.removeItem('selectedTemplate')
                        setTemplateData(null)
                        addLog('Cleared localStorage')
                      }}
                      variant="outline"
                    >
                      Clear LocalStorage
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-500">No template data found in localStorage</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Debug Logs</CardTitle>
                <CardDescription>Real-time logging of template operations</CardDescription>
                <Button onClick={clearLogs} variant="outline" size="sm">
                  Clear Logs
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No logs yet...</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}