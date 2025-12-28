# OpenAnalyst Accountability Coach - User Manual

## Table of Contents
1. [Getting Started](#getting-started)
2. [Creating Your First Agent](#creating-your-first-agent)
3. [Managing Skills](#managing-skills)
4. [Creating Custom Skills](#creating-custom-skills)
5. [Setting Up Challenges](#setting-up-challenges)
6. [Understanding the UI](#understanding-the-ui)
7. [Advanced Features](#advanced-features)

---

## Getting Started

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/openanalyst-accountability-coach.git
   cd openanalyst-accountability-coach
   ```

2. **Install Dependencies**
   ```bash
   cd ui
   npm install
   ```

3. **Start the Application**
   ```bash
   npm run dev
   ```

4. **Access the App**
   - Open your browser and navigate to `http://localhost:3000`
   - The app will automatically start and guide you through first-time onboarding

### First-Time Setup

When you first open OpenAnalyst, you'll be guided through a conversational onboarding:

1. **Choose Your Accountability Style**
   - **Strict**: Tough love, no excuses accepted
   - **Balanced**: Firm but understanding
   - **Friendly**: Gentle encouragement and support

2. **Set Your New Year Resolution** (Optional)
   - This becomes your North Star for all future challenges
   - All goals you create should align with this resolution

3. **Create Your First Challenge** (Mandatory)
   - You must create at least one challenge to unlock the full UI
   - The agent will guide you through defining:
     - Goal and type (learning, fitness, building, etc.)
     - Time commitment (daily hours)
     - Schedule and availability
     - Punishment contract (what happens if you fail)

---

## Creating Your First Agent

### Understanding Agents

Agents are AI-powered coaches tailored to specific domains. Each agent:
- Has unique skills and capabilities
- Uses a specific tone/persona
- Tracks challenges and provides accountability
- Offers domain-specific guidance

### Step-by-Step Agent Creation

1. **Click "+ Add Agent"** in the left sidebar

2. **Fill in Agent Details**
   ```
   Name: e.g., "Fitness Coach", "Career Mentor", "Study Buddy"
   Icon: Choose an emoji or icon
   Description: What this agent helps you with
   Persona: Strict/Balanced/Friendly
   ```

3. **Assign Skills to Your Agent**
   - Go to the **Skills** page (sidebar navigation)
   - Browse the 14 available skills:
     - **Productivity**: streak, daily-checkin, motivation, schedule-replanner
     - **Health**: nutritional-specialist, workout-program-designer
     - **Learning**: skill-writer, reinforcement-drills
     - **Creative**: excalidraw, nanobanana-skill (image generation)
     - **Custom**: user-onboarding, challenge-onboarding, punishment, wisdom-accountability-coach
   - Click "Add to Agent" for each skill you want
   - Skills can be added/removed anytime from the agent's Capabilities panel

4. **Configure Quick Actions**
   - Define shortcuts for common tasks
   - Examples:
     - "Daily Check-in"
     - "Create New Challenge"
     - "Review Progress"
     - "Set Weekly Goals"

5. **Set Up Capabilities**
   - Enable/disable features like:
     - Vision Board
     - Scheduling
     - Streaks tracking
     - Punishment contracts

### Example: Creating a Fitness Coach

```
Name: Fitness Coach
Icon: 💪
Description: Helps you build healthy habits, track workouts, and stay accountable
Persona: Strict

Skills:
✓ workout-program-designer
✓ nutritional-specialist
✓ streak
✓ daily-checkin
✓ punishment

Quick Actions:
- Log Today's Workout
- Check Nutrition Plan
- View Progress

Capabilities:
✓ Vision Board
✓ Scheduling
✓ Streaks
✓ Punishments
```

---

## Managing Skills

### What Are Skills?

Skills are modular capabilities that agents can use. Each skill:
- Lives in the `skills/` directory
- Has a `SKILL.md` file describing its purpose
- Can be attached to multiple agents
- Provides specific functionality (e.g., meal planning, image generation)

### Viewing Available Skills

1. Click **Skills** in the sidebar navigation
2. Browse all 14 skills with:
   - **Search**: Filter by name or description
   - **Category Filter**: productivity, health, learning, creative, custom
   - **Attachment Status**: See which agents use each skill

### Attaching Skills to Agents

**Method 1: Skills Marketplace**
1. Go to Skills page
2. Select an agent from the sidebar
3. Click "Add to Agent" on any skill card
4. The skill is immediately available to that agent

**Method 2: Agent Capabilities Panel**
1. Select an agent from the sidebar
2. Scroll to the "Skills" section in the right panel
3. Click "Manage" → Opens Skills page
4. Add skills and they appear instantly in the agent's capabilities

### Removing Skills

1. Go to the agent's Capabilities panel
2. Hover over any skill
3. Click the **X** button that appears
4. Skill is removed from the agent (but still available in the marketplace)

---

## Creating Custom Skills

### Skill Structure

Every skill follows this structure:

```
skills/
└── your-skill-name/
    ├── SKILL.md          (Required: Skill description and instructions)
    ├── scripts/          (Optional: Python/Node scripts)
    │   └── script.py
    ├── templates/        (Optional: Templates for generated content)
    │   └── template.md
    └── reference.md      (Optional: Additional documentation)
```

### Using the Skill Writer

The easiest way to create a skill is using the built-in **skill-writer** skill:

1. **Attach skill-writer to an agent**
   - Go to Skills → Find "skill-writer"
   - Add to any agent

2. **Start a conversation**
   ```
   User: "Help me create a skill for tracking books I read"
   Agent: "Great! Let's create a reading tracker skill. What should it do?"
   User: "Track books, pages read, reading goals, and generate reading stats"
   Agent: [Guides you through creating the skill step-by-step]
   ```

3. **The skill-writer will**
   - Ask clarifying questions
   - Generate the SKILL.md file
   - Create any necessary scripts
   - Test the skill
   - Save it to `skills/your-skill-name/`

### Manual Skill Creation

If you prefer to create skills manually:

1. **Create the directory**
   ```bash
   mkdir skills/my-custom-skill
   cd skills/my-custom-skill
   ```

2. **Create SKILL.md**
   ```markdown
   # My Custom Skill

   Brief description of what this skill does.

   ## Purpose

   Detailed explanation of the skill's purpose and use cases.

   ## Usage

   How agents should use this skill:

   1. Step 1
   2. Step 2
   3. Step 3

   ## Examples

   ### Example 1: [Scenario]
   ```
   User: [User input]
   Agent: [Agent response using this skill]
   ```

   ## Integration

   - Works with: [other skills]
   - Data stored in: [location]
   - APIs used: [if any]
   ```

3. **Add Scripts (Optional)**
   ```python
   # skills/my-custom-skill/scripts/processor.py
   import json

   def process_data(input_data):
       # Your logic here
       return processed_data
   ```

4. **Test Your Skill**
   - Restart the app: `npm run dev`
   - Go to Skills page
   - Your skill should appear automatically
   - Add it to an agent and test it in a conversation

### Skill Best Practices

1. **Clear Purpose**: One skill = one responsibility
2. **Good Documentation**: Detailed SKILL.md with examples
3. **Error Handling**: Handle edge cases gracefully
4. **Data Storage**: Use `~/.openanalyst/` for persistent data
5. **Dependencies**: Document any required packages/APIs
6. **Testing**: Provide test scenarios in SKILL.md

### Example: Book Tracker Skill

```markdown
# Book Tracker

Track your reading progress, set reading goals, and analyze reading habits.

## Purpose

Helps users:
- Log books they're reading
- Track pages read daily
- Set reading goals (books per month, pages per day)
- Generate reading statistics and insights

## Usage

**Logging a book:**
```
User: "I started reading 'Atomic Habits' by James Clear, 320 pages"
Agent: "Great choice! I've added 'Atomic Habits' to your reading list.
        How many pages have you read so far?"
```

**Daily check-in:**
```
User: "I read 25 pages today"
Agent: "Nice work! You're on page 25/320 (7.8% complete).
        At this pace, you'll finish in 13 days."
```

## Data Storage

Books stored in: `~/.openanalyst/reading/books.json`
Reading logs: `~/.openanalyst/reading/logs/YYYY-MM-DD.json`

## Integration

- Pairs with: `daily-checkin`, `streak`, `motivation`
- Triggers: "reading", "book", "pages"
```

---

## Setting Up Challenges

### What Are Challenges?

Challenges are goal-tracking systems with:
- Clear objectives and deadlines
- Daily/weekly time commitments
- Progress tracking and streaks
- Punishment contracts for accountability

### Creating a Challenge

1. **Select an Agent** or go to the main chat

2. **Click "Create New Challenge"** or say:
   ```
   "I want to start a new challenge"
   ```

3. **Answer the Onboarding Questions**
   - **What challenge?** (e.g., "Learn Python for data science")
   - **Challenge type?** learning/building/fitness/habit/creative
   - **Deadline?** When do you want to achieve this?
   - **Daily hours?** How much time can you commit?
   - **Available slots?** When are you most productive?
   - **Punishment?** What happens if you fail?
   - **Grace period?** How many days before punishment triggers?

4. **Review Your Plan**
   The agent creates:
   - Weekly milestones
   - Daily schedule
   - Progress tracking
   - Punishment contract

5. **Sign the Contract**
   Type "I AGREE" to activate the challenge

### Challenge Types

**Learning Challenges**
- Goal: Master a new skill
- Metrics: Lessons completed, practice hours
- Example: "Complete Python course in 30 days"

**Building Challenges**
- Goal: Create something
- Metrics: Features completed, milestones hit
- Example: "Build and launch my app in 60 days"

**Fitness Challenges**
- Goal: Improve physical health
- Metrics: Workouts completed, weight lost
- Example: "Run 5k in under 30 minutes by March"

**Habit Challenges**
- Goal: Build a daily habit
- Metrics: Consecutive days
- Example: "Meditate every day for 90 days"

**Creative Challenges**
- Goal: Produce creative work
- Metrics: Pieces created, consistency
- Example: "Write 500 words daily for 30 days"

### Managing Active Challenges

**View All Challenges**
- Left sidebar shows active streaks
- Click any streak card to see details

**Daily Check-in**
- Click "Daily Check-in" quick action
- Or say "Check in" in chat
- Log your progress for the day

**View Progress**
- Go to `/streak/[challenge-id]`
- See streak count, progress %, milestones
- Review punishment status

**Pause/Resume**
- Click the challenge card
- Select "Pause" to temporarily stop
- Select "Resume" when ready

**Complete**
- When you finish, click "Mark Complete"
- Celebrate your achievement!
- Review what you learned

---

## Understanding the UI

### Sidebar Navigation

**Left Sidebar**
- **Agents**: All your accountability coaches
- **+ Add Agent**: Create new agents
- **Navigate**:
  - 📅 Schedule: View daily/weekly calendar
  - ✓ Todos: Task list (count badge shows pending)
  - ⚡ Skills: Skills marketplace
  - 📝 Contracts: Punishment contracts
  - 💬 Chat History: Past conversations
  - 🖼️ Assets: Uploaded files/images
  - ❓ Help & Docs: Documentation
  - ⚙️ Settings: App preferences
- **Streaks**: Active challenges (click to view details)

**Right Sidebar** (Agent Selected)
- **Skills**: Attached skills (add/remove)
- **Quick Actions**: One-click actions
- **Capabilities**: Special features (Vision Board, etc.)

### Main Content Area

**Chat Interface**
- Conversational UI with the selected agent
- Click option buttons or type responses
- Attach files/images as needed
- View typing indicator when agent is thinking

**Other Pages**
- **Schedule**: Calendar view (month/week/day)
- **Skills**: Marketplace grid with search/filters
- **Streak Details**: Progress charts, milestones, history

### Visual Indicators

**Streak Status**
- 🔥 **Days**: Current streak count
- 🏆 **Best**: Longest streak achieved
- 📊 **Progress**: Percentage complete

**Skill Categories**
- 🔵 **Productivity**: Blue badge
- 🟢 **Health**: Green badge
- 🟣 **Learning**: Purple badge
- 🌸 **Creative**: Pink badge
- ⚪ **Custom**: Gray badge

---

## Advanced Features

### Vision Board

Create visual representations of your goals:

1. Click "Create Vision Board" in agent capabilities
2. Describe your goal and vision
3. Agent generates images using nanobanana-skill
4. Organize images on your board
5. View daily for motivation

### Schedule Optimization

The `schedule-replanner` skill automatically:
- Detects conflicts in your schedule
- Suggests better time allocation
- Balances multiple challenges
- Adapts to your availability changes

### Punishment Contracts

**Setting Up Punishments**
```
Mild: Encouraging reminder
Moderate: Progress reset + shame message
Severe: Custom consequence (you define)
```

**Punishment Triggers**
- Missed X days in a row
- Streak broken
- Deadline missed
- Weekly goal not met

**Referees** (Optional)
- Assign someone to hold you accountable
- They receive notifications when you fail
- Can forgive or enforce punishment

### Contextual Onboarding

After your first challenge, the agent:
- Remembers your preferences
- References your existing challenges
- Suggests realistic time commitments
- Aligns new goals with your resolution
- Skips redundant questions

**Example:**
```
Agent: "I see you're already working on 'Learn Python' (1 hour/day).
        You have about 2 hours of capacity left per day.
        What new challenge would you like to add?"
```

### Data Export

All your data is stored in `~/.openanalyst/`:
```
~/.openanalyst/
├── profile/           (User preferences)
├── challenges/        (Challenge data)
├── chats/            (Conversation history)
├── assets/           (Uploaded files)
└── index.md          (System manifest)
```

You can:
- Export as markdown/JSON
- Back up to cloud storage
- Migrate to another device
- Analyze with external tools

---

## Tips & Best Practices

### For Maximum Accountability

1. **Set Realistic Goals**: Start small, scale up
2. **Use Punishment Contracts**: Real stakes = real results
3. **Daily Check-ins**: Consistency is key
4. **Track Everything**: What gets measured gets managed
5. **Review Weekly**: Reflect on progress every Sunday

### For Multiple Challenges

1. **Don't Overcommit**: Max 3-4 active challenges
2. **Balance Types**: Mix learning + fitness + building
3. **Stagger Start Dates**: Don't start everything at once
4. **Use Different Agents**: Fitness Coach for workouts, Career Mentor for skills
5. **Time Block**: Assign specific hours to each challenge

### For Skill Creation

1. **Solve Your Own Problem**: Create skills you'll actually use
2. **Start Simple**: MVP first, features later
3. **Document Well**: Future you will thank you
4. **Share**: Contribute to the community
5. **Iterate**: Improve based on usage

---

## Troubleshooting

### App Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

### Skill Not Appearing
- Check `skills/[skill-name]/SKILL.md` exists
- Restart the dev server
- Check browser console for errors

### Agent Not Responding
- Verify skills are attached correctly
- Check chat history API is working
- Clear browser cache

### Build Errors
```bash
# Run type check
npm run build

# Fix TypeScript errors shown in output
```

---

## Community & Support

### Contributing
1. Fork the repository
2. Create a new branch: `git checkout -b feature/my-feature`
3. Make changes and test thoroughly
4. Submit a pull request

### Sharing Skills
- Create a skill following best practices
- Add detailed documentation
- Submit PR to main repo
- Skills get reviewed and merged

### Getting Help
- GitHub Issues: Report bugs
- Discussions: Ask questions
- Discord: Join the community (link)
- Email: support@openanalyst.com

---

## Appendix

### Keyboard Shortcuts
- `Cmd/Ctrl + K`: Open command palette
- `Cmd/Ctrl + N`: New challenge
- `Cmd/Ctrl + ,`: Settings
- `Cmd/Ctrl + /`: Toggle sidebar

### API Endpoints
```
GET  /api/agents           - List all agents
POST /api/agents           - Create agent
GET  /api/skills           - List all skills
PUT  /api/agents/:id/skills - Update agent skills
GET  /api/challenges       - List challenges
POST /api/challenges       - Create challenge
```

### Skill Triggers
Skills can be triggered by keywords in conversation:
- "nutrition" → nutritional-specialist
- "workout" → workout-program-designer
- "diagram" → excalidraw
- "image" → nanobanana-skill

---

**Version**: 2.0
**Last Updated**: December 27, 2025
**License**: MIT

Made with ❤️ by the OpenAnalyst community
