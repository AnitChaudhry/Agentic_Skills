import fs from 'fs/promises'
import path from 'path'
import type { Skill, SkillManifest } from '@/types/skill'

/**
 * Parse YAML frontmatter from SKILL.md content
 */
function parseFrontmatter(content: string): { frontmatter: Record<string, any>; body: string } {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)

  if (!frontmatterMatch) {
    return { frontmatter: {}, body: content }
  }

  const [, frontmatterStr, body] = frontmatterMatch
  const frontmatter: Record<string, any> = {}

  // Simple YAML parser for key: value pairs
  frontmatterStr.split('\n').forEach((line) => {
    const match = line.match(/^(\w[\w-]*):\s*(.+)$/)
    if (match) {
      const [, key, value] = match
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '').trim()
      // Try to parse numbers
      if (/^\d+$/.test(cleanValue)) {
        frontmatter[key] = parseInt(cleanValue, 10)
      } else if (cleanValue === 'true') {
        frontmatter[key] = true
      } else if (cleanValue === 'false') {
        frontmatter[key] = false
      } else {
        frontmatter[key] = cleanValue
      }
    }
  })

  return { frontmatter, body }
}

/**
 * Parse SKILL.md frontmatter to extract metadata
 */
export async function parseSkillManifest(skillPath: string): Promise<SkillManifest | null> {
  try {
    const skillMdPath = path.join(skillPath, 'SKILL.md')
    const content = await fs.readFile(skillMdPath, 'utf-8')

    const { frontmatter, body } = parseFrontmatter(content)

    // Get name from frontmatter or fallback to header
    let name = frontmatter.name
    if (!name) {
      const nameMatch = body.match(/^#\s+(.+)$/m)
      name = nameMatch ? nameMatch[1].trim() : path.basename(skillPath)
    }

    // Get description from frontmatter or fallback to first paragraph
    let description = frontmatter.description
    if (!description) {
      const descMatch = body.match(/^#\s+.+\n\n([\s\S]+?)(?:\n\n|\n#|$)/)
      description = descMatch ? descMatch[1].trim() : 'No description'
    }

    // Get category from frontmatter or infer
    const category = frontmatter.category || inferCategory(name, description)

    return {
      name,
      description,
      category,
      version: frontmatter.version,
      author: frontmatter.author,
      triggers: frontmatter.triggers,
      allowedTools: frontmatter['allowed-tools']?.split(',').map((t: string) => t.trim()),
      // Pack and unlock fields
      pack: frontmatter.pack,
      packDisplayName: frontmatter.packDisplayName || frontmatter['pack-display-name'],
      packValue: frontmatter.packValue || frontmatter['pack-value'],
      source: frontmatter.source,
      unlockDay: frontmatter.unlockDay || frontmatter['unlock-day'],
      isPremium: frontmatter.isPremium || frontmatter['is-premium'],
      revealMessage: frontmatter.revealMessage || frontmatter['reveal-message'],
    }
  } catch (error) {
    console.error(`Failed to parse skill at ${skillPath}:`, error)
    return null
  }
}

/**
 * Infer category from skill name and description
 */
function inferCategory(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase()

  if (
    text.includes('nutrition') ||
    text.includes('fitness') ||
    text.includes('workout') ||
    text.includes('health')
  ) {
    return 'health'
  }

  if (
    text.includes('learn') ||
    text.includes('skill') ||
    text.includes('onboarding')
  ) {
    return 'learning'
  }

  if (
    text.includes('image') ||
    text.includes('creative') ||
    text.includes('art') ||
    text.includes('diagram')
  ) {
    return 'creative'
  }

  if (
    text.includes('streak') ||
    text.includes('motivation') ||
    text.includes('schedule') ||
    text.includes('checkin') ||
    text.includes('accountability') ||
    text.includes('punishment')
  ) {
    return 'productivity'
  }

  return 'custom'
}

/**
 * Scan a directory for all skills
 */
export async function scanSkillsDirectory(
  skillsDir: string,
  currentDay?: number // Optional: for computing isLocked
): Promise<Skill[]> {
  const skills: Skill[] = []

  try {
    const entries = await fs.readdir(skillsDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = path.join(skillsDir, entry.name)
        const skillMdPath = path.join(skillPath, 'SKILL.md')

        // Check if SKILL.md exists
        try {
          await fs.access(skillMdPath)
        } catch {
          continue // Skip directories without SKILL.md
        }

        const manifest = await parseSkillManifest(skillPath)

        if (manifest) {
          // Compute isLocked based on unlockDay and currentDay
          const isLocked = manifest.unlockDay
            ? currentDay !== undefined && currentDay < manifest.unlockDay
            : false

          skills.push({
            id: entry.name,
            name: manifest.name,
            description: manifest.description,
            category: manifest.category as any,
            path: skillPath,
            isInstalled: true,
            isActive: false, // Will be updated based on agent config
            version: manifest.version,
            author: manifest.author,
            triggers: manifest.triggers,
            allowedTools: manifest.allowedTools,
            // Pack and unlock fields
            pack: manifest.pack,
            packDisplayName: manifest.packDisplayName,
            packValue: manifest.packValue,
            source: manifest.source,
            unlockDay: manifest.unlockDay,
            isLocked,
            isPremium: manifest.isPremium,
            revealMessage: manifest.revealMessage,
          })
        }
      }
    }
  } catch (error) {
    console.error(`Failed to scan skills directory ${skillsDir}:`, error)
  }

  return skills
}

/**
 * Load full skill content (for chat context)
 */
export async function loadSkillContent(skillPath: string): Promise<string> {
  try {
    const skillMdPath = path.join(skillPath, 'SKILL.md')
    return await fs.readFile(skillMdPath, 'utf-8')
  } catch (error) {
    console.error(`Failed to load skill content from ${skillPath}:`, error)
    return ''
  }
}
