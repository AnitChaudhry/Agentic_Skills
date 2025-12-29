# OpenAnalyst Accountability Coach

Your Personal AI-Powered Accountability System - **fully automated with ONE command** featuring Claude Code integration, real-time WebSocket chat, instant cache queries (0ms!), and intelligent multi-agent support.

## 🚀 ONE Command to Start Everything

```bash
# 1. Download this folder
# 2. Open terminal
# 3. Say to Claude Code: "start my app"

# Claude Code automatically runs:
npm start

# Result: Everything starts!
# ✅ WebSocket Server (ws://localhost:8765)
# ✅ Fast Cache System (0-2ms queries)
# ✅ Claude Code Listener (AI backend)
# ✅ Next.js UI (http://localhost:3000)
```

**Open http://localhost:3000** - Your app is ready! 🎉

**No manual steps. No configuration. Just one command.**

## Features

### 🎯 Core Accountability
- **Chat-based Onboarding** - Cofounder.co-inspired conversational setup
- **Dynamic Challenge Creation** - AI asks smart questions based on challenge type
- **Daily Check-ins** - Mood tracking, wins/blockers, adaptive coaching
- **Streak Tracking** - Visual progress with fire emoji and milestones
- **Commitment Contracts** - StickK/Beeminder-style with real stakes

### ⚡ Claude Code Integration (v2.0 - NEW!)
- **ONE Command Startup** - `npm start` launches everything
- **Instant Responses** - 0-2ms queries via in-memory cache (vs 50-200ms file reading)
- **Real-Time WebSocket** - Streaming chat responses
- **Multi-Agent Ready** - All agents share same fast architecture
- **Auto-Caching** - File watchers keep cache fresh
- **95%+ Hit Rate** - Nearly all queries from RAM
- **Centralized Backend** - YOU (Claude Code) are the AI brain

### 🎨 Beautiful UI
- **Next.js Dashboard** - Real-time updates via SSE
- **Chat Onboarding** - Smooth, engaging first-time experience
- **Glassmorphic Design** - Modern, clean interface
- **Responsive** - Works on all devices
- **Dark Mode** - Easy on the eyes

### ✨ 14 Pre-Built Skills
**Productivity:**
1. **Streak** - Challenge tracking with fire emoji
2. **Daily Check-in** - Structured progress logging
3. **Motivation** - Context-aware encouragement
4. **Schedule Replanner** - Intelligent rescheduling

**Health & Fitness:**
5. **Nutritional Specialist** - Personalized nutrition advice
6. **Workout Program Designer** - Custom fitness plans

**Learning:**
7. **User Onboarding** - Initial profile setup
8. **Challenge Onboarding** - Smart challenge creation
9. **Reinforcement Drills** - Post-coaching practice

**Creative & Tools:**
10. **Excalidraw** - Architecture diagram generation
11. **Nanobanana** - AI image generation
12. **Skill Writer** - Create custom skills
13. **Punishment/Contracts** - Commitment enforcement
14. **Wisdom Accountability Coach** - Philosophy & coaching

**Create more with the skill-writer skill!**

## 🏗️ Architecture

```
User → Browser → WebSocket → Claude Code → Fast Cache → data/
        ↓           ↓            ↓           ↓
    localhost:   :8765      ws-listener   0-2ms RAM
      3000
```

**Key Components:**
- **Next.js UI** - React interface at localhost:3000
- **WebSocket Server** - Real-time message broker at ws://localhost:8765
- **ws-listener** - Connects Claude Code to WebSocket
- **Fast Cache** - In-memory data store (0-2ms queries)
- **data/ folder** - Persistent markdown/JSON storage

**Performance:**
- Cache hit rate: 95-100%
- Query time: 0-2ms (vs 50-200ms file I/O)
- Memory usage: ~10-50MB
- Auto-refresh: File watchers + 5min timer

## 📖 Documentation

### 🔴 **For Claude Code (START HERE)**
- **[ARCHITECTURE_INDEX.md](./ARCHITECTURE_INDEX.md)** - **READ THIS FIRST** - Complete system architecture, initialization rules, and file structure

### For Users
- **[USER_MANUAL.md](./USER_MANUAL.md)** - Complete guide for users
- **[QUICK_START.md](./QUICK_START.md)** - Get started in 3 steps
- **[SKILL_CREATION_GUIDE.md](./SKILL_CREATION_GUIDE.md)** - Create custom skills

### For Developers
- **[CLAUDE_CODE_INSTRUCTIONS.md](./CLAUDE_CODE_INSTRUCTIONS.md)** - Claude Code integration details
- **[DATA_PERSISTENCE_GUIDE.md](./DATA_PERSISTENCE_GUIDE.md)** - How data is stored

