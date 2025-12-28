'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import { Shell } from '@/components/shell/Shell'
import { LeftSidebar } from '@/components/shell/LeftSidebar'
import { CenterChat } from '@/components/shell/CenterChat'
import { RightPanel } from '@/components/shell/RightPanel'
import { QuickCheckin } from '@/components/global/QuickCheckin'

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams()
  const isOnboarding = searchParams?.get('onboarding') === 'true'

  return (
    <>
      <Shell
        left={<LeftSidebar />}
        center={children || <CenterChat />}
        right={!isOnboarding ? <RightPanel /> : null}
      />
      <QuickCheckin />
    </>
  )
}
