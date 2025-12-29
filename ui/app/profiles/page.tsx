'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Button } from '@/components/ui'

interface Profile {
  id: string
  name: string
  email: string
  created: string
  lastActive: string
  owner: boolean
}

export default function ProfilesPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      const res = await fetch('/api/profiles')
      const data = await res.json()
      setProfiles(data.profiles || [])
    } catch (error) {
      console.error('Failed to load profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectProfile = (profileId: string) => {
    // Store active profile in localStorage
    localStorage.setItem('activeProfileId', profileId)

    // Redirect to root with loading
    router.push('/')
  }

  const handleCreateProfile = () => {
    router.push('/onboarding')
  }

  if (loading) {
    return (
      <div className="h-screen w-screen bg-oa-bg-primary flex items-center justify-center">
        <div className="text-oa-text-secondary">Loading profiles...</div>
      </div>
    )
  }

  // No profiles - show centered create button
  if (profiles.length === 0) {
    return (
      <div className="h-screen w-screen bg-oa-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={handleCreateProfile}
            className="w-48 h-48 border-2 border-dashed border-oa-border hover:border-oa-accent
                     bg-oa-bg-secondary hover:bg-oa-bg-tertiary transition-all rounded-2xl
                     flex flex-col items-center justify-center gap-4 group"
          >
            <div className="text-6xl text-oa-text-secondary group-hover:text-oa-accent transition-colors">
              +
            </div>
            <div className="text-sm font-medium text-oa-text-secondary group-hover:text-oa-accent transition-colors">
              Create Profile
            </div>
          </button>
          <p className="text-xs text-oa-text-secondary max-w-md text-center">
            Get started by creating your first profile. Each profile has its own challenges, todos, and personalized workspace.
          </p>
        </div>
      </div>
    )
  }

  // Has profiles - show grid with profile cards
  return (
    <div className="h-screen w-screen bg-oa-bg-primary flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <h1 className="text-3xl font-bold text-oa-text-primary mb-2 text-center">
          Select Profile
        </h1>
        <p className="text-sm text-oa-text-secondary mb-8 text-center">
          Choose a profile to continue or create a new one
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Existing profile cards */}
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => handleSelectProfile(profile.id)}
              className="w-full text-left"
            >
              <Card className="p-6 cursor-pointer hover:border-oa-accent transition-all group">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-oa-accent/10 flex items-center justify-center
                                text-3xl group-hover:bg-oa-accent/20 transition-colors">
                    👤
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-oa-text-primary">
                      {profile.name}
                    </div>
                    {profile.owner && (
                      <div className="text-xs text-oa-text-secondary mt-1 flex items-center justify-center gap-1">
                        <span>🔒</span>
                        <span>Owner</span>
                      </div>
                    )}
                    <div className="text-xs text-oa-text-secondary mt-2">
                      Active: {profile.lastActive}
                    </div>
                  </div>
                </div>
              </Card>
            </button>
          ))}

          {/* Create new profile card */}
          <button onClick={handleCreateProfile} className="w-full">
            <Card className="p-6 cursor-pointer border-dashed hover:border-oa-accent transition-all group">
              <div className="flex flex-col items-center gap-4 h-full justify-center">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-oa-border
                              group-hover:border-oa-accent flex items-center justify-center text-4xl
                              text-oa-text-secondary group-hover:text-oa-accent transition-all">
                  +
                </div>
                <div className="text-center">
                  <div className="font-semibold text-oa-text-secondary group-hover:text-oa-accent transition-colors">
                    Create Profile
                  </div>
                </div>
              </div>
            </Card>
          </button>
        </div>
      </div>
    </div>
  )
}
