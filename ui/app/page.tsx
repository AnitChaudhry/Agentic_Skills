'use client'

import LoadingScreen from '@/components/LoadingScreen'
import { useInitialization } from '@/lib/useInitialization'

export default function Home() {
  const { steps } = useInitialization()

  return <LoadingScreen steps={steps} />
}
