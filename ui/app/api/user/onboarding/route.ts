import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { PATHS } from '@/lib/paths'

interface OnboardingData {
  name: string
  timezone: string
  productiveTime: string
  dailyHours: string
  motivation: string
  accountabilityStyle: string
  bigGoal: string
}

export async function POST(request: NextRequest) {
  try {
    const data: OnboardingData = await request.json()

    // Ensure directories exist
    const profileDir = PATHS.profile
    await fs.mkdir(profileDir, { recursive: true })

    // Create profile.md
    const profileContent = `# User Profile

- **Name:** ${data.name}
- **Timezone:** ${data.timezone}
- **Created:** ${new Date().toISOString().split('T')[0]}
- **Onboarding Completed:** true

## About
Big goal: ${data.bigGoal}
`
    await fs.writeFile(path.join(profileDir, 'profile.md'), profileContent)

    // Create availability.md
    const productiveLabels: Record<string, string> = {
      early_morning: 'Early morning (5-9am)',
      morning: 'Morning (9am-12pm)',
      afternoon: 'Afternoon (12-5pm)',
      evening: 'Evening (5-9pm)',
      night: 'Night (9pm+)',
    }

    const availabilityContent = `# Availability

## Productivity Pattern
- **Peak Hours:** ${productiveLabels[data.productiveTime] || data.productiveTime}
- **Daily Capacity:** ${data.dailyHours} hours
- **Timezone:** ${data.timezone}

## Weekly Schedule
| Day | Available | Notes |
|-----|-----------|-------|
| Mon | Yes | |
| Tue | Yes | |
| Wed | Yes | |
| Thu | Yes | |
| Fri | Flexible | |
| Sat | Yes | |
| Sun | Yes | |
`
    await fs.writeFile(path.join(profileDir, 'availability.md'), availabilityContent)

    // Create preferences.md
    const styleLabels: Record<string, string> = {
      tough: 'Tough Love',
      balanced: 'Balanced',
      gentle: 'Gentle',
    }

    const preferencesContent = `# Preferences

## Accountability Style
- **Type:** ${styleLabels[data.accountabilityStyle] || data.accountabilityStyle}
- **Check-in Frequency:** Daily
- **Reminder Tone:** ${data.accountabilityStyle === 'tough' ? 'Direct and challenging' : data.accountabilityStyle === 'gentle' ? 'Warm and supportive' : 'Firm but encouraging'}

## Communication
- **Preferred:** Short, actionable messages
- **Celebrations:** Brief acknowledgment
- **Missed Goals:** ${data.accountabilityStyle === 'tough' ? 'Call out directly' : 'Encourage recommitment'}

## Notifications
- **Daily Check-in:** ${data.productiveTime === 'night' ? '9:00 PM' : data.productiveTime === 'evening' ? '7:00 PM' : '8:00 AM'}
- **Streak Alerts:** Enabled
`
    await fs.writeFile(path.join(profileDir, 'preferences.md'), preferencesContent)

    // Create motivation-triggers.md
    const motivationLabels: Record<string, string> = {
      progress: 'Visible progress tracking',
      deadlines: 'Deadline pressure',
      accountability: 'External accountability',
      rewards: 'Rewards and treats',
    }

    const motivationContent = `# Motivation Triggers

## What Works
- ${motivationLabels[data.motivation] || data.motivation}

## Current Big Goal
${data.bigGoal}

## Notes
User prefers ${styleLabels[data.accountabilityStyle]} accountability style.
Most productive during ${productiveLabels[data.productiveTime]}.
`
    await fs.writeFile(path.join(profileDir, 'motivation-triggers.md'), motivationContent)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving onboarding data:', error)
    return NextResponse.json({ error: 'Failed to save onboarding data' }, { status: 500 })
  }
}
