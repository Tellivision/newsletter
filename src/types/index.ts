export interface User {
  id: string
  email: string
  name: string
  image?: string
  createdAt: Date
  updatedAt: Date
}

export interface Subscriber {
  id: string
  email: string
  name: string
  tags: string[]
  subscribed: boolean
  subscribedAt: Date
  unsubscribedAt?: Date
}

export interface Newsletter {
  id: string
  title: string
  content: string
  htmlContent: string
  status: 'draft' | 'scheduled' | 'sent'
  scheduledAt?: Date
  sentAt?: Date
  createdAt: Date
  updatedAt: Date
  authorId: string
  templateId?: string
  recipients: string[] // subscriber IDs
}

export interface Template {
  id: string
  name: string
  description: string
  htmlContent: string
  thumbnail?: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Campaign {
  id: string
  newsletterId: string
  sentCount: number
  deliveredCount: number
  openedCount: number
  clickedCount: number
  bouncedCount: number
  unsubscribedCount: number
  createdAt: Date
}

export interface Analytics {
  totalSubscribers: number
  activeSubscribers: number
  totalNewsletters: number
  sentThisMonth: number
  averageOpenRate: number
  averageClickRate: number
  subscriberGrowth: {
    date: string
    count: number
  }[]
}

export interface GoogleDocsImport {
  documentId: string
  title: string
  content: string
  lastModified: Date
}

export type PersonalizationToken = '{{name}}' | '{{email}}' | '{{unsubscribe_link}}'

export interface EmailSettings {
  fromName: string
  fromEmail: string
  replyTo: string
  trackOpens: boolean
  trackClicks: boolean
}