'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui'

type GuideSection = {
  id: string
  title: string
  icon: string
  content: React.ReactNode
}

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState<string>('getting-started')

  const sections: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Welcome to OpenAnalyst Accountability Coach</h3>
            <p className="text-sm text-oa-text-secondary leading-relaxed mb-4">
              This is your personal accountability system powered by AI. Everything runs locally on your machine,
              and all your data is stored in <code className="px-2 py-1 bg-oa-bg-secondary border border-oa-border">data/</code> directory.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Quick Start Steps</h4>
            <ol className="text-sm text-oa-text-secondary space-y-2 list-decimal list-inside">
              <li>Complete the onboarding (7 questions about your goals and preferences)</li>
              <li>Create your first challenge from the Streaks section</li>
              <li>Use the floating check-in button (bottom-right) daily to log progress</li>
              <li>Chat with your accountability agent for guidance and support</li>
              <li>Review insights to track your progress over time</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">System Requirements</h4>
            <ul className="text-sm text-oa-text-secondary space-y-1">
              <li>• Node.js 18+ installed</li>
              <li>• Claude API key (Anthropic)</li>
              <li>• Gemini API key (for vision board features)</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'agents',
      title: 'Understanding Agents',
      icon: '🤖',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">What are Agents?</h3>
            <p className="text-sm text-oa-text-secondary leading-relaxed mb-4">
              Agents are specialized AI assistants focused on different aspects of your accountability journey.
              Each agent has its own personality, capabilities, and file structure.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Default Agent: Accountability Coach</h4>
            <p className="text-sm text-oa-text-secondary mb-3">
              Your primary accountability partner. Direct, supportive, and action-focused.
            </p>
            <div className="bg-oa-bg-secondary border border-oa-border p-4 text-xs">
              <p className="mb-2"><strong>Capabilities:</strong></p>
              <ul className="space-y-1 text-oa-text-secondary">
                <li>• Daily check-ins and progress tracking</li>
                <li>• Goal setting and planning</li>
                <li>• Accountability contracts with consequences</li>
                <li>• Insights and pattern recognition</li>
                <li>• Intelligent schedule rescheduling</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Adding New Agents</h4>
            <p className="text-sm text-oa-text-secondary mb-3">
              Click the "Add Agent" button in the left sidebar. You'll need to create:
            </p>
            <ol className="text-sm text-oa-text-secondary space-y-2 list-decimal list-inside">
              <li>Agent folder in <code className="px-1 bg-oa-bg-secondary">data/agents/</code></li>
              <li><code className="px-1 bg-oa-bg-secondary">agent.json</code> config file with name, description, capabilities</li>
              <li>Optional: custom prompt file for specialized behavior</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Agent File Structure</h4>
            <pre className="bg-oa-bg-secondary border border-oa-border p-4 text-xs overflow-x-auto">
{`data/agents/
├── accountability-coach/
│   ├── agent.json          # Agent configuration
│   ├── context/            # Agent-specific knowledge
│   ├── outputs/            # Generated summaries
│   └── resources/          # Files, images, videos
└── your-custom-agent/
    └── ...`}
            </pre>
          </div>
        </div>
      ),
    },
    {
      id: 'checkins',
      title: 'Daily Check-ins',
      icon: '✓',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">The Power of Daily Check-ins</h3>
            <p className="text-sm text-oa-text-secondary leading-relaxed mb-4">
              Check-ins are the core of your accountability system. They help you stay consistent,
              track progress, and build momentum.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">How to Check In</h4>
            <ol className="text-sm text-oa-text-secondary space-y-3 list-decimal list-inside">
              <li>
                <strong>Click the floating checkmark button</strong> (bottom-right corner, available everywhere)
              </li>
              <li>
                <strong>Rate your mood</strong> - How are you feeling today? (1-5 scale)
              </li>
              <li>
                <strong>Mark task completion</strong> - Did you complete today's scheduled task?
              </li>
              <li>
                <strong>Record wins and blockers</strong> - What went well? What challenges did you face?
              </li>
              <li>
                <strong>Commit to tomorrow</strong> - What will you accomplish tomorrow?
              </li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Check-in Data Storage</h4>
            <p className="text-sm text-oa-text-secondary mb-2">
              All check-ins are saved as markdown files:
            </p>
            <code className="block bg-oa-bg-secondary border border-oa-border p-3 text-xs">
              data/checkins/YYYY-MM-DD.md
            </code>
            <p className="text-xs text-oa-text-secondary mt-2">
              You can edit these files manually if needed. They're human-readable and version-control friendly.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Email Reminders</h4>
            <p className="text-sm text-oa-text-secondary">
              Set up email reminders in Settings to get notified before your scheduled tasks.
              Reminders include your progression tracker and upcoming task details.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'schedule',
      title: 'Schedule & Rescheduling',
      icon: '📅',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Intelligent Scheduling</h3>
            <p className="text-sm text-oa-text-secondary leading-relaxed mb-4">
              Your schedule is stored in <code className="px-2 py-1 bg-oa-bg-secondary">data/schedule/calendar.json</code>.
              It works like Google Calendar but with AI-powered intelligent rescheduling.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">How Rescheduling Works</h4>
            <p className="text-sm text-oa-text-secondary mb-3">
              When you reschedule a task, the system:
            </p>
            <ol className="text-sm text-oa-text-secondary space-y-2 list-decimal list-inside">
              <li>Analyzes dependencies (what tasks depend on this one)</li>
              <li>Identifies affected tasks</li>
              <li>Intelligently shifts only related tasks</li>
              <li>Preserves your overall plan structure</li>
              <li>Updates challenge logs automatically</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Calendar Features</h4>
            <ul className="text-sm text-oa-text-secondary space-y-2">
              <li>• Recurring tasks (daily, weekly, custom patterns)</li>
              <li>• Task prioritization (high, medium, low)</li>
              <li>• Time blocking with duration estimates</li>
              <li>• Multi-challenge scheduling</li>
              <li>• Automatic conflict detection</li>
            </ul>
          </div>

          <div className="bg-oa-bg-secondary border border-oa-border p-4">
            <p className="text-xs text-oa-text-secondary">
              <strong>Pro Tip:</strong> Use the chat to ask your agent to reschedule tasks.
              Say something like "Reschedule my workout to tomorrow morning" and it will
              intelligently adjust your schedule.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'contracts',
      title: 'Commitment Contracts',
      icon: '📜',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">What are Commitment Contracts?</h3>
            <p className="text-sm text-oa-text-secondary leading-relaxed mb-4">
              Also known as "punishment mode" - put real money on the line to force accountability.
              Inspired by StickK and Beeminder, contracts add financial consequences to failure.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">How Contracts Work</h4>
            <ol className="text-sm text-oa-text-secondary space-y-2 list-decimal list-inside">
              <li><strong>Set your stakes</strong> - How much money you'll lose if you fail ($10-$500+)</li>
              <li><strong>Choose a referee</strong> - Someone who will verify your compliance</li>
              <li><strong>Pick an anti-charity</strong> - Money goes to a cause you oppose if you fail</li>
              <li><strong>Enable escalation</strong> - Stakes increase with repeated failures</li>
              <li><strong>Define failure conditions</strong> - What counts as breaking the contract</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Contract Types</h4>
            <div className="space-y-3 text-sm">
              <div className="border-l-2 border-oa-border pl-3">
                <p className="font-medium">Single Challenge Contract</p>
                <p className="text-xs text-oa-text-secondary">Stake money on completing one specific challenge</p>
              </div>
              <div className="border-l-2 border-oa-border pl-3">
                <p className="font-medium">Streak Contract</p>
                <p className="text-xs text-oa-text-secondary">Maintain a daily streak or lose money</p>
              </div>
              <div className="border-l-2 border-oa-border pl-3">
                <p className="font-medium">Weekly Goal Contract</p>
                <p className="text-xs text-oa-text-secondary">Complete N tasks per week or pay up</p>
              </div>
            </div>
          </div>

          <div className="bg-oa-bg-secondary border border-oa-border p-4">
            <p className="text-xs font-semibold mb-2">⚠️ Important Notes</p>
            <ul className="text-xs text-oa-text-secondary space-y-1">
              <li>• Contracts are self-enforced (honor system with referee verification)</li>
              <li>• Use an amount that's meaningful but not financially harmful</li>
              <li>• Choose a referee who will actually hold you accountable</li>
              <li>• Anti-charities should be causes you genuinely oppose</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'insights',
      title: 'Insights & Analytics',
      icon: '📊',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Track Your Progress</h3>
            <p className="text-sm text-oa-text-secondary leading-relaxed mb-4">
              Insights give you a comprehensive view of your accountability journey.
              See patterns, celebrate wins, and identify areas for improvement.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">What You'll See in Insights</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="border border-oa-border p-3">
                <p className="font-medium mb-1">Total Check-ins</p>
                <p className="text-xs text-oa-text-secondary">How many days you've logged</p>
              </div>
              <div className="border border-oa-border p-3">
                <p className="font-medium mb-1">Active Challenges</p>
                <p className="text-xs text-oa-text-secondary">Currently in-progress goals</p>
              </div>
              <div className="border border-oa-border p-3">
                <p className="font-medium mb-1">Completion Rate</p>
                <p className="text-xs text-oa-text-secondary">% of tasks completed on time</p>
              </div>
              <div className="border border-oa-border p-3">
                <p className="font-medium mb-1">Best Streak</p>
                <p className="text-xs text-oa-text-secondary">Longest consecutive days</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Activity Timeline</h4>
            <p className="text-sm text-oa-text-secondary mb-2">
              View your recent check-ins chronologically:
            </p>
            <ul className="text-sm text-oa-text-secondary space-y-1">
              <li>• Date and mood rating</li>
              <li>• Completion status</li>
              <li>• Key wins from that day</li>
              <li>• Commitment made for next day</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Challenge Progress</h4>
            <p className="text-sm text-oa-text-secondary">
              Each challenge shows:
            </p>
            <ul className="text-sm text-oa-text-secondary space-y-1">
              <li>• Current vs best streak</li>
              <li>• Overall progress percentage</li>
              <li>• Status (active, completed, paused)</li>
              <li>• Milestone achievements</li>
            </ul>
          </div>

          <div className="bg-oa-bg-secondary border border-oa-border p-4">
            <p className="text-xs text-oa-text-secondary">
              <strong>Accessing Insights:</strong> Click on any agent in the left sidebar,
              then navigate to the Insights tab. Each agent has its own separate insights page.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'chat',
      title: 'Chat & AI Assistance',
      icon: '💬',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Chatting with Your Agent</h3>
            <p className="text-sm text-oa-text-secondary leading-relaxed mb-4">
              The center panel is your conversation space. Chat with your accountability agent
              for guidance, planning, motivation, and support.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">What You Can Ask</h4>
            <div className="space-y-2 text-sm text-oa-text-secondary">
              <div className="border-l-2 border-oa-border pl-3">
                <p className="font-medium text-oa-text-primary">Planning & Strategy</p>
                <p className="text-xs">"Help me plan my week" or "What should I prioritize?"</p>
              </div>
              <div className="border-l-2 border-oa-border pl-3">
                <p className="font-medium text-oa-text-primary">Scheduling</p>
                <p className="text-xs">"Reschedule my workout to tomorrow" or "Block 2 hours for deep work"</p>
              </div>
              <div className="border-l-2 border-oa-border pl-3">
                <p className="font-medium text-oa-text-primary">Motivation</p>
                <p className="text-xs">"I'm feeling stuck" or "Celebrate my 7-day streak!"</p>
              </div>
              <div className="border-l-2 border-oa-border pl-3">
                <p className="font-medium text-oa-text-primary">Analysis</p>
                <p className="text-xs">"Why do I always miss Monday workouts?" or "Show me my patterns"</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Streaming Responses</h4>
            <p className="text-sm text-oa-text-secondary mb-2">
              Messages stream in real-time for a natural conversation feel.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Chat History</h4>
            <p className="text-sm text-oa-text-secondary mb-2">
              All conversations are saved to markdown files:
            </p>
            <code className="block bg-oa-bg-secondary border border-oa-border p-3 text-xs">
              data/chats/YYYY-MM-DD/agent-name.md
            </code>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Agent-Specific vs Unified Chat</h4>
            <p className="text-sm text-oa-text-secondary">
              Each agent has its own chat history and context. Switch agents from the left
              sidebar to chat with different personalities and capabilities.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'file-structure',
      title: 'File Structure',
      icon: '📁',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Understanding Your Data</h3>
            <p className="text-sm text-oa-text-secondary leading-relaxed mb-4">
              Everything is stored in <code className="px-2 py-1 bg-oa-bg-secondary">data/</code>.
              All files are human-readable (markdown/JSON). You can edit, backup, or version control them.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Complete Directory Structure</h4>
            <pre className="bg-oa-bg-secondary border border-oa-border p-4 text-xs overflow-x-auto leading-relaxed">
{`data/
├── .registry/              # System metadata
│   └── challenges.json     # All challenges with streaks
│
├── agents/                 # Agent configurations
│   └── accountability-coach/
│       ├── agent.json      # Agent config
│       ├── context/        # Agent knowledge base
│       ├── outputs/        # Generated summaries
│       └── resources/      # Images, videos, files
│
├── chats/                  # Conversation history
│   └── YYYY-MM-DD/
│       ├── agent-name.md
│       └── index.json      # Message index
│
├── checkins/               # Daily check-in logs
│   └── YYYY-MM-DD.md
│
├── challenges/             # Challenge data
│   └── challenge-id/
│       ├── challenge.json  # Challenge config
│       ├── challenge-log.md
│       └── milestones.json
│
├── contracts/              # Commitment contracts
│   └── contract-id.json
│
├── profile/                # User settings
│   ├── profile.md
│   ├── preferences.md
│   └── motivation-triggers.md
│
├── schedule/               # Calendar & planning
│   ├── calendar.json
│   └── todos.json
│
└── assets/                 # User uploads
    ├── vision-boards/
    ├── images/
    └── videos/`}
            </pre>
          </div>

          <div className="bg-oa-bg-secondary border border-oa-border p-4">
            <p className="text-xs font-semibold mb-2">💡 Pro Tips</p>
            <ul className="text-xs text-oa-text-secondary space-y-1">
              <li>• Backup this directory regularly (it's your entire accountability system)</li>
              <li>• Use git to version control your progress</li>
              <li>• Edit markdown files directly for quick updates</li>
              <li>• Sync across devices using Dropbox/iCloud (symlink the directory)</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'installation',
      title: 'Installation & Setup',
      icon: '⚙️',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Setting Up OpenAnalyst</h3>
            <p className="text-sm text-oa-text-secondary leading-relaxed mb-4">
              Complete guide to installing and running the accountability coach system.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">1. Clone the Repository</h4>
            <code className="block bg-oa-bg-secondary border border-oa-border p-3 text-xs mb-2">
              git clone https://github.com/yourusername/openanalyst.git
            </code>
            <code className="block bg-oa-bg-secondary border border-oa-border p-3 text-xs">
              cd openanalyst/ui
            </code>
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. Install Dependencies</h4>
            <code className="block bg-oa-bg-secondary border border-oa-border p-3 text-xs">
              npm install
            </code>
          </div>

          <div>
            <h4 className="font-semibold mb-2">3. Configure API Keys</h4>
            <p className="text-sm text-oa-text-secondary mb-2">Create a <code className="px-1 bg-oa-bg-secondary">.env</code> file:</p>
            <pre className="bg-oa-bg-secondary border border-oa-border p-4 text-xs">
{`ANTHROPIC_API_KEY=your_claude_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-pro
OPENANALYST_DIR=data  # Optional, defaults to data/`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">4. Run Development Server</h4>
            <code className="block bg-oa-bg-secondary border border-oa-border p-3 text-xs mb-2">
              npm run dev
            </code>
            <p className="text-xs text-oa-text-secondary">
              Open <a href="http://localhost:3000" className="underline">http://localhost:3000</a> in your browser
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">5. Run Claude Code (for AI features)</h4>
            <code className="block bg-oa-bg-secondary border border-oa-border p-3 text-xs mb-2">
              npx @anthropic-ai/sdk claude-code
            </code>
            <p className="text-xs text-oa-text-secondary">
              This enables the chat AI, intelligent rescheduling, and agent summaries
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Getting API Keys</h4>
            <div className="space-y-2 text-sm">
              <div className="border-l-2 border-oa-border pl-3">
                <p className="font-medium">Claude API (Anthropic)</p>
                <p className="text-xs text-oa-text-secondary">
                  Visit <a href="https://console.anthropic.com" className="underline">console.anthropic.com</a> → API Keys → Create Key
                </p>
              </div>
              <div className="border-l-2 border-oa-border pl-3">
                <p className="font-medium">Gemini API (Google)</p>
                <p className="text-xs text-oa-text-secondary">
                  Visit <a href="https://makersuite.google.com/app/apikey" className="underline">makersuite.google.com</a> → Create API Key
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const activeContent = sections.find((s) => s.id === activeSection)

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-title font-semibold mb-2">Help & Documentation</h1>
          <p className="text-sm text-oa-text-secondary">
            Everything you need to know about using OpenAnalyst Accountability Coach
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Left: Section Navigation */}
          <div className="col-span-1 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 border transition-colors ${
                  activeSection === section.id
                    ? 'border-oa-text-primary bg-oa-bg-secondary'
                    : 'border-oa-border hover:bg-oa-bg-secondary'
                }`}
              >
                <div className="text-lg mb-1">{section.icon}</div>
                <div className="text-xs font-medium">{section.title}</div>
              </button>
            ))}
          </div>

          {/* Right: Section Content */}
          <div className="col-span-3">
            <Card className="p-6">
              {activeContent?.content}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
