'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Home,
  FileText,
  Users,
  BarChart3,
  Settings,
  Clock,
  Sparkles
} from 'lucide-react'



export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-brand-gray-dark relative shadow-sm">
      {/* Logo */}
      <div className="absolute inset-x-0 top-0 flex justify-center z-50 p-2 bg-white">
        <Image 
          src="/logo.png" 
          alt="GoogLetter Logo" 
          width={128} 
          height={128} 
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 mt-36">
        <ul className="space-y-2">
          <li>
            <Link href="/" className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-brand-primary hover:text-white transition-colors duration-200">
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
          </li>
          <li>
            <a href="/editor" className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-brand-primary hover:text-white transition-colors duration-200">
              <FileText className="mr-3 h-5 w-5" />
              Newsletter Editor
            </a>
          </li>
          <li>
            <a href="/newsletters/scheduled" className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-brand-primary hover:text-white transition-colors duration-200">
              <Clock className="mr-3 h-5 w-5" />
              Scheduled
            </a>
          </li>
          <li>
            <a href="/templates" className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-brand-primary hover:text-white transition-colors duration-200">
              <Sparkles className="mr-3 h-5 w-5" />
              Templates
            </a>
          </li>
          <li>
            <a href="/subscribers" className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-brand-primary hover:text-white transition-colors duration-200">
              <Users className="mr-3 h-5 w-5" />
              Subscribers
            </a>
          </li>
          <li>
            <a href="/analytics" className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-brand-primary hover:text-white transition-colors duration-200">
              <BarChart3 className="mr-3 h-5 w-5" />
              Analytics
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-brand-primary hover:text-white transition-colors duration-200">
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}