'use client'

import React from 'react'

export default function AuthLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading GoogLetter</h2>
        <p className="text-gray-600">Please wait while we set up your session...</p>
      </div>
    </div>
  )
}