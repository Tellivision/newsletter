'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Eye, Download, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  subject: string
  content: string
  previewText: string
}

interface TemplatesResponse {
  templates: Template[]
  categories: string[]
}

export default function TemplatesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
      return
    }

    if (user) {
      fetchTemplates()
    }
  }, [user, authLoading, router])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }
      const data: TemplatesResponse = await response.json()
      setTemplates(data.templates)
      setCategories(['all', ...data.categories])
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const selectTemplate = async (template: Template) => {
    try {
      // Store template data in localStorage for the editor
      const templateData = {
        subject: template.subject,
        content: template.content,
        previewText: template.previewText
      };
      
      localStorage.setItem('selectedTemplate', JSON.stringify(templateData));
      
      toast.success(`Template "${template.name}" loaded successfully!`);
      
      // Navigate to editor
      router.push('/editor');
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to load template');
    }
  }

  const previewTemplateContent = (template: Template) => {
    setPreviewTemplate(template)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Template Library</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Choose from our collection of professional newsletter templates to get started quickly.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {template.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Template Preview */}
                <div className="bg-gray-100 rounded-lg p-2 mb-4 min-h-[120px] flex items-center justify-center overflow-hidden">
                  <Image
                    src={template.thumbnail}
                    alt={`${template.name} preview`}
                    width={200}
                    height={100}
                    className="w-full h-auto max-h-[100px] object-contain rounded"
                    onError={(e) => {
                      console.log(`Failed to load image: ${template.thumbnail}`);
                      // Fallback to a simple text placeholder
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {/* Fallback text that shows if image fails to load */}
                  <div className="text-gray-500 text-sm text-center hidden" id={`fallback-${template.id}`}>
                    {template.name}<br/>Preview
                  </div>
                </div>

                {/* Template Info */}
                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subject Line</p>
                    <p className="text-sm text-gray-900 truncate">{template.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Preview Text</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{template.previewText}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => previewTemplateContent(template)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    onClick={() => selectTemplate(template)}
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{previewTemplate.name}</h3>
                  <p className="text-gray-600">{previewTemplate.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => selectTemplate(previewTemplate)}
                    size="sm"
                  >
                    Use Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPreviewTemplate(null)}
                    size="sm"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div 
                  dangerouslySetInnerHTML={{ __html: previewTemplate.content }}
                  className="prose max-w-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}