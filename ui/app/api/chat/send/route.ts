import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { PATHS } from '@/lib/paths'

/**
 * POST /api/chat/send
 *
 * This endpoint receives user messages and writes them to the inbox.
 * Claude Code (running in CLI) will read from inbox and respond by
 * writing to the appropriate data files.
 *
 * The UI just polls/refreshes to see the latest data.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, content, attachments } = body

    if (!agentId || !content) {
      return NextResponse.json(
        { error: 'Missing agentId or content' },
        { status: 400 }
      )
    }

    // Create inbox directory if needed
    await fs.mkdir(PATHS.inbox, { recursive: true })

    // Generate unique request ID
    const requestId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const timestamp = new Date().toISOString()

    // Write message to inbox for Claude Code to process
    const inboxFile = path.join(PATHS.inbox, `${requestId}.json`)
    await fs.writeFile(inboxFile, JSON.stringify({
      id: requestId,
      agentId,
      content,
      attachments: attachments || [],
      timestamp,
      status: 'pending',
      source: 'ui'
    }, null, 2))

    // Also append to today's chat file (user message only)
    const today = new Date().toISOString().split('T')[0]
    const chatDir = path.join(PATHS.chats, today)
    await fs.mkdir(chatDir, { recursive: true })

    const chatFile = path.join(chatDir, `${agentId}.md`)
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    let chatContent = ''
    try {
      chatContent = await fs.readFile(chatFile, 'utf-8')
    } catch {
      chatContent = `# Chat with ${agentId} - ${today}\n\n`
    }

    chatContent += `## ${time}\n**User:** ${content}\n\n`

    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        chatContent += `[Attachment: ${att}]\n`
      }
      chatContent += '\n'
    }

    await fs.writeFile(chatFile, chatContent)

    console.log(`[Chat] Message saved to inbox: ${requestId}`)

    return NextResponse.json({
      success: true,
      requestId,
      message: 'Message sent to Claude Code. Refresh to see response.',
      inboxFile: path.basename(inboxFile)
    })

  } catch (error) {
    console.error('Failed to send message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