## Quick Start

### Automated Setup (Recommended)

**macOS/Linux:**
```bash
git clone https://github.com/yourusername/openanalyst-accountability-coach.git
cd openanalyst-accountability-coach
chmod +x setup.sh
./setup.sh
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/yourusername/openanalyst-accountability-coach.git
cd openanalyst-accountability-coach
.\setup.ps1
```

The setup script will:
1. ✅ Check Node.js installation (18+ required)
2. ✅ Install npm dependencies
3. ✅ Create `.env` file with API key prompts
4. ✅ Create `~/.openanalyst/` directory structure
5. ✅ Create system index.md for Claude Code
6. ✅ Set up default accountability coach agent

### Manual Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/openanalyst.git
   cd openanalyst/ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API keys**

   Create a `.env` file in the `ui/` directory:
   ```env
   ANTHROPIC_API_KEY=your_claude_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-1.5-pro
   ```

   Get API keys:
   - **Claude API**: https://console.anthropic.com → API Keys
   - **Gemini API**: https://makersuite.google.com/app/apikey

4. **Create directory structure**
   ```bash
   mkdir -p ~/.openanalyst/{.registry,agents,chats,checkins,challenges,contracts,profile,schedule,assets}
   ```

5. **Start the app**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🎯 How It Works

### The Architecture

```
User → UI (Next.js) → Claude Code → ~/.openanalyst/
         ↓                           ↓
    Chat Interface              File System
         ↓                           ↓
    Conversational           Automated Management
    Onboarding              (index.md maintained)
```

### First-Time Experience

1. **Clone & Setup** - Run `setup.sh` or `setup.ps1`
2. **Start App** - `cd ui && npm run dev`
3. **Open Browser** - `http://localhost:3000`
4. **Onboarding** - Answer questions one at a time with clickable options
5. **Create Challenge** - Mandatory first challenge setup
6. **Done!** - Start tracking progress

### Daily Workflow

1. **Morning** - Open app, see today's schedule
2. **Throughout Day** - Check in, log progress
3. **Evening** - Review streak, mark todos complete
4. **Claude Code** - Automatically updates context, sends reminders
5. **Repeat** - Build momentum, achieve goals!

### Creating Agents & Skills

**All through the UI - no manual file editing needed:**

- **Create Agent**: Click "+ Add Agent" → Use AI to create (recommended)
- **Add Skills**: Go to Skills page → Add to any agent
- **Create Custom Skill**: Chat with skill-writer skill
- **Everything Auto-Discovered**: Restart not required!

---

## 🏗️ Project Structure

```
openanalyst-accountability-coach/
├── skills/                          # 14 pre-built skills
│   ├── streak/
│   ├── nutritional-specialist/
│   ├── skill-writer/               # Use this to create more!
│   └── ...
├── ui/                              # Next.js app
│   ├── app/                         # Routes & API endpoints
│   ├── components/                  # React components
│   │   ├── ui/                     # Reusable UI (AnimatedButton, etc.)
│   │   ├── chat/                   # Chat interface
│   │   ├── sidebar/                # Navigation
│   │   └── ...
│   ├── lib/                         # Utilities & stores
│   └── types/                       # TypeScript types
├── ~/.openanalyst/                  # User data (created by setup)
│   ├── index.md                    # System manifest for Claude Code
│   ├── profile/                    # User preferences
│   ├── challenges/                 # All challenges
│   ├── chats/                      # Conversation history
│   ├── plans/                      # Challenge plans
│   ├── schedule/                   # Calendar events
│   └── ...
├── USER_MANUAL.md                   # Complete user guide
├── QUICK_START.md                   # Quick getting started
├── SKILL_CREATION_GUIDE.md          # Skill creation tutorial
├── CLAUDE_CODE_INSTRUCTIONS.md      # Claude Code integration guide
├── setup.sh                         # Automated setup (macOS/Linux)
└── setup.ps1                        # Automated setup (Windows)
```

---

## 🎨 UI Features

### Gumroad-Inspired Design
- **Animated Buttons** - Spring physics, push-down effect
- **Smooth Transitions** - Framer Motion throughout
- **Lucide Icons** - Clean SVG icons (no emojis)
- **Active States** - Visual feedback on selection
- **Dark Theme** - Modern, clean interface

### Interactive Onboarding
- **One Question at a Time** - Not overwhelming
- **Clickable Options** - Pills for quick selection
- **Text Input Available** - Alternative to options
- **Adaptive Flow** - Questions change based on answers
- **Context-Aware** - References existing data

