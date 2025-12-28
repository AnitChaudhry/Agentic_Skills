import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface InitStep {
  id: string
  label: string
  status: 'pending' | 'loading' | 'complete' | 'error'
}

export function useInitialization() {
  const router = useRouter()
  const [steps, setSteps] = useState<InitStep[]>([
    { id: 'env', label: 'Setting up environment', status: 'pending' },
    { id: 'onboarding', label: 'Checking user status', status: 'pending' },
    { id: 'agents', label: 'Loading agents', status: 'pending' },
    { id: 'workspace', label: 'Reading workspace files', status: 'pending' },
    { id: 'config', label: 'Loading configurations', status: 'pending' },
  ])
  const [isComplete, setIsComplete] = useState(false)

  const updateStep = (id: string, status: InitStep['status']) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, status } : step))
    )
  }

  useEffect(() => {
    const initialize = async () => {
      try {
        // Step 1: Environment setup
        updateStep('env', 'loading')
        await new Promise((resolve) => setTimeout(resolve, 500))
        updateStep('env', 'complete')

        // Step 2: Check onboarding status
        updateStep('onboarding', 'loading')
        try {
          const response = await fetch('/api/user/status')
          const data = await response.json()

          if (!data.hasCompletedOnboarding) {
            updateStep('onboarding', 'complete')
            router.push('/onboarding')
            return
          }
          updateStep('onboarding', 'complete')
        } catch (error) {
          // If API fails, assume first time user
          updateStep('onboarding', 'complete')
          router.push('/onboarding')
          return
        }

        // Step 3: Load agents
        updateStep('agents', 'loading')
        try {
          await fetch('/api/agents')
          updateStep('agents', 'complete')
        } catch (error) {
          console.error('Failed to load agents:', error)
          updateStep('agents', 'error')
        }

        // Step 4: Load workspace files
        updateStep('workspace', 'loading')
        await new Promise((resolve) => setTimeout(resolve, 400))
        updateStep('workspace', 'complete')

        // Step 5: Load configurations
        updateStep('config', 'loading')
        try {
          await Promise.all([
            fetch('/api/user/profile'),
            fetch('/api/todos'),
            fetch('/api/challenges'),
          ])
          updateStep('config', 'complete')
        } catch (error) {
          console.error('Failed to load config:', error)
          updateStep('config', 'error')
        }

        // All done - redirect to app
        await new Promise((resolve) => setTimeout(resolve, 300))
        setIsComplete(true)
        router.push('/app')
      } catch (error) {
        console.error('Initialization error:', error)
      }
    }

    initialize()
  }, [router])

  return { steps, isComplete }
}
