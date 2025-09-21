import Link from 'next/link'

interface AuthCodeErrorProps {
  searchParams: {
    error?: string
    description?: string
  }
}

export default function AuthCodeError({ searchParams }: AuthCodeErrorProps) {
  const { error, description } = searchParams
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            There was an error during the authentication process.
          </p>
        </div>
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Authentication failed
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error && (
                  <p className="font-medium">
                    Error: {error}
                  </p>
                )}
                {description && (
                  <p className="mt-1">
                    {description}
                  </p>
                )}
                {!error && !description && (
                  <p>
                    Please try signing in again. If the problem persists, contact support.
                  </p>
                )}
                {error === 'server_error' && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800 text-xs">
                      <strong>Troubleshooting:</strong> This error typically occurs when the OAuth configuration 
                      is not properly set up. Please check that:
                    </p>
                    <ul className="mt-2 text-yellow-700 text-xs list-disc list-inside">
                      <li>The redirect URL in Google OAuth matches: http://localhost:3000/auth/callback</li>
                      <li>The Google OAuth credentials in Supabase are correct</li>
                      <li>The OAuth provider is properly configured in Supabase</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div>
          <Link
            href="/auth/signin"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  )
}