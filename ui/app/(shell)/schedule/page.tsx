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

      // Load challenge tasks from MD files
      const challengeTasksRes = await fetch('/api/todos/from-challenges')
      const challengeTasksData = await challengeTasksRes.json()
      const challengeTasks = challengeTasksData.tasks || []

      // Load regular todos
      const todosUrl = addProfileId('/api/todos', profileId)
      const todosRes = await fetch(todosUrl)
      const todosData = await todosRes.json()
      const todos = Array.isArray(todosData) ? todosData : []

      // Load challenges for metadata
      const challengesRes = await fetch('/api/challenges')
      const challengesData = await challengesRes.json()
      const challenges = challengesData.challenges || []

      // Convert challenge tasks to calendar events
      // Group by day and create daily events
      const today = new Date()
      const challengeEvents = challengeTasks.map((task: any, index: number) => {
        // Calculate date based on challenge start + day number
        const challenge = challenges.find((c: any) => c.id === task.challengeId)
        const startDate = challenge?.startDate ? new Date(challenge.startDate) : today
        const taskDate = new Date(startDate)
        taskDate.setDate(taskDate.getDate() + (task.day - 1))

        return {
          id: task.id,
          title: task.title,
          date: taskDate.toISOString().split('T')[0],
          time: `${9 + Math.floor(index % 8)}:00`, // Spread across day
          duration: task.duration,
          status: task.completed ? 'completed' : 'pending',
          type: 'challenge-task' as const,
          challengeName: task.challengeName,
          challengeId: task.challengeId,
          day: task.day,
          dayTitle: task.dayTitle,
          priority: task.priority,
        }
      })

      // Convert regular todos to calendar events
      const todoEvents = todos.map((todo: any) => ({
        id: todo.id,
        title: todo.text || todo.title,
        date: todo.dueDate || new Date().toISOString().split('T')[0],
        time: todo.time,
        duration: todo.duration || 30,
        status: todo.status || (todo.completed === true ? 'completed' : 'pending'),
        type: 'todo' as const,
        challengeName: todo.challengeId,
        priority: todo.priority,
      }))

      setEvents([...challengeEvents, ...todoEvents])
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
