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
    const activityLogPath = path.join(
      PATHS.challenges,
      challengeId,
      'activity-log.md'
    )

    const content = await fs.readFile(activityLogPath, 'utf-8')

    // Parse the activity log to extract structured data
    const lines = content.split('\n')
    const activities: any[] = []
    let currentActivity: any = null

    for (const line of lines) {
      // Match date headers like "### 2025-12-27 (Day 1) ✅"
      const dateMatch = line.match(/^### (\d{4}-\d{2}-\d{2}) \(Day (\d+)\) (.+)/)
      if (dateMatch) {
        if (currentActivity) {
          activities.push(currentActivity)
        }
        currentActivity = {
          date: dateMatch[1],
          day: parseInt(dateMatch[2]),
          status: dateMatch[3].includes('✅') ? 'completed' :
                  dateMatch[3].includes('❌') ? 'missed' : 'pending',
          timeSpent: '',
          activities: [],
          wins: [],
          blockers: [],
          mood: '',
          energy: '',
          streak: 0,
        }
      }

      // Extract time spent
      if (line.startsWith('**Time Spent:**')) {
        const timeMatch = line.match(/\*\*Time Spent:\*\* (.+)/)
        if (timeMatch && currentActivity) {
          currentActivity.timeSpent = timeMatch[1]
        }
      }

      // Extract streak
      if (line.includes('**Streak:**')) {
        const streakMatch = line.match(/\*\*Streak:\*\* (\d+)/)
        if (streakMatch && currentActivity) {
          currentActivity.streak = parseInt(streakMatch[1])
        }
      }
    }

    if (currentActivity) {
      activities.push(currentActivity)
    }

    return NextResponse.json({
      content,
      activities,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error reading activity log:', error)
    return NextResponse.json(
      { error: 'Failed to read activity log', content: '', activities: [] },
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

    const activityLogPath = path.join(
      PATHS.challenges,
      challengeId,
      'activity-log.md'
    )

    await fs.writeFile(activityLogPath, content, 'utf-8')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating activity log:', error)
    return NextResponse.json(
      { error: 'Failed to update activity log' },
      { status: 500 }
    )
  }
}