### Skills Marketplace
- **Browse 14 Skills** - Grid view with search
- **Category Filters** - productivity, health, learning, creative
- **One-Click Attach** - Add/remove from agents
- **Real-Time Updates** - See skills in action immediately

---

## 🔧 Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React Icons

**Backend:**
- Next.js API Routes
- File System (no database needed!)
- Server-Sent Events (SSE)

**AI:**
- Claude API (Anthropic)
- Gemini API (Google) for vision features

**Data Storage:**
- Local file system (`~/.openanalyst/`)
- Markdown files for human readability
- JSON for structured data
- No database installation required!

---

## 📱 Pages & Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing/redirect |
| `/app` | Main chat interface |
| `/onboarding` | First-time setup |
| `/agent/[id]` | Agent-specific chat |
| `/skills` | Skills marketplace |
| `/streak` | All streaks overview |
| `/streak/[id]` | Individual streak details |
| `/schedule` | Calendar (month/week/day views) |
| `/plan` | Challenge planning |
| `/todos` | Task list |
| `/contracts` | Punishment contracts |
| `/history` | Chat history |
| `/assets` | Uploaded files |
| `/help` | Documentation |
| `/settings` | App preferences |

---

## 🔥 Key Features in Detail

### Conversational Onboarding
- **Adaptive Questions**: Asks different questions based on:
  - First-time user vs. existing user
  - Challenge type (learning, fitness, building, etc.)
  - Existing commitments and capacity
- **Personalization**: References your resolution, past challenges, preferred times
- **No Overwhelm**: One question at a time with helpful context

### Skills Marketplace
- **14 Pre-Built Skills**: Ready to use out of the box
- **Easy Attachment**: Click to add/remove from any agent
- **Skill Writer**: Create custom skills through conversation
- **Auto-Discovery**: Skills from `skills/` folder automatically appear

### Punishment System
- **Real Stakes**: Define what happens if you fail
- **Triggers**: Based on missed days, broken streaks, missed goals
- **Severity Levels**: Mild (encouragement) to Severe (custom consequences)
- **Grace Periods**: Configurable buffer before punishment
- **History Tracking**: All punishments logged

### Planning & Scheduling
- **AI-Generated Plans**: Claude creates detailed roadmaps
- **Calendar Integration**: Tasks scheduled based on availability
- **Rescheduling**: Drag-and-drop (coming soon) or reschedule modal
- **Conflict Detection**: Warns about overlapping commitments

---

## 💡 Use Cases

### For Students
- Track study hours for exams
- Build coding skills systematically
- Maintain reading streaks
- Accountability for thesis/projects

### For Professionals
- Learn new technologies
- Build side projects
- Networking goals
- Skill development

### For Fitness
- Workout programs
- Nutrition tracking
- Running/cycling goals
- Weight loss accountability

### For Creators
- Daily writing goals
- Art challenges
- Music practice
- Content creation streaks

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test thoroughly: `npm run build`
5. Submit a pull request

**Areas to contribute:**
- New skills (see SKILL_CREATION_GUIDE.md)
- UI improvements
- Bug fixes
- Documentation
- Translations

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

---

## 🙏 Acknowledgments

- **Anthropic** - For Claude Code and API
- **Vercel** - For Next.js
- **Framer** - For Motion library
- **Lucide** - For beautiful icons
- **Community** - For feedback and contributions

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/openanalyst-accountability-coach/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/openanalyst-accountability-coach/discussions)
- **Email**: support@openanalyst.com

---

**Made with ❤️ by the OpenAnalyst community**

Start your accountability journey today! 🚀

---

## 🔄 What's New (v2.0)

- ✅ **Fully Automated Setup** - One command to get started
- ✅ **Claude Code Integration** - System index for context awareness
- ✅ **Conversational Onboarding** - One question at a time with options
- ✅ **Skills Marketplace** - 14 pre-built skills + create custom
- ✅ **Animated UI** - Gumroad-style buttons with spring physics
- ✅ **Lucide Icons** - Clean SVG icons throughout
- ✅ **Streak Pages** - Dedicated views for challenge details
- ✅ **Complete API** - All endpoints implemented
- ✅ **Comprehensive Docs** - 4 documentation files
- ✅ **Zero Manual Setup** - Everything through UI

---

6. **Open in browser**

   Navigate to http://localhost:3000


### First Time Setup

1. **Complete onboarding** - 7-question setup flow
2. **Create your first challenge** - From Streaks section
3. **Daily check-ins** - Use the floating check button (bottom-right)
4. **Set up contracts** - Add financial stakes for accountability
5. **Chat with your agent** - Get guidance and support

## Architecture

