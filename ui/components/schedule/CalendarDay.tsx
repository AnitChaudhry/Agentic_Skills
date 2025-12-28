'use client'

import React, { useMemo } from 'react'
import { CalendarEvent } from './CalendarEvent'

interface Event {
  id: string
  title: string
  time?: string
  duration?: number // Duration in minutes
  date: string
  status: 'completed' | 'pending' | 'cancelled' | 'missed'
  challengeName?: string
  type: 'todo' | 'session' | 'task'
}

interface CalendarDayProps {
  date: Date
  events: Event[]
  onEventStatusChange?: (id: string, status: 'completed' | 'cancelled') => void
  onEventReschedule?: (id: string) => void
}

// Constants for time slot calculations
const HOUR_HEIGHT = 80 // pixels per hour
const MIN_EVENT_HEIGHT = 32 // minimum height for short events

// Parse time string "HH:MM" to minutes from midnight
const parseTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Calculate event position and height
const getEventStyle = (event: Event): { top: number; height: number; minuteOffset: number } => {
  if (!event.time) {
    return { top: 0, height: MIN_EVENT_HEIGHT, minuteOffset: 0 }
  }

  const minutes = parseTimeToMinutes(event.time)
  const minuteOffset = minutes % 60 // Minutes within the hour
  const duration = event.duration || 30 // Default 30 minutes if not specified

  // Calculate top offset within hour slot (as pixels)
  const top = (minuteOffset / 60) * HOUR_HEIGHT

  // Calculate height based on duration
  const height = Math.max((duration / 60) * HOUR_HEIGHT, MIN_EVENT_HEIGHT)

  return { top, height, minuteOffset }
}

export function CalendarDay({
  date,
  events,
  onEventStatusChange,
  onEventReschedule,
}: CalendarDayProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const dateStr = date.toISOString().split('T')[0]

  // Get events that start within a specific hour
  const getEventsForHour = (hour: number) => {
    return events.filter((event) => {
      if (event.date !== dateStr) return false
      if (!event.time) return hour === 0 // All-day events show at midnight
      const eventHour = parseInt(event.time.split(':')[0])
      return eventHour === hour
    })
  }

  // Check for conflicts (overlapping events)
  const eventsWithConflicts = useMemo(() => {
    const dayEvents = events.filter((e) => e.date === dateStr && e.time)
    const conflicts = new Set<string>()

    for (let i = 0; i < dayEvents.length; i++) {
      for (let j = i + 1; j < dayEvents.length; j++) {
        const e1 = dayEvents[i]
        const e2 = dayEvents[j]

        if (!e1.time || !e2.time) continue

        const start1 = parseTimeToMinutes(e1.time)
        const end1 = start1 + (e1.duration || 30)
        const start2 = parseTimeToMinutes(e2.time)
        const end2 = start2 + (e2.duration || 30)

        // Check if events overlap
        if (start1 < end2 && end1 > start2) {
          conflicts.add(e1.id)
          conflicts.add(e2.id)
        }
      }
    }

    return conflicts
  }, [events, dateStr])

  const isToday = date.toDateString() === new Date().toDateString()
  const currentHour = new Date().getHours()
  const currentMinute = new Date().getMinutes()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Day header */}
      <div className={`p-6 border-b border-oa-border ${isToday ? 'bg-oa-accent/10' : ''}`}>
        <div className="text-sm font-medium text-oa-text-secondary mb-1">
          {date.toLocaleDateString('en-US', { weekday: 'long' })}
        </div>
        <div className={`text-3xl font-bold ${isToday ? 'text-oa-accent' : 'text-oa-text-primary'}`}>
          {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>

        {/* Summary */}
        <div className="flex items-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-oa-text-secondary">
              {events.filter((e) => e.status === 'completed' && e.date === dateStr).length} Completed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-oa-text-secondary">
              {events.filter((e) => e.status === 'pending' && e.date === dateStr).length} Pending
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-oa-text-secondary">
              {events.filter((e) => (e.status === 'cancelled' || e.status === 'missed') && e.date === dateStr).length} Missed/Cancelled
            </span>
          </div>
          {eventsWithConflicts.size > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-orange-500 font-medium">
                {eventsWithConflicts.size} Conflicts
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Time slots */}
      <div className="flex-1 overflow-y-auto">
        {hours.map((hour) => {
          const hourEvents = getEventsForHour(hour)
          const isCurrentHour = isToday && hour === currentHour

          return (
            <div
              key={hour}
              className={`border-b border-oa-border flex relative`}
              style={{ height: `${HOUR_HEIGHT}px` }}
            >
              {/* Time label */}
              <div className="w-20 p-3 text-right border-r border-oa-border flex-shrink-0">
                <div className={`text-sm font-medium ${isCurrentHour ? 'text-oa-accent' : 'text-oa-text-primary'}`}>
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="text-xs text-oa-text-secondary">
                  {hour < 12 ? 'AM' : 'PM'}
                </div>
              </div>

              {/* Events container with relative positioning */}
              <div className="flex-1 relative">
                {/* Current time indicator */}
                {isCurrentHour && (
                  <div
                    className="absolute left-0 right-0 z-10 pointer-events-none"
                    style={{ top: `${(currentMinute / 60) * HOUR_HEIGHT}px` }}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-oa-accent" />
                      <div className="flex-1 h-0.5 bg-oa-accent" />
                    </div>
                  </div>
                )}

                {/* Events positioned based on time */}
                {hourEvents.map((event, index) => {
                  const { top, height } = getEventStyle(event)
                  const hasConflict = eventsWithConflicts.has(event.id)

                  // Handle multiple events at similar times by offsetting horizontally
                  const sameTimeEvents = hourEvents.filter((e) => {
                    if (!e.time || !event.time) return false
                    const diff = Math.abs(parseTimeToMinutes(e.time) - parseTimeToMinutes(event.time))
                    return diff < 15 // Within 15 minutes of each other
                  })
                  const offset = sameTimeEvents.indexOf(event)
                  const totalOverlap = sameTimeEvents.length

                  return (
                    <div
                      key={event.id}
                      className="absolute px-1"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        left: totalOverlap > 1 ? `${(offset / totalOverlap) * 100}%` : '4px',
                        right: totalOverlap > 1 ? `${((totalOverlap - offset - 1) / totalOverlap) * 100}%` : '4px',
                        zIndex: 10 + index,
                      }}
                    >
                      <CalendarEvent
                        event={{
                          ...event,
                          duration: event.duration,
                        }}
                        onStatusChange={onEventStatusChange}
                        onReschedule={onEventReschedule}
                        hasConflict={hasConflict}
                        isCompact={height < 50}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
