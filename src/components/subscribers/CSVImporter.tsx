'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Users, AlertCircle, CheckCircle, FileText } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CSVImporterProps {
  onImport: (emails: string[]) => void
  title?: string
  description?: string
}

export function CSVImporter({ onImport, title, description }: CSVImporterProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const parseCSV = (csvText: string): string[] => {
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line)
    const emails: string[] = []
    
    for (const line of lines) {
      // Split by comma and clean up
      const fields = line.split(',').map(field => field.trim().replace(/['"]/g, ''))
      
      // Look for email addresses in each field
      for (const field of fields) {
        if (field.includes('@') && field.includes('.')) {
          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (emailRegex.test(field)) {
            emails.push(field.toLowerCase())
          }
        }
      }
    }
    
    // Remove duplicates
    return [...new Set(emails)]
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    setIsImporting(true)
    setError('')
    setSuccess('')

    try {
      const text = await file.text()
      const emails = parseCSV(text)

      if (emails.length === 0) {
        setError('No valid email addresses found in the CSV file')
        return
      }

      onImport(emails)
      setSuccess(`Successfully imported ${emails.length} email addresses`)
    } catch (error) {
      console.error('CSV parsing error:', error)
      setError('Failed to read CSV file. Please make sure it\'s a valid CSV format.')
    } finally {
      setIsImporting(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {title || 'Import Subscribers from CSV'}
        </CardTitle>
        {description && (
          <p className="text-sm text-gray-600">
            {description}
          </p>
        )}
        {!description && (
          <p className="text-sm text-gray-600">
            Upload a CSV file containing email addresses to add subscribers to your newsletter
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>CSV Format:</strong> Your CSV can have email addresses in any column. 
            The importer will automatically detect and extract valid email addresses.
            <br/>
            <strong>Examples:</strong> name,email,status OR just a list of emails
          </AlertDescription>
        </Alert>

        {/* Drag and Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {dragActive ? 'Drop your CSV file here' : 'Upload CSV File'}
          </h3>
          <p className="text-gray-600 mb-4">
            Drag and drop your CSV file here, or click to browse
          </p>
          
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="csv-upload"
            disabled={isImporting}
          />
          
          <Button 
            onClick={() => document.getElementById('csv-upload')?.click()}
            disabled={isImporting}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isImporting ? 'Processing...' : 'Choose CSV File'}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Supported formats:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>CSV files with email addresses in any column</li>
            <li>Files with headers (first row will be processed)</li>
            <li>Mixed format files (emails will be extracted automatically)</li>
            <li>Duplicate emails will be automatically removed</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}