'use client'

import { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, isValid, parse } from 'date-fns'
import { CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from 'cn'

interface DatePickerProps {
  value?: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled = false,
  id,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = value
    ? parse(value.slice(0, 10), 'yyyy-MM-dd', new Date())
    : undefined
  const validSelected = selected && isValid(selected) ? selected : undefined

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function handleSelect(date: Date | undefined) {
    onChange(date ? format(date, 'yyyy-MM-dd') : null)
    setOpen(false)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          'flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors',
          'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          !validSelected && 'text-muted-foreground',
        )}
      >
        <span className="flex items-center gap-2 flex-1 min-w-0">
          <CalendarIcon size={14} aria-hidden="true" className="shrink-0" />
          <span className="truncate">
            {validSelected ? format(validSelected, 'MMM d, yyyy') : placeholder}
          </span>
        </span>
        {validSelected && !disabled && (
          <button
            type="button"
            aria-label="Clear date"
            onClick={handleClear}
            className="rounded p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <X size={12} />
          </button>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Date picker"
          className={cn(
            'absolute z-50 mt-1 rounded-lg border bg-popover p-3 shadow-md',
            'animate-in fade-in-0 zoom-in-95',
          )}
        >
          <DayPicker
            mode="single"
            selected={validSelected}
            onSelect={handleSelect}
            defaultMonth={validSelected ?? new Date()}
            autoFocus
            classNames={{
              root: 'w-fit',
              months: 'flex gap-4',
              month_caption: 'flex items-center justify-between mb-2 px-1',
              caption_label: 'text-sm font-medium',
              nav: 'flex items-center gap-1',
              button_previous: cn(
                'inline-flex h-6 w-6 items-center justify-center rounded-md border border-input',
                'text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
                'disabled:pointer-events-none disabled:opacity-40',
              ),
              button_next: cn(
                'inline-flex h-6 w-6 items-center justify-center rounded-md border border-input',
                'text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
                'disabled:pointer-events-none disabled:opacity-40',
              ),
              month_grid: 'w-full border-collapse',
              weekdays: '',
              weekday: 'w-8 h-7 text-center text-xs text-muted-foreground font-normal pb-1',
              week: '',
              day: 'p-0',
              day_button: cn(
                'h-8 w-8 rounded-md text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:hover:bg-primary/90',
                'disabled:pointer-events-none disabled:opacity-40',
              ),
              today: 'font-semibold text-primary',
              outside: 'opacity-40 aria-selected:opacity-100',
              selected: '',
              hidden: 'invisible',
            }}
            components={{
              Chevron: ({ orientation }) =>
                orientation === 'left' ? (
                  <ChevronLeft size={12} />
                ) : (
                  <ChevronRight size={12} />
                ),
            }}
          />
        </div>
      )}
    </div>
  )
}
