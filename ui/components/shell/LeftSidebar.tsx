'use client'

import React, { useEffect } from 'react'
import { useAgentStore, useTodoStore } from '@/lib/store'
import { AgentCard } from '@/components/sidebar/AgentCard'
import { AddAgentButton } from '@/components/sidebar/AddAgentButton'
import { NavSection } from '@/components/sidebar/NavSection'

export function LeftSidebar() {
  const { agents, activeAgentId, setActiveAgent, loadAgents } = useAgentStore()
  const { todos, loadTodos } = useTodoStore()

  useEffect(() => {
    loadAgents()
    loadTodos()
  }, [])

  const pendingTodos = Array.isArray(todos) ? todos.filter(t => t.status !== 'completed').length : 0

  return (
    <div className="flex flex-col h-full bg-oa-bg-primary">
      {/* Logo Section */}
      <div className="px-6 py-6 border-b border-oa-border">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-oa-accent via-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-oa-accent/20">
            <span className="text-white text-sm font-bold">OA</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-oa-text-primary tracking-tight">OpenAnalyst</h1>
            <p className="text-[10px] text-oa-text-secondary uppercase tracking-wide">Accountability Coach</p>
          </div>
        </div>
      </div>

      {/* Agents Section */}
      <div className="border-b border-oa-border py-2">
        <div className="px-6 py-2">
          <h2 className="text-[10px] font-bold text-oa-text-secondary uppercase tracking-wider">Your Agents</h2>
        </div>
        <div>
          {Array.isArray(agents) && agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isActive={activeAgentId === agent.id}
              onClick={() => setActiveAgent(agent.id)}
            />
          ))}
          <AddAgentButton />
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-6 py-2">
          <h2 className="text-[10px] font-bold text-oa-text-secondary uppercase tracking-wider">Navigate</h2>
        </div>
        <div>
          <NavSection title="Schedule" href="/schedule" icon="calendar" />
          <NavSection title="Todos" href="/todos" icon="check-square" count={pendingTodos} />
          <NavSection title="Streaks" href="/streak" icon="flame" />
          <NavSection title="Plan" href="/plan" icon="file-text" />
          <NavSection title="Vision Boards" href="/visionboards" icon="sparkles" />
          <NavSection title="Skills" href="/skills" icon="zap" />
          <NavSection title="Prompts" href="/prompts" icon="message-circle" />
          <NavSection title="Chat History" href="/history" icon="message-square" />
          <NavSection title="Assets" href="/assets" icon="image" />
          <NavSection title="Settings" href="/settings" icon="settings" />
        </div>
      </div>
    </div>
  )
}
