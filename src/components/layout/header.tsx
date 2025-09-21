'use client'

import { Bell, Search, User, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
  title?: string
  user?: {
    name: string
    email: string
    image?: string
  }
}

export function Header({ title, user }: HeaderProps) {
  const { signOut } = useAuth()
  return (
    <header className="flex h-16 items-center justify-between border-b border-brand-gray-dark bg-white px-6 shadow-sm">
      {/* Title */}
      <div className="flex items-center">
        {title && (
          <h1 className="text-2xl font-semibold text-brand-secondary">{title}</h1>
        )}
      </div>

      {/* Search and Actions */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-primary" />
          <Input
            placeholder="Search..."
            className="w-64 pl-10 border-brand-gray-dark focus:border-brand-primary focus:ring-brand-primary"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="hover:bg-brand-gray text-brand-primary hover:text-brand-primary-dark">
          <Bell className="h-5 w-5" />
        </Button>

        {/* User Menu */}
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <div className="text-right">
                <p className="text-sm font-medium text-brand-secondary">{user.name}</p>
                <p className="text-xs text-brand-primary">{user.email}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-brand-gray text-brand-primary">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="h-8 w-8 rounded-full border-2 border-brand-primary"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="ghost" size="icon" className="hover:bg-brand-gray text-brand-primary">
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}