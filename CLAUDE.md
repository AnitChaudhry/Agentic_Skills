# Claude Code Integration Guide

This document explains how Claude Code integrates with the OpenAnalyst UI.

## Architecture

```
┌─────────────────┐                    ┌──────────────────┐
│   Next.js UI    │ ◄─── reads ─────── │   data/ folder   │
│  (Browser)      │                    │  (markdown/JSON) │
└────────┬────────┘                    └────────▲─────────┘
         │                                      │
         │ writes request                       │ writes response
         ▼                                      │
┌─────────────────┐                    ┌────────┴─────────┐
│   data/.inbox/  │ ───── read ──────► │  Claude Code CLI │
│   (messages)    │                    │  (This Terminal) │
└─────────────────┘                    └──────────────────┘
```

**The UI only displays data. Claude Code (you) does all the intelligent work.**

## How It Works

### 1. User Sends Message in UI
- Message is saved to `data/.inbox/msg-{timestamp}.json`
- Chat file is updated at `data/chats/{date}/{agentId}.md`

### 2. Claude Code Processes Message
When you see a new message in the inbox:

```bash
# Check inbox
ls data/.inbox/

# Read a message
cat data/.inbox/msg-xxx.json
```

### 3. Claude Code Responds
Write your response directly to the chat file:

```bash
# Append response to chat file
echo -e "\n**Claude:** Your response here\n" >> data/chats/2025-12-28/accountability-coach.md
```

Or use the Edit tool to append to the file.

### 4. UI Picks Up Response
The UI polls `/api/chat/latest` and displays your response automatically.

---

## Data Locations

| Data | Location | Format |
|------|----------|--------|
| Chat Messages | `data/chats/{date}/{agentId}.md` | Markdown |
| Inbox (pending) | `data/.inbox/` | JSON |
| Challenges | `data/challenges/` | Markdown with frontmatter |
| Todos | `data/todos/` | Markdown with frontmatter |
| User Profile | `data/profile/` | JSON |
| Skills | `skills/` | SKILL.md files |
| Activity Log | `data/profile/activity-log.json` | JSON |

---

## Chat File Format

```markdown
# Chat with accountability-coach - 2025-12-28

## 10:30 AM
**User:** How is my React challenge going?

**Claude:** Great progress! You're on day 8 of your 30-Day React Mastery challenge with an 8-day streak. Today's tasks include completing the useState tutorial and building a counter app.

## 10:35 AM
**User:** What should I focus on today?

**Claude:** Based on your schedule, focus on:
1. Complete React useState tutorial (9:00 AM - 10:00 AM)
2. Build a simple counter app (10:30 AM - 11:15 AM)
```

---

## Message JSON Format

```json
{
  "id": "msg-1735385123456-abc123",
  "agentId": "accountability-coach",
  "content": "How is my React challenge going?",
  "attachments": [],
  "timestamp": "2025-12-28T10:30:00.000Z",
  "status": "pending",
  "source": "ui"
}
```

---

## What You Can Do

When processing messages, you have full access to:

1. **Read all data files** - challenges, todos, skills, user profile
2. **Web search** - for learning resources, documentation
3. **Update files** - create todos, update streaks, log activities
4. **Use skills** - invoke any skill from the skills/ folder
5. **Generate content** - motivation, plans, recommendations

---

## Example: Processing a Check-in Request

User message: "I want to do my daily check-in"

1. Read the active challenge:
   ```bash
   cat data/challenges/30-day-react-mastery.md
   ```

2. Check today's todos:
   ```bash
   cat data/todos/2025-12-28.md
   ```

3. Write your response to chat (NO markdown bold formatting):
   ```markdown
   **Claude:** Welcome back! Let's do your daily check-in for 30-Day React Mastery.

   Current Status:
   - Day 8 of 30
   - Streak: 8 days
   - Progress: 30%

   Yesterday's Completed:
   - Review useEffect documentation

   Today's Focus:
   - Complete React useState tutorial
   - Build a simple counter app

   How did yesterday go? Did you complete the useEffect review?
   ```

   IMPORTANT:
   - Do NOT use **bold** markdown formatting in responses
   - Emojis are GOOD - use them for visual clarity (📊 ✅ 📋 🔥 💪 etc.)
   - Keep text clean and readable

4. Mark message as processed in inbox (or delete it)

---

## Quick Commands

```bash
# Check for new messages
ls data/.inbox/

# Read today's chat
cat data/chats/$(date +%Y-%m-%d)/accountability-coach.md

# View active challenges
cat data/challenges/*.md

# Check todos
cat data/todos/*.md

# Respond to chat
echo -e "\n**Claude:** Your response\n" >> data/chats/$(date +%Y-%m-%d)/accountability-coach.md
```

---

## Tips

1. **Be conversational** - Write responses as natural dialogue
2. **Reference data** - Pull in real stats from challenges/todos
3. **Be proactive** - Suggest next actions, remind about deadlines
4. **Log activities** - Update activity-log.json for transparency
5. **Clean inbox** - Delete processed messages to keep inbox clean

---

This file is your guide. The UI handles display; you handle the intelligence!
