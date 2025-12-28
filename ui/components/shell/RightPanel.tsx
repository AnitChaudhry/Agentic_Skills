'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChallengeStore, useTodoStore } from '@/lib/store'
import { ChevronDown, ChevronRight, Calendar, Clock, Target, Flame, CheckCircle2, Circle } from 'lucide-react'
import type { Challenge, Todo } from '@/types'

export function RightPanel() {
  const router = useRouter()
  const { challenges, loadChallenges } = useChallengeStore()
  const { todos, loadTodos } = useTodoStore()
  const [expandedNextDay, setExpandedNextDay] = useState(false)

  useEffect(() => {
    loadChallenges()
    loadTodos()
  }, [])

  const activeChallenges = Array.isArray(challenges) ? challenges.filter(c => c.status === 'active') : []
  const todayTodos = Array.isArray(todos) ? todos.filter(t => {
    const today = new Date().toISOString().split('T')[0]
    return t.dueDate === today && t.status !== 'completed'
  }) : []

  // Get tomorrow's date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const tomorrowTodos = Array.isArray(todos) ? todos.filter(t => t.dueDate === tomorrowStr) : []

  return (
    <div className="flex flex-col h-full bg-oa-bg-primary overflow-y-auto">
      {/* Active Streak Section */}
      <div className="p-4 border-b border-oa-border">
        <h3 className="text-[10px] font-bold text-oa-text-secondary uppercase tracking-wider mb-3">
          Active Streaks
        </h3>

        {activeChallenges.length > 0 ? (
          <div className="space-y-3">
            {activeChallenges.map((challenge) => (
              <div
                key={challenge.id}
                onClick={() => router.push(`/streak/${challenge.id}`)}
                className="p-3 rounded-lg border border-oa-border hover:border-oa-accent bg-oa-bg-secondary hover:bg-oa-bg-tertiary transition-all cursor-pointer group"
              >
                {/* Streak Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-semibold text-oa-text-primary group-hover:text-oa-accent">
                      {challenge.streak.current} days
                    </span>
                  </div>
                  <span className="text-xs text-oa-accent bg-oa-accent/10 px-2 py-0.5 rounded-full">
                    {challenge.progress}%
                  </span>
                </div>

                {/* Challenge Name */}
                <p className="text-xs text-oa-text-secondary mb-2 line-clamp-1">
                  {challenge.name}
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-oa-bg-primary rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-oa-accent to-blue-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${challenge.progress}%` }}
                  />
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mt-2 text-[10px] text-oa-text-secondary">
                  <span>Best: {challenge.streak.best} days</span>
                  <span>Day {Math.ceil((new Date().getTime() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24))}/{challenge.totalDays || 30}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-oa-text-secondary">No active challenges</p>
          </div>
        )}
      </div>

      {/* Upcoming Todos Section */}
      <div className="p-4 border-b border-oa-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-bold text-oa-text-secondary uppercase tracking-wider">
            Today's Todos
          </h3>
          <span className="text-xs text-oa-accent bg-oa-accent/10 px-2 py-0.5 rounded-full">
            {todayTodos.length}
          </span>
        </div>

        {todayTodos.length > 0 ? (
          <div className="space-y-2">
            {todayTodos.slice(0, 4).map((todo) => (
              <div
                key={todo.id}
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-oa-bg-secondary transition-colors cursor-pointer"
                onClick={() => router.push('/todos')}
              >
                <Circle className="w-4 h-4 text-oa-text-secondary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-oa-text-primary line-clamp-1">{todo.text}</p>
                  {todo.time && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-oa-text-secondary" />
                      <span className="text-[10px] text-oa-text-secondary">{todo.time}</span>
                    </div>
                  )}
                </div>
                {todo.priority === 'high' && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded">!</span>
                )}
              </div>
            ))}
            {todayTodos.length > 4 && (
              <p className="text-[10px] text-oa-text-secondary text-center pt-1">
                +{todayTodos.length - 4} more
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-xs text-oa-text-secondary">All caught up!</p>
          </div>
        )}
      </div>

      {/* Next Day Plan Section (Expandable) */}
      <div className="p-4 border-b border-oa-border">
        <button
          onClick={() => setExpandedNextDay(!expandedNextDay)}
          className="flex items-center justify-between w-full mb-2"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-[10px] font-bold text-oa-text-secondary uppercase tracking-wider">
              Tomorrow's Plan
            </h3>
            <span className="text-xs text-oa-text-secondary bg-oa-bg-secondary px-2 py-0.5 rounded-full">
              {tomorrowTodos.length} items
            </span>
          </div>
          {expandedNextDay ? (
            <ChevronDown className="w-4 h-4 text-oa-text-secondary" />
          ) : (
            <ChevronRight className="w-4 h-4 text-oa-text-secondary" />
          )}
        </button>

        {expandedNextDay && (
          <div className="space-y-2 mt-3">
            {tomorrowTodos.length > 0 ? (
              tomorrowTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start gap-2 p-2 rounded-lg bg-oa-bg-secondary"
                >
                  <Calendar className="w-4 h-4 text-oa-text-secondary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-oa-text-primary line-clamp-1">{todo.text}</p>
                    {todo.time && (
                      <span className="text-[10px] text-oa-text-secondary">{todo.time}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-oa-text-secondary text-center py-2">
                No tasks scheduled for tomorrow
              </p>
            )}

            <button
              onClick={() => router.push('/schedule')}
              className="w-full text-xs text-oa-accent hover:text-oa-accent-hover py-2 transition-colors"
            >
              View Full Schedule →
            </button>
          </div>
        )}
      </div>

      {/* Challenge Plan Section */}
      {activeChallenges.length > 0 && (
        <div className="p-4">
          <h3 className="text-[10px] font-bold text-oa-text-secondary uppercase tracking-wider mb-3">
            Challenge Plan
          </h3>

          {activeChallenges.slice(0, 1).map((challenge) => (
            <div key={challenge.id} className="space-y-2">
              {/* Current objective */}
              <div className="p-3 rounded-lg bg-oa-bg-secondary border border-oa-border">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-oa-accent" />
                  <span className="text-xs font-medium text-oa-text-primary">Current Goal</span>
                </div>
                <p className="text-xs text-oa-text-secondary line-clamp-2">
                  {challenge.goal || 'Complete your daily tasks to maintain streak'}
                </p>
              </div>

              {/* Upcoming milestones */}
              {challenge.milestones && challenge.milestones.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] text-oa-text-secondary font-medium">Upcoming Milestones:</p>
                  {challenge.milestones
                    .filter(m => !m.completed)
                    .slice(0, 2)
                    .map((milestone, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-oa-text-secondary">
                        <div className="w-1.5 h-1.5 rounded-full bg-oa-accent/50" />
                        <span className="line-clamp-1">{milestone.name}</span>
                        {milestone.day && (
                          <span className="text-[10px] ml-auto">Day {milestone.day}</span>
                        )}
                      </div>
                    ))}
                </div>
              )}

              <button
                onClick={() => router.push('/plan')}
                className="w-full text-xs text-oa-accent hover:text-oa-accent-hover py-2 transition-colors"
              >
                View Full Plan →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
