'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import { FontFamily } from '@tiptap/extension-font-family'
import { TextStyle } from '@tiptap/extension-text-style'
import { Bold, Italic, List, Link2, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCallback, useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  // Email-safe fonts that work across all email clients
  const emailSafeFonts = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { name: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
    { name: 'Courier New', value: '"Courier New", Courier, monospace' },
    { name: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
  ]

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-inside space-y-1',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-inside space-y-1',
          },
        },
        listItem: {
          HTMLAttributes: {
            style: 'margin-bottom: 8px;',
          },
        },
        link: false, // Disable the default link extension
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
    ],
    content: content || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
    // Allow all HTML attributes to preserve template styling
    parseOptions: {
      preserveWhitespace: 'full',
    },
  })

  // Update editor content when the content prop changes
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getHTML()
      console.log('RichTextEditor: Content comparison', { 
        newContentLength: content.length,
        currentContentLength: currentContent.length,
        newContentPreview: content.substring(0, 100) + '...',
        currentContentPreview: currentContent.substring(0, 100) + '...',
        areEqual: content === currentContent
      });
      
      if (content !== currentContent) {
        console.log('RichTextEditor: Updating editor content...');
        
        try {
          // Try setting content directly first
          editor.commands.setContent(content, false);
          console.log('RichTextEditor: Content set successfully using setContent');
        } catch (error) {
          console.error('RichTextEditor: Error with setContent, trying alternative', error);
          
          try {
            // Alternative: Clear and insert
            editor.commands.clearContent();
            editor.commands.insertContent(content);
            console.log('RichTextEditor: Content inserted successfully using insertContent');
          } catch (fallbackError) {
            console.error('RichTextEditor: All methods failed', fallbackError);
            
            // Last resort: Try to convert complex HTML to simpler format
            try {
              const simplifiedContent = content
                .replace(/<div[^>]*>/g, '<p>')
                .replace(/<\/div>/g, '</p>')
                .replace(/style="[^"]*"/g, '');
              
              editor.commands.setContent(simplifiedContent);
              console.log('RichTextEditor: Simplified content loaded');
            } catch (lastError) {
              console.error('RichTextEditor: Even simplified content failed', lastError);
            }
          }
        }
      }
    }
  }, [content, editor])

  const addLink = useCallback(() => {
    if (!editor) return

    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, '')
    
    // If text is selected, just ask for URL
    if (selectedText.trim() !== '') {
      const previousUrl = editor.getAttributes('link').href
      const url = window.prompt('Enter URL:', previousUrl || '')
      
      // cancelled
      if (url === null) {
        return
      }

      // empty - remove link
      if (url === '') {
        editor.chain().focus().unsetLink().run()
        return
      }

      // add/update link
      editor.chain().focus().setLink({ href: url }).run()
      return
    }
    
    // If no text is selected, prompt for both text and URL
    const linkText = window.prompt('Enter link text:')
    if (!linkText) return
    
    const url = window.prompt('Enter URL:')
    if (!url) return
    
    editor.chain().focus().insertContent(`<a href="${url}">${linkText}</a>`).run()
  }, [editor])

  if (!editor) {
    return (
      <div className="border rounded-lg min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border-b">
        {/* Font Family Selector */}
        <Select
          value={editor.getAttributes('textStyle').fontFamily || 'Arial, sans-serif'}
          onValueChange={(value) => {
            if (value === 'default') {
              editor.chain().focus().unsetFontFamily().run()
            } else {
              editor.chain().focus().setFontFamily(value).run()
            }
          }}
        >
          <SelectTrigger className="w-40">
            <Type className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            {emailSafeFonts.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant={editor.isActive('bold') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="flex items-center gap-1"
        >
          <Bold className="h-4 w-4" />
          Bold
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="flex items-center gap-1"
        >
          <Italic className="h-4 w-4" />
          Italic
        </Button>

        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="flex items-center gap-1"
        >
          <List className="h-4 w-4" />
          List
        </Button>

        <Button
          type="button"
          variant={editor.isActive('link') ? 'default' : 'outline'}
          size="sm"
          onClick={addLink}
          className="flex items-center gap-1"
        >
          <Link2 className="h-4 w-4" />
          Link
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          Divider
        </Button>
      </div>

      {/* Editor */}
      <div className="min-h-[300px]">
        <EditorContent 
          editor={editor} 
          className="prose max-w-none p-4 focus-within:outline-none"
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}