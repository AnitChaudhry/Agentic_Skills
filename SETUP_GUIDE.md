# OpenAnalyst Accountability Coach - Complete Setup Guide

This guide covers everything you need to get started with your AI-powered accountability system.

## What's Been Implemented

### ✅ Complete Features

1. **Check-in System**
   - Floating check-in button accessible from everywhere
   - 4-step flow: mood → completion → wins/blockers → tomorrow's commitment
   - Auto-updates streaks and challenge logs
   - Saves to `~/.openanalyst/checkins/YYYY-MM-DD.md`

2. **Progression Tracker**
   - Individual stat cards per agent
   - Streak tracking with current vs best
   - Progress percentage for each challenge
   - Visual progress bars

3. **Insights Page**
   - Detailed history per agent
   - Total check-ins and completion rate
   - Activity timeline with mood ratings
   - Challenge progress cards
   - Access via `/agent/[id]/insights`

4. **Email Reminders**
   - Cross-platform email via mailto: links
   - Includes progression tracking
   - API: `/api/reminders/send`

5. **User Profile Settings**
   - Edit name, email, timezone
   - Accountability style preferences
   - Productive time settings
   - Daily hours configuration
   - Access via Settings in left sidebar

6. **Claude Code Chat Streaming**
   - Real-time streaming responses (like ChatGPT)
   - Agent-specific personalities
   - Conversation history per agent
   - Powered by Claude Sonnet 4.5
   - API: `/api/chat/stream`

7. **Comprehensive Help System**
   - Built-in documentation accessible from UI
   - 9 detailed guide sections:
     - Getting Started
     - Understanding Agents
     - Daily Check-ins
     - Schedule & Rescheduling
     - Commitment Contracts
     - Insights & Analytics
     - Chat & AI Assistance
     - File Structure
     - Installation & Setup
   - Access via Help & Docs in left sidebar

8. **Setup Automation**
   - `setup.sh` for macOS/Linux
   - `setup.ps1` for Windows PowerShell
   - Automatic dependency installation
   - API key configuration prompts
   - Directory structure creation
   - Default agent setup

## Installation Instructions

### Option 1: Automated Setup (Recommended)

**macOS/Linux:**
```bash
git clone https://github.com/yourusername/openanalyst.git
cd "OpenAnalyst Accountability coach"
chmod +x setup.sh
./setup.sh
```

**Windows PowerShell:**
```powershell
git clone https://github.com/yourusername/openanalyst.git
cd "OpenAnalyst Accountability coach"
.\setup.ps1
```

### Option 2: Manual Setup

1. **Install Node.js 18+**
   - Download from https://nodejs.org
   - Verify: `node -v` should show v18 or higher

2. **Navigate to UI directory**
   ```bash
   cd "OpenAnalyst Accountability coach/ui"
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Create .env file**

   Create a file named `.env` in the `ui/` directory with:
   ```env
   ANTHROPIC_API_KEY=your_claude_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-1.5-pro
   ```

5. **Get API Keys**

   **Anthropic (Claude) API Key:**
   - Visit https://console.anthropic.com
   - Sign up or log in
   - Go to API Keys section
   - Create a new key
   - Copy and paste into `.env`

   **Gemini API Key (for vision features):**
   - Visit https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Create API key
   - Copy and paste into `.env`

6. **Create directory structure**

   **macOS/Linux:**
   ```bash
   mkdir -p ~/.openanalyst/{.registry,agents,chats,checkins,challenges,contracts,profile,schedule,assets}
   mkdir -p ~/.openanalyst/agents/accountability-coach/{context,outputs,resources}
   mkdir -p ~/.openanalyst/assets/{vision-boards,images,videos}
   ```

   **Windows PowerShell:**
   ```powershell
   $dir = "$env:USERPROFILE\.openanalyst"
   New-Item -ItemType Directory -Force -Path "$dir\.registry"
   New-Item -ItemType Directory -Force -Path "$dir\agents\accountability-coach\context"
   New-Item -ItemType Directory -Force -Path "$dir\agents\accountability-coach\outputs"
   New-Item -ItemType Directory -Force -Path "$dir\agents\accountability-coach\resources"
   New-Item -ItemType Directory -Force -Path "$dir\chats"
   New-Item -ItemType Directory -Force -Path "$dir\checkins"
   New-Item -ItemType Directory -Force -Path "$dir\challenges"
   New-Item -ItemType Directory -Force -Path "$dir\contracts"
   New-Item -ItemType Directory -Force -Path "$dir\profile"
   New-Item -ItemType Directory -Force -Path "$dir\schedule"
   New-Item -ItemType Directory -Force -Path "$dir\assets\vision-boards"
   New-Item -ItemType Directory -Force -Path "$dir\assets\images"
   New-Item -ItemType Directory -Force -Path "$dir\assets\videos"
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Open in browser**

   Navigate to http://localhost:3000

9. **(Optional) Run Claude Code for AI features**

   In a separate terminal:
   ```bash
   npx @anthropic-ai/sdk claude-code
   ```

## First-Time User Flow

1. **Onboarding**
   - When you first open the app, you'll see the onboarding flow
   - Answer 7 questions about your goals and preferences
   - This creates your profile in `~/.openanalyst/profile/`

2. **Create Your First Challenge**
   - Click on "Streaks" in the left sidebar
   - Click "Create Challenge" or use `/streak-new` command
   - Follow the guided setup

3. **Daily Check-ins**
   - Click the floating checkmark button (bottom-right corner)
   - Rate your mood (1-5)
   - Mark task completion
   - Record wins and blockers
   - Commit to tomorrow's task

