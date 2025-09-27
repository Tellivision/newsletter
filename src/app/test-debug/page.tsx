'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from '@/components/editor/RichTextEditor'

export default function TestDebugPage() {
  const [content, setContent] = useState('')

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Template Test</h1>
      
      <div className="space-y-4 mb-8">
        <Button 
          onClick={() => {
            const simple = '<h2>Simple Test</h2><p>This is a <strong>bold</strong> test.</p>'
            console.log('Loading simple content')
            setContent(simple)
          }}
        >
          Load Simple HTML
        </Button>
        
        <Button 
          onClick={() => {
            const template = `<div style="font-family: Arial, sans-serif;">
              <h1 style="color: #333;">Welcome!</h1>
              <p style="font-size: 16px;">This is a template with styles.</p>
            </div>`
            console.log('Loading template content')
            setContent(template)
          }}
        >
          Load Template HTML
        </Button>
        
        <Button 
          onClick={() => {
            fetch('/api/templates')
              .then(res => res.json())
              .then(data => {
                if (data.templates?.[0]?.content) {
                  console.log('Loading real template:', data.templates[0].name)
                  setContent(data.templates[0].content)
                }
              })
          }}
        >
          Load Real Template
        </Button>
      </div>

      <div className="mb-4">
        <strong>Current content length:</strong> {content.length}
      </div>

      <div className="border rounded p-4">
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Content will appear here..."
        />
      </div>
      
      <div className="mt-4">
        <details>
          <summary>Show raw content</summary>
          <pre className="bg-gray-100 p-4 rounded text-xs mt-2 max-h-40 overflow-y-auto">
            {content}
          </pre>
        </details>
      </div>
    </div>
  )
}