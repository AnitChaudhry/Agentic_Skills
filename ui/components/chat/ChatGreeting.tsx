'use client'

import React, { useEffect, useState } from 'react'

interface ChatGreetingProps {
  agentName?: string
}

export function ChatGreeting({ agentName }: ChatGreetingProps) {
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile')
        const profile = await response.json()
        if (profile.name) {
          // Capitalize first letter
          const capitalizedName = profile.name.charAt(0).toUpperCase() + profile.name.slice(1).toLowerCase()
          setUserName(capitalizedName)
        }
      } catch (error) {
        console.error('Failed to load user profile:', error)
        setUserName('Anit') // Default fallback
      }
    }
    loadUserProfile()
  }, [])

  const getSubtitle = () => {
    if (agentName) {
      return `Chat with ${agentName} - All conversations are agent-specific`
    }
    return 'Unified chat - Talk about anything across all your agents'
  }

  return (
    <div className="text-center mb-8">
      <h1 className="text-5xl font-light italic text-oa-text-primary mb-2">
        Welcome back, {userName || 'Anit'}
      </h1>
      <p className="text-sm text-oa-text-secondary">
        {getSubtitle()}
      </p>
      {agentName && (
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-oa-bg-secondary border border-oa-border rounded-full text-xs">
          <div className="w-2 h-2 bg-oa-accent rounded-full"></div>
          <span className="text-oa-text-primary">Agent Context: {agentName}</span>
        </div>
      )}
    </div>
  )
}
