import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import type { Prompt } from '@/types/prompt'
import { PATHS } from '@/lib/paths'

const getPromptsDir = () => PATHS.prompts

const getPromptsFile = () => path.join(getPromptsDir(), 'prompts.json')

// GET - List all prompts (global + agent-specific)
export async function GET(request: NextRequest) {
  try {
    const promptsFile = getPromptsFile()

    // Ensure directory exists
    await fs.mkdir(getPromptsDir(), { recursive: true })

    // Check if file exists
    try {
      await fs.access(promptsFile)
    } catch {
      // Create default prompts file
      const defaultPrompts: Prompt[] = []
      await fs.writeFile(promptsFile, JSON.stringify(defaultPrompts, null, 2))
      return NextResponse.json({ prompts: defaultPrompts })
    }

    const data = await fs.readFile(promptsFile, 'utf-8')
    const prompts: Prompt[] = JSON.parse(data)

    return NextResponse.json({ prompts })
  } catch (error) {
    console.error('Failed to load prompts:', error)
    return NextResponse.json(
      { error: 'Failed to load prompts' },
      { status: 500 }
    )
  }
}

// POST - Create new prompt
export async function POST(request: NextRequest) {
  try {
    const promptData = await request.json()
    const promptsFile = getPromptsFile()

    // Ensure directory exists
    await fs.mkdir(getPromptsDir(), { recursive: true })

    // Load existing prompts
    let prompts: Prompt[] = []
    try {
      const data = await fs.readFile(promptsFile, 'utf-8')
      prompts = JSON.parse(data)
    } catch {
      // File doesn't exist, will create it
    }

    // Create new prompt
    const newPrompt: Prompt = {
      id: `prompt-${Date.now()}`,
      name: promptData.name,
      description: promptData.description,
      content: promptData.content,
      category: promptData.category || 'custom',
      tags: promptData.tags || [],
      isGlobal: promptData.isGlobal ?? false,
      createdBy: promptData.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    prompts.push(newPrompt)
    await fs.writeFile(promptsFile, JSON.stringify(prompts, null, 2))

    return NextResponse.json({ prompt: newPrompt })
  } catch (error) {
    console.error('Failed to create prompt:', error)
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    )
  }
}
