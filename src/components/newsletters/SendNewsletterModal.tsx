'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { X, Send, Clock, Users, AlertCircle, CheckCircle } from 'lucide-react'

interface SendNewsletterModalProps {
  isOpen: boolean
  onClose: () => void
  newsletter: {
    subject: string
    content: string
    previewText?: string
  }
  subscribers: string[]
}

interface SendResult {
  success: boolean
  message: string
  stats?: {
    total: number
    sent: number
    failed: number
  }
  errors?: Array<{
    recipient: string
    error: string
  }>
}

export default function SendNewsletterModal({ 
  isOpen, 
  onClose, 
  newsletter, 
  subscribers 
}: SendNewsletterModalProps) {
  const { user } = useAuth()
  const [isSending, setIsSending] = useState(false)
  const [sendType, setSendType] = useState<'now' | 'scheduled' | 'test'>('now')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [testEmail, setTestEmail] = useState(user?.email || '')
  const [sendResult, setSendResult] = useState<SendResult | null>(null)

  if (!isOpen) return null

  const handleSend = async () => {
    if (!user) {
      alert('Please sign in with Google to send newsletters')
      return
    }

    setIsSending(true)
    setSendResult(null)

    try {
      let recipients: string[]
      let scheduledAt: string | undefined

      if (sendType === 'test') {
        recipients = [testEmail]
      } else {
        recipients = subscribers
      }

      if (sendType === 'scheduled') {
        scheduledAt = `${scheduledDate}T${scheduledTime}:00.000Z`
        
        // Use scheduling API for scheduled newsletters
        const response = await fetch('/api/newsletters/schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subject: newsletter.subject,
            content: newsletter.content,
            recipients,
            scheduledAt
          })
        })
        
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to schedule newsletter')
        }

        setSendResult({
          success: true,
          message: data.message
        })
        
        return
      }

      // For immediate sending and test emails
      const response = await fetch('/api/newsletters/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: newsletter.subject,
          content: newsletter.content,
          recipients,
          isTest: sendType === 'test'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send newsletter')
      }

      setSendResult({
        success: true,
        message: data.message,
        stats: data.stats,
        errors: data.errors
      })

    } catch (error) {
      setSendResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send newsletter'
      })
    } finally {
      setIsSending(false)
    }
  }

  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 5) // Minimum 5 minutes from now
    return now.toISOString().slice(0, 16)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Send Newsletter</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Newsletter Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Newsletter Preview</h3>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Subject:</strong> {newsletter.subject}
            </p>
            {newsletter.previewText && (
              <p className="text-sm text-gray-600">
                <strong>Preview:</strong> {newsletter.previewText}
              </p>
            )}
          </div>

          {/* Send Options */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Send Options</h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="sendType"
                  value="now"
                  checked={sendType === 'now'}
                  onChange={(e) => setSendType(e.target.value as any)}
                  className="text-blue-600"
                />
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  <span>Send Now</span>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="sendType"
                  value="scheduled"
                  checked={sendType === 'scheduled'}
                  onChange={(e) => setSendType(e.target.value as any)}
                  className="text-blue-600"
                />
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Schedule for Later</span>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="sendType"
                  value="test"
                  checked={sendType === 'test'}
                  onChange={(e) => setSendType(e.target.value as any)}
                  className="text-blue-600"
                />
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Send Test Email</span>
                </div>
              </label>
            </div>

            {/* Scheduled Date/Time */}
            {sendType === 'scheduled' && (
              <div className="ml-7 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={`${scheduledDate}T${scheduledTime}`}
                    onChange={(e) => {
                      const [date, time] = e.target.value.split('T')
                      setScheduledDate(date)
                      setScheduledTime(time)
                    }}
                    min={getMinDateTime()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Test Email */}
            {sendType === 'test' && (
              <div className="ml-7">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Email Address
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
            )}
          </div>

          {/* Recipients Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-blue-800">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">
                {sendType === 'test' ? '1 test recipient' : `${subscribers.length} subscribers`}
              </span>
            </div>
          </div>

          {/* Send Result */}
          {sendResult && (
            <div className={`rounded-lg p-4 ${
              sendResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {sendResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <p className={`text-sm font-medium ${
                  sendResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {sendResult.message}
                </p>
              </div>
              
              {sendResult.stats && (
                <div className="mt-2 text-sm text-green-700">
                  <p>Sent: {sendResult.stats.sent}/{sendResult.stats.total}</p>
                  {sendResult.stats.failed > 0 && (
                    <p>Failed: {sendResult.stats.failed}</p>
                  )}
                </div>
              )}
              
              {sendResult.errors && sendResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-800">Errors:</p>
                  <ul className="text-sm text-red-700 mt-1 space-y-1">
                    {sendResult.errors.slice(0, 3).map((error, index) => (
                      <li key={index}>
                        {error.recipient}: {error.error}
                      </li>
                    ))}
                    {sendResult.errors.length > 3 && (
                      <li>... and {sendResult.errors.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || (sendType === 'scheduled' && (!scheduledDate || !scheduledTime)) || (sendType === 'test' && !testEmail)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>
                  {sendType === 'scheduled' ? 'Schedule' : sendType === 'test' ? 'Send Test' : 'Send Now'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}