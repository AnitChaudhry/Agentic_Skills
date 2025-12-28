import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { PATHS } from '@/lib/paths'

export async function GET() {
  try {
    const profilePath = path.join(PATHS.profile, 'profile.md')

    // Check if profile exists (means onboarding is complete)
    try {
      await fs.access(profilePath)
      return NextResponse.json({ onboardingCompleted: true })
    } catch {
      return NextResponse.json({ onboardingCompleted: false })
    }
  } catch (error) {
    console.error('Error checking user status:', error)
    return NextResponse.json({ onboardingCompleted: false })
  }
}
