'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, Users, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/teams', label: 'Teams', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden w-60 flex-col border-r bg-sidebar text-sidebar-foreground md:flex"
      aria-label="Main navigation"
    >
      <div className="flex h-14 items-center border-b px-5">
        <span className="text-sm font-semibold tracking-tight">PMP</span>
      </div>

      <nav className="flex-1 space-y-0.5 p-3" aria-label="Sidebar">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
              {active && <ChevronRight size={14} className="ml-auto" aria-hidden="true" />}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
