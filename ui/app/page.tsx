'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoadingScreen from '@/components/LoadingScreen'

export default function Home() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        // First, check if profiles exist
        const res = await fetch('/api/profiles')
        const data = await res.json()
        const profiles = data.profiles || []

        if (profiles.length === 0) {
          // No profiles exist - new user - go to onboarding
          router.push('/onboarding')
        } else {
          // Profiles exist - existing user
          const activeProfileId = localStorage.getItem('activeProfileId')

          if (!activeProfileId) {
            // No active profile selected - show profile selector
            router.push('/profiles')
          } else {
            // Active profile exists - go to main app
            router.push('/app')
          }
        }
      } catch (error) {
        console.error('Failed to check initial route:', error)
        // On error, default to onboarding
        router.push('/onboarding')
      } finally {
        setIsChecking(false)
      }
    }

    checkInitialRoute()
  }, [router])

  return (
    <LoadingScreen
      steps={[
        { id: 'init', label: 'Initializing...', status: isChecking ? 'loading' : 'complete' }
      ]}
    />
  )
}
