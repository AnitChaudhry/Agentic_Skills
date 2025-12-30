import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { PATHS } from '@/lib/paths'

// Parse tasks from a daily MD file
function parseTasksFromDayMd(content: string, challengeId: string, challengeName: string, dayNum: number, filename: string) {
  const tasks: any[] = []

  // Extract title from first heading
  const titleMatch = content.match(/^#\s+Day\s+\d+\s+-\s+(.+)$/m)
  const dayTitle = titleMatch ? titleMatch[1].trim() : `Day ${dayNum}`

  // Extract status
  const isCompleted = content.includes('Status: completed') || content.includes('Completed:** Yes')

  // Extract tasks (checkboxes)
  const taskMatches = content.matchAll(/- \[([ xX])\]\s*(.+)/g)
  let taskIndex = 0

  for (const match of taskMatches) {
    const completed = match[1].toLowerCase() === 'x'
    const text = match[2].trim()

    // Extract duration if present (e.g., "Task name (10 min)")
    const durationMatch = text.match(/\((\d+)\s*min\)/)
    const duration = durationMatch ? parseInt(durationMatch[1]) : 30

    tasks.push({
      id: `${challengeId}-day${dayNum}-task${taskIndex}`,
      title: text.replace(/\s*\(\d+\s*min\)\s*(\(\d+\s*min\))?/, '').trim(), // Remove duration from title
      text: text,
      challengeId,
      challengeName,
      day: dayNum,
      dayTitle,
      status: completed ? 'completed' : 'pending',
      completed,
      duration,
      priority: taskIndex < 2 ? 'high' : (taskIndex < 4 ? 'medium' : 'low'),
      createdAt: filename.replace('.md', ''),
    })
    taskIndex++
  }

  return tasks
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFilter = searchParams.get('date') // Optional: filter by specific date/day
    const challengeFilter = searchParams.get('challengeId') // Optional: filter by challenge

    const challengesDir = PATHS.challenges
    const allTasks: any[] = []

    // Get all challenge directories
    const dirs = await fs.readdir(challengesDir, { withFileTypes: true })

    for (const dir of dirs) {
      if (!dir.isDirectory()) continue
      if (challengeFilter && dir.name !== challengeFilter) continue

      const challengeId = dir.name
      const challengeDir = path.join(challengesDir, challengeId)

      // Get challenge name from challenge.md
      let challengeName = challengeId
      try {
        const challengeMd = await fs.readFile(path.join(challengeDir, 'challenge.md'), 'utf-8')
        const nameMatch = challengeMd.match(/^#\s+(.+)$/m)
        if (nameMatch) challengeName = nameMatch[1].trim()
      } catch {}

      // Check for days/ folder
      const daysDir = path.join(challengeDir, 'days')
      try {
        await fs.access(daysDir)
      } catch {
        continue // No days folder
      }

      // Read all day files
      const files = await fs.readdir(daysDir)
      const dayFiles = files.filter(f => f.endsWith('.md')).sort()

      for (const filename of dayFiles) {
        // Extract day number
        const dayMatch = filename.match(/day-?(\d+)\.md/i) || filename.match(/(\d{4}-\d{2}-\d{2})\.md/)
        const dayNum = dayMatch ? (dayMatch[1].includes('-') ? 1 : parseInt(dayMatch[1])) : 1

        // Optional date filter
        if (dateFilter) {
          if (dateFilter === 'today') {
            // For "today", show current day based on challenge progress
            // Simple: just show day 1-3 for now
            if (dayNum > 3) continue
          } else if (!filename.includes(dateFilter) && `day-${dateFilter.padStart(2, '0')}` !== filename.replace('.md', '')) {
            continue
          }
        }

        const filePath = path.join(daysDir, filename)
        const content = await fs.readFile(filePath, 'utf-8')
        const tasks = parseTasksFromDayMd(content, challengeId, challengeName, dayNum, filename)
        allTasks.push(...tasks)
      }
    }

    // Sort by day number and priority
    allTasks.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 2)
    })

    return NextResponse.json({
      tasks: allTasks,
      total: allTasks.length,
      completed: allTasks.filter(t => t.completed).length,
    })
  } catch (error: any) {
    console.error('Error loading tasks from challenges:', error)
    return NextResponse.json({ tasks: [], error: error.message }, { status: 500 })
  }
}
