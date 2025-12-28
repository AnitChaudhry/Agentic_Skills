import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { PATHS } from '@/lib/paths'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const challengeId = params.id
    const progressPath = path.join(
      PATHS.challenges,
      challengeId,
      'progress.md'
    )

    const content = await fs.readFile(progressPath, 'utf-8')

    // Parse milestones
    const milestoneRegex = /^- \[([ x])\] (.+)$/gm
    const milestones: any[] = []
    let match

    while ((match = milestoneRegex.exec(content)) !== null) {
      milestones.push({
        id: `milestone-${milestones.length + 1}`,
        challengeId: challengeId,
        title: match[2].trim(),
        description: '',
        target: 0,
        achieved: match[1] === 'x',
        achievedAt: match[1] === 'x' ? new Date().toISOString() : undefined,
      })
    }

    return NextResponse.json({
      content,
      milestones,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error reading progress:', error)
    return NextResponse.json(
      { error: 'Failed to read progress', content: '', milestones: [] },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const challengeId = params.id
    const { content } = await request.json()

    const progressPath = path.join(
      PATHS.challenges,
      challengeId,
      'progress.md'
    )

    await fs.writeFile(progressPath, content, 'utf-8')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}
