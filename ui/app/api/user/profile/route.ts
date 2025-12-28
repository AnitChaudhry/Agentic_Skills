import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { DATA_DIR, PATHS } from '@/lib/paths'

export async function GET() {
  try {
    const profilePath = path.join(PATHS.profile, 'profile.md')
    const challengesDir = PATHS.challenges

    // Read profile
    let name = 'User'
    try {
      const profileContent = await fs.readFile(profilePath, 'utf-8')
      const nameMatch = profileContent.match(/\*\*Name:\*\*\s*(.+)/)
      if (nameMatch) {
        name = nameMatch[1].trim()
      }
    } catch {
      // Profile doesn't exist
    }

    // Count active challenges
    let activeChallenges = 0
    let totalStreak = 0
    let completedToday = false

    try {
      const challenges = await fs.readdir(challengesDir)
      for (const challenge of challenges) {
        const metaPath = path.join(challengesDir, challenge, '.skill-meta.json')
        try {
          const meta = JSON.parse(await fs.readFile(metaPath, 'utf-8'))
          if (meta.status === 'active') {
            activeChallenges++
            totalStreak = Math.max(totalStreak, meta.streak || 0)
          }
        } catch {
          // Invalid challenge folder
        }
      }
    } catch {
      // Challenges directory doesn't exist
    }

    // Check if checked in today
    const today = new Date().toISOString().split('T')[0]
    const checkinPath = path.join(DATA_DIR, 'checkins', `${today}.md`)
    try {
      await fs.access(checkinPath)
      completedToday = true
    } catch {
      // No check-in today
    }

    return NextResponse.json({
      name,
      totalStreak,
      activeChallenges,
      completedToday,
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({
      name: 'User',
      totalStreak: 0,
      activeChallenges: 0,
      completedToday: false,
    })
  }
}
