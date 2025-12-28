import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { PATHS } from '@/lib/paths'

/**
 * GET /api/inbox/status
 *
 * Returns the count of pending messages in the inbox.
 * Used by UI to show notification when messages are waiting for Claude Code.
 */
export async function GET() {
  try {
    await fs.mkdir(PATHS.inbox, { recursive: true })

    const files = await fs.readdir(PATHS.inbox)
    const jsonFiles = files.filter(f => f.endsWith('.json'))

    let pending = 0
    let processed = 0

    for (const file of jsonFiles) {
      try {
        const content = await fs.readFile(`${PATHS.inbox}/${file}`, 'utf-8')
        const message = JSON.parse(content)

        if (message.status === 'pending') {
          pending++
        } else {
          processed++
        }
      } catch {
        // Skip invalid files
      }
    }

    return NextResponse.json({
      pending,
      processed,
      total: jsonFiles.length,
      inboxPath: PATHS.inbox
    })
  } catch (error) {
    console.error('Error checking inbox:', error)
    return NextResponse.json({ pending: 0, processed: 0, total: 0 })
  }
}
