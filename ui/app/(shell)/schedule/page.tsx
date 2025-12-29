'use client'

import React, { useState, useEffect } from 'react'
import { CalendarEnhanced } from '@/components/schedule/CalendarEnhanced'
import { addProfileId, useProfileId } from '@/lib/useProfileId'

export default function SchedulePage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const profileId = useProfileId()

  useEffect(() => {
    loadEvents()
  }, [profileId])

  const loadEvents = async () => {
    try {
      setLoading(true)
      // Load todos and challenges to populate calendar
      const todosUrl = addProfileId('/api/todos', profileId)
      const challengesUrl = addProfileId('/api/challenges', profileId)
      const [todosRes, challengesRes] = await Promise.all([
        fetch(todosUrl),
        fetch(challengesUrl),
      ])

      const todosData = await todosRes.json()
      const challengesData = await challengesRes.json()

      // Handle both array and object responses
      const todos = Array.isArray(todosData) ? todosData : []
      const challenges = Array.isArray(challengesData) ? challengesData : (challengesData.challenges || [])

      // Convert todos to calendar events
      const todoEvents = todos.map((todo: any) => ({
        id: todo.id,
        title: todo.text || todo.title,
        date: todo.dueDate || new Date().toISOString().split('T')[0],
        time: todo.time,
        duration: todo.duration,
        // Handle both boolean completed and string status
        status: todo.status || (todo.completed === true ? 'completed' : 'pending'),
        type: 'todo' as const,
        challengeName: todo.challengeId,
        priority: todo.priority,
      }))

      // Convert challenge sessions to events
      const challengeEvents = challenges.flatMap((challenge: any) =>
        (challenge.sessions || []).map((session: any) => ({
          id: session.id,
          title: `${challenge.name} Session`,
          date: session.date,
          time: session.time,
          status: session.status || 'pending',
          type: 'session',
          challengeName: challenge.name,
        }))
      )

      setEvents([...todoEvents, ...challengeEvents])
    } catch (error) {
      console.error('Failed to load events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleEventStatusChange = async (id: string, status: 'completed' | 'cancelled') => {
    try {
      // Update event status in backend - use completed boolean for todos
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: status === 'completed' }),
      })

      // Update local state
      setEvents((prev) =>
        prev.map((event) => (event.id === id ? { ...event, status } : event))
      )
    } catch (error) {
      console.error('Failed to update event status:', error)
    }
  }

  const handleEventReschedule = () => {
    // Reload events after rescheduling
    loadEvents()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-oa-text-secondary">Loading calendar...</div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <CalendarEnhanced
        events={events}
        onEventStatusChange={handleEventStatusChange}
        onEventReschedule={handleEventReschedule}
      />
    </div>
  )
}