4. **Chat with Your Agent**
   - Click on "Accountability Coach" in the left sidebar
   - Type your message in the chat input
   - Get real-time streaming responses

5. **Set Up Commitment Contracts (Optional)**
   - Navigate to "Contracts" in the left sidebar
   - Fill in the contract form:
     - Challenge name
     - Financial stakes
     - Referee name and email
     - Anti-charity (cause you oppose)
     - Enable escalating stakes

6. **Review Insights**
   - Click on an agent in the left sidebar
   - Navigate to the Insights tab
   - See your stats, streaks, and progress

## Understanding the UI

### Left Sidebar
- **Agents**: List of all accountability agents
- **Navigate**: Quick links to key sections
  - Schedule
  - Todos
  - Contracts
  - Chat History
  - Assets
  - Help & Docs
  - Settings
- **Streaks**: Overview of active challenges with progress bars

### Center Panel
- **Chat Interface**: Conversation with selected agent
- **Agent Context**: Shows which agent you're chatting with
- **Streaming Responses**: Real-time text generation

### Right Panel
- **Highlights**: Key information and quick actions
- **Context**: Relevant data for current view

### Floating Button
- **Check-in Button**: Always accessible in bottom-right corner
- Click to open 4-step check-in modal

## File Structure

All your data is stored in `~/.openanalyst/` (or `C:\Users\YourName\.openanalyst` on Windows):

```
~/.openanalyst/
├── .registry/
│   └── challenges.json         # Challenge registry with streaks
├── agents/
│   └── accountability-coach/
│       ├── agent.json          # Agent configuration
│       ├── context/            # Agent knowledge base
│       ├── outputs/            # AI-generated summaries
│       └── resources/          # Images, videos, files
├── chats/
│   └── YYYY-MM-DD/
│       ├── agent-name.md       # Chat transcript
│       └── index.json          # Message index
├── checkins/
│   └── YYYY-MM-DD.md          # Daily check-in logs
├── challenges/
│   └── challenge-id/
│       ├── challenge.json      # Challenge configuration
│       ├── challenge-log.md    # Progress log
│       └── milestones.json     # Milestone tracking
├── contracts/
│   └── contract-id.json        # Commitment contracts
├── profile/
│   ├── profile.md              # User information
│   ├── preferences.md          # Settings and preferences
│   └── motivation-triggers.md  # What motivates you
├── schedule/
│   ├── calendar.json           # Your schedule
│   └── todos.json              # Todo list
└── assets/
    ├── vision-boards/          # Vision board images
    ├── images/                 # User-uploaded images
    └── videos/                 # User-uploaded videos
```

## Troubleshooting

### Issue: Port 3000 already in use

**Solution:**
```bash
# Kill the process using port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Or run on a different port:
```bash
npm run dev -- -p 3001
```

### Issue: API keys not working

**Check:**
1. `.env` file is in the `ui/` directory (not root)
2. No spaces around the `=` sign
3. No quotes around the API keys
4. Restart the dev server after adding keys

### Issue: Directory not found errors

**Solution:**
Run the setup script or manually create the directory structure (see step 6 above)

### Issue: Chat not streaming

**Check:**
1. Anthropic API key is valid
2. Run `npm install` to ensure `@anthropic-ai/sdk` is installed
3. Check browser console for errors
4. Ensure you have sufficient API credits

### Issue: Check-in button not appearing

**Solution:**
- The button only appears when you're logged in (after onboarding)
- Check browser console for errors
- Try refreshing the page

## Advanced Configuration

### Custom OpenAnalyst Directory

Set a custom directory in your `.env` file:
```env
OPENANALYST_DIR=/custom/path/to/data
```

### Custom Agent Personalities

Edit `~/.openanalyst/agents/accountability-coach/agent.json` to customize:
- Agent name and description
- Capabilities
- Quick actions
- Custom prompts

### Adding New Agents

1. Create directory: `~/.openanalyst/agents/your-agent-name/`
2. Create `agent.json` with configuration
3. Restart the app
4. New agent will appear in left sidebar

Example `agent.json`:
```json
{
  "id": "fitness-coach",
  "name": "Fitness Coach",
  "description": "Specialized in workout tracking and nutrition",
  "capabilities": ["workout-tracking", "nutrition-advice"],
  "quickActions": [
    {
      "id": "log-workout",
      "label": "Log Workout",
      "icon": "💪",
      "description": "Record your workout session"
    }
  ]
}
```

## Next Steps

1. **Explore Help & Docs** - Click "Help & Docs" in the left sidebar for detailed guides
2. **Set Up Your First Contract** - Add financial stakes for extra accountability
3. **Schedule Your Week** - Use the Schedule section to plan your tasks
4. **Chat with Your Agent** - Ask questions, get advice, plan your goals
5. **Check In Daily** - Build the habit of daily reflection

## Support

- **In-App Help**: Click "Help & Docs" in the left sidebar
- **File Issues**: Check the GitHub repository for issue tracker
- **Community**: Join discussions on GitHub Discussions

## Tips for Success

1. **Check in at the same time every day** - Build consistency
2. **Be honest about blockers** - Your agent can only help if you're transparent
3. **Set meaningful stakes** - Commitment contracts work best with real consequences
4. **Review insights weekly** - Identify patterns and adjust your approach
5. **Chat with your agent** - Don't just track, engage in conversations about your goals

---

**Built with Claude Code and Claude Sonnet 4.5**

Enjoy your accountability journey! 🚀
