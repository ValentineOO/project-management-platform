'use client'

import { useEffect, useState } from 'react'
import { LogOut, Search, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SearchPalette } from '@/components/search/SearchPalette'
import { useAuth } from '@/hooks/useAuth'

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

export function Header() {
  const { user, logout } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-5">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSearchOpen(true)}
        className="gap-2 text-muted-foreground w-52 justify-start font-normal"
        aria-label="Open search"
        aria-keyshortcuts="Meta+K"
      >
        <Search size={14} aria-hidden="true" />
        <span className="flex-1">Search…</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] opacity-70">
          <span>⌘</span>K
        </kbd>
      </Button>

      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`User menu for ${user.name}`}
            className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold select-none" aria-hidden="true">
              {getInitials(user.name)}
            </span>
            <span className="hidden sm:block">{user.name}</span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <UserIcon size={14} aria-hidden="true" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="gap-2"
              onClick={logout}
            >
              <LogOut size={14} aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
