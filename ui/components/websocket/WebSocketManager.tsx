'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle } from 'lucide-react'

/**
 * Minimal inbox status indicator
 * Shows a small, unobtrusive status when messages are pending
 */
export function WebSocketManager() {
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const checkInbox = async () => {
      try {
        const res = await fetch('/api/inbox/status')
        const data = await res.json()
        setPendingCount(data.pending || 0)
      } catch {
        // Ignore errors
      }
    }

    checkInbox()
    const interval = setInterval(checkInbox, 5000)
    return () => clearInterval(interval)
  }, [])

  // Only show when there are pending messages
  if (pendingCount === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-oa-bg-secondary border border-oa-border shadow-lg">
        <Loader2 className="w-3 h-3 text-oa-accent animate-spin" />
        <span className="text-xs text-oa-text-secondary">Processing...</span>
      </div>
    </div>
  )
}
