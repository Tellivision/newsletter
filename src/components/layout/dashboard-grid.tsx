import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DashboardGridProps {
  children: ReactNode
  className?: string
}

export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      className
    )}>
      {children}
    </div>
  )
}

interface DashboardCardProps {
  children: ReactNode
  className?: string
  colSpan?: 1 | 2 | 3 | 4
}

export function DashboardCard({ children, className, colSpan = 1 }: DashboardCardProps) {
  const colSpanClasses = {
    1: 'col-span-1',
    2: 'col-span-1 sm:col-span-2',
    3: 'col-span-1 sm:col-span-2 lg:col-span-3',
    4: 'col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4'
  }

  return (
    <div className={cn(colSpanClasses[colSpan], className)}>
      {children}
    </div>
  )
}