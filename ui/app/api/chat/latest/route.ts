import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { PATHS } from '@/lib/paths'

/**
 * GET /api/chat/latest?agentId=xxx
 *
 * Returns the latest chat messages from the chat file.
 * Claude Code writes responses directly to the chat markdown files.
 * UI polls this endpoint to see new messages.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId') || 'accountability-coach'
    const since = searchParams.get('since') // Optional: only get messages after this timestamp

    const today = new Date().toISOString().split('T')[0]
    const chatFile = path.join(PATHS.chats, today, `${agentId}.md`)

    try {
      const content = await fs.readFile(chatFile, 'utf-8')

      // Parse messages from markdown
      const messages = parseMessages(content, agentId)

      // Filter by timestamp if provided
      const filteredMessages = since
        ? messages.filter(m => new Date(m.timestamp) > new Date(since))
        : messages

      return NextResponse.json({
        messages: filteredMessages,
        total: messages.length,
        chatFile: `${today}/${agentId}.md`
      })
    } catch {
      return NextResponse.json({
        messages: [],
        total: 0,
        chatFile: null
      })
    }

  } catch (error) {
    console.error('Failed to get latest messages:', error)
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    )
  }
}

function parseMessages(content: string, agentId: string) {
  const messages: any[] = []
  const lines = content.split('\n')

  let currentTime = ''
  let currentRole = ''
  let currentContent = ''
  let messageId = 0

  for (const line of lines) {
    // Time header like "## 10:30 AM"
    if (line.startsWith('## ')) {
      // Save previous message if exists
      if (currentContent.trim()) {
        messages.push({
          id: `msg-${messageId++}`,
          role: currentRole,
          content: currentContent.trim(),
          timestamp: parseTimeToISO(currentTime),
          agentId
        })
        currentContent = ''
      }
      currentTime = line.replace('## ', '').trim()
    }
    // User message
    else if (line.startsWith('**User:**')) {
      if (currentContent.trim()) {
        messages.push({
          id: `msg-${messageId++}`,
          role: currentRole,
          content: currentContent.trim(),
          timestamp: parseTimeToISO(currentTime),
          agentId
        })
      }
      currentRole = 'user'
      currentContent = line.replace('**User:**', '').trim()
    }
    // Agent response (Claude Code writes these)
    else if (line.startsWith('**Claude:**') || line.startsWith('**Agent:**') || line.startsWith('**Coach:**')) {
      if (currentContent.trim()) {
        messages.push({
          id: `msg-${messageId++}`,
          role: currentRole,
          content: currentContent.trim(),
          timestamp: parseTimeToISO(currentTime),
          agentId
        })
      }
      currentRole = 'assistant'
      currentContent = line.replace(/\*\*(Claude|Agent|Coach):\*\*/, '').trim()
    }
    // Continue current message
    else if (currentRole && line.trim()) {
      currentContent += '\n' + line
    }
  }

  // Don't forget the last message
  if (currentContent.trim()) {
    messages.push({
      id: `msg-${messageId++}`,
      role: currentRole,
      content: currentContent.trim(),
      timestamp: parseTimeToISO(currentTime),
      agentId
    })
  }

  return messages
}

function parseTimeToISO(timeStr: string): string {
  const today = new Date().toISOString().split('T')[0]
  try {
    const date = new Date(`${today} ${timeStr}`)
    return date.toISOString()
  } catch {
    return new Date().toISOString()
  }
}
