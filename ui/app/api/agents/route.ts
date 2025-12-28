import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { DATA_DIR, PATHS } from '@/lib/paths'

export async function GET() {
  try {
    const agentsFile = PATHS.agents

    // Read agents from file - return empty if doesn't exist
    try {
      await fs.access(agentsFile)
      const data = await fs.readFile(agentsFile, 'utf-8')
      const agents = JSON.parse(data)
      return NextResponse.json(agents)
    } catch {
      // No agents file - return empty array
      // User should create agents through the UI or by adding agents.json
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Failed to load agents:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const newAgent = await request.json()
    const agentsFile = PATHS.agents

    // Ensure base directory exists
    await fs.mkdir(DATA_DIR, { recursive: true })

    // Create agent-specific folder structure
    const agentDir = path.join(DATA_DIR, 'agents', newAgent.id)
    await fs.mkdir(agentDir, { recursive: true })

    // Create subdirectories
    const subdirs = ['workspace', 'prompts', 'config']
    for (const subdir of subdirs) {
      await fs.mkdir(path.join(agentDir, subdir), { recursive: true })
    }

    // Create agent metadata file
    const agentMetadata = {
      id: newAgent.id,
      name: newAgent.name,
      icon: newAgent.icon,
      description: newAgent.description,
      skills: newAgent.skills,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await fs.writeFile(
      path.join(agentDir, 'agent.json'),
      JSON.stringify(agentMetadata, null, 2)
    )

    // Create agent.md instruction file (main file Claude Code reads)
    const agentMd = `# ${newAgent.name}

## Description
${newAgent.description || 'No description provided'}

## Personality
- Tone: ${newAgent.personality?.tone || 'encouraging'}
- Style: ${newAgent.personality?.style || 'supportive'}

## Assigned Skills
${newAgent.skills && newAgent.skills.length > 0 ? newAgent.skills.map((s: string) => `- ${s}`).join('\n') : '- No skills assigned yet'}

## Custom Instructions
${newAgent.customInstructions || 'Follow the assigned skills and provide helpful responses.'}

## Focus Areas
${newAgent.focusAreas && newAgent.focusAreas.length > 0 ? newAgent.focusAreas.map((f: string) => `- ${f}`).join('\n') : '- General assistance'}

## Restrictions
${newAgent.restrictions && newAgent.restrictions.length > 0 ? newAgent.restrictions.map((r: string) => `- ${r}`).join('\n') : '- None specified'}

## Quick Actions
${newAgent.quickActions ? newAgent.quickActions.map((a: any) => `- ${a.label}`).join('\n') : '- No quick actions'}

## Capabilities
${newAgent.capabilities ? Object.entries(newAgent.capabilities).map(([k, v]) => `- ${k}: ${v}`).join('\n') : '- Default capabilities'}

---
Created: ${new Date().toISOString().split('T')[0]}
Last Modified: ${new Date().toISOString().split('T')[0]}
`
    await fs.writeFile(path.join(agentDir, 'agent.md'), agentMd)

    // Load existing agents from agents.json
    let agents = []
    try {
      const data = await fs.readFile(agentsFile, 'utf-8')
      agents = JSON.parse(data)
    } catch {
      // File doesn't exist, will create it
    }

    // Add new agent
    agents.push(newAgent)

    // Save to agents.json
    await fs.writeFile(agentsFile, JSON.stringify(agents, null, 2))

    return NextResponse.json({ success: true, agent: newAgent })
  } catch (error) {
    console.error('Failed to create agent:', error)
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    )
  }
}