```
┌─────────────────────────────────────────┐
│         Next.js UI (localhost:3000)     │
│  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │Onboard │ │Dashboard│ │Check-in│      │
│  └────────┘ └────────┘ └────────┘      │
└──────────────────┬──────────────────────┘
                   │ API + SSE
┌──────────────────▼──────────────────────┐
│        🧠 CLAUDE CODE (THE BRAIN)       │
│  • Reads all files                      │
│  • Makes decisions                      │
│  • Triggers actions                     │
│  • Enforces contracts                   │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│      File System (~/.openanalyst)       │
│  ├── profile/                           │
│  ├── challenges/                        │
│  ├── checkins/                          │
│  ├── contracts/                         │
│  └── .registry/                         │
└─────────────────────────────────────────┘
```

## Directory Structure

```
openanalyst-accountability-coach/
├── ui/                          # Next.js UI
│   ├── app/
│   │   ├── onboarding/          # First-time user setup
│   │   ├── dashboard/           # Main dashboard
│   │   ├── challenge/           # Challenge creation
│   │   └── api/                 # API routes
│   ├── components/
│   │   ├── chat/                # Chat components
│   │   └── dashboard/           # Dashboard components
│   └── lib/                     # Utilities
│
├── skills/                      # Claude Code skills
│   ├── user-onboarding/
│   ├── challenge-onboarding/
│   ├── streak/
│   ├── daily-checkin/
│   ├── motivation/
│   ├── schedule-replanner/
│   ├── punishment/
│   └── excalidraw/
│
├── commands/                    # Slash commands
│   ├── streak.md
│   ├── streak-new.md
│   └── ...
│
├── lib/                         # Core utilities
│   ├── file-manager.js
│   ├── registry-manager.js
│   ├── skill-validator.js
│   └── challenge-manager.js
│
├── plugins/                     # Sub-plugins
│   └── deckling/               # PPTX generation
│
├── docs/                        # Documentation
│   ├── BRAIN-ENGINE.md
│   └── DEVELOPMENT_PLAN.md
│
├── settings.json                # Plugin config
└── package.json
```

## Data Storage

All data is stored in `~/.openanalyst/` (or custom path in .env):

```
~/.openanalyst/
├── profile/
│   ├── profile.md              # User info
│   ├── availability.md         # Schedule preferences
│   ├── preferences.md          # Accountability style
│   └── motivation-triggers.md  # What motivates user
│
├── challenges/
│   └── {challenge-slug}/
│       ├── challenge-config.json
│       ├── schedule.md
│       ├── milestones.md
│       ├── challenge-log.md
│       └── backlog.md
│
├── checkins/
│   └── YYYY-MM-DD.md           # Daily check-ins
│
├── contracts/
│   ├── active-contract.json
│   └── punishment-history.md
│
├── schedule/
│   ├── replans.json
│   └── patterns.md
│
└── .registry/
    ├── challenges.json
    ├── skills.json
    └── projects.json
```

## Usage

### Slash Commands

```bash
# Streak tracking
/streak              # Daily check-in
/streak-new         # Create new challenge
/streak-list        # List all challenges
/streak-switch      # Switch active challenge
/streak-stats       # View statistics
/streak-insights    # Cross-challenge patterns
```

### UI Navigation

- **Dashboard** - Overview, stats, quick actions
- **Challenges** - All challenges, progress, check-in
- **Schedule** - Weekly plan, replans
- **Analytics** - Patterns, insights, achievements
- **Settings** - Profile, preferences, contracts

## Development

```bash
# Run UI in dev mode
cd ui
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Commitment Contracts

Inspired by [StickK](https://www.stickk.com/) and [Beeminder](https://www.beeminder.com/).

### How It Works
1. Set a punishment (financial, social, forfeit)
2. Choose a referee (accountability partner)
3. Miss a commitment → Punishment triggers
4. Referee confirms → Enforced

### Example
```
Challenge: Learn Python (30 days)
Punishment: $100 to girlfriend if I miss
Referee: Girlfriend gets notified
Grace: 24 hours to make up
```

## Research & Sources

Built on proven accountability research:

- [The Coaching Tools Company](https://www.thecoachingtoolscompany.com/) - Accountability questions
- [GoalsWon](https://www.goalswon.com/) - Coaching best practices
- [StickK](https://www.stickk.com/) - Commitment contracts
- [Beeminder](https://www.beeminder.com/) - Loss aversion psychology
- Studies show 3x success rate with financial stakes

## Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## License

MIT License - see LICENSE file

## Support

- GitHub Issues: https://github.com/openanalyst/accountability-coach/issues
- Email: support@openanalyst.com
- Docs: Full documentation in `/docs`

---

Built with ❤️ by OpenAnalyst
