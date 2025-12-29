# Claude Code Integration Guide

This document explains how Claude Code integrates with the OpenAnalyst UI using **WebSocket real-time communication**.

## Architecture (WebSocket-Based)

```
┌─────────────────┐                    ┌──────────────────┐                    ┌─────────────────┐
│   Next.js UI    │◄─── WebSocket ────►│  WebSocket Server│◄─── WebSocket ────►│  Claude Code    │
│   (Browser)     │   (port 8765)      │  (Message Broker)│                    │  (ws-listener)  │
└─────────────────┘                    └────────┬─────────┘                    └─────────────────┘
                                                 │
                                                 ▼
                                         data/chats/*.md
                                         (persistence only)
```

**Everything happens in real-time through WebSocket connections. No file polling or inbox needed.**

---

## Getting Started

### 1. Start the WebSocket Server
```bash
npm run dev:ws
```

This starts the WebSocket server on `ws://localhost:8765` which acts as a message broker between the UI and Claude Code.

### 2. Start the UI
```bash
npm run dev
```

The UI automatically connects to the WebSocket server and registers as a `ui` client.

### 3. Run the Claude Code Listener
```bash
node lib/ws-listener.js
```

This connects to the WebSocket server as a `claude-cli` client and:
- Listens for messages from the UI
- Writes pending messages to `data/.pending/`
- Provides an API for sending responses

---

## How It Works

### Step 1: User Sends Message in UI
- User types message and clicks send
- UI sends message via WebSocket to server
- Server saves it to `data/chats/{date}/{agentId}.md`
- Server forwards message to Claude Code listener

### Step 2: Claude Code Receives Message
The listener displays in your terminal:
```
============================================================
📨 NEW MESSAGE from UI
   Agent: unified
   Request ID: req-1234567890-abc123
   Content: How is my React challenge going?
============================================================

✅ Written to: data/.pending/req-1234567890-abc123.json

Waiting for Claude Code to process...
```

### Step 3: Read the Pending Message
```bash
cat data/.pending/req-*.json
```

Example:
```json
{
  "id": "req-1234567890-abc123",
  "agentId": "unified",
  "content": "How is my React challenge going?",
  "timestamp": "2025-12-28T10:30:00.000Z",
  "status": "pending",
  "source": "ui"
}
```

### Step 4: Send Your Response
Use the listener API to send responses:

**Simple Response (Non-Streaming):**
```javascript
const listener = require('./lib/ws-listener')

listener.sendResponse('req-1234567890-abc123', 'Your full response here')
```

**Streaming Response (For Long Responses):**
```javascript
const listener = require('./lib/ws-listener')

const requestId = 'req-1234567890-abc123'

// Start streaming
listener.sendResponseChunk(requestId, null, true, false)

// Send chunks
listener.sendResponseChunk(requestId, 'Hello! ')
listener.sendResponseChunk(requestId, 'How can I help you today?')

// End streaming
listener.sendResponseChunk(requestId, null, false, true, fullContent)
```

### Step 5: UI Receives Response
- Response streams back through WebSocket in real-time
- UI displays the response as it arrives
- Server saves complete response to chat file

---

## Data Locations

| Data | Location | Format |
|------|----------|--------|
| Chat Messages | `data/chats/{date}/{agentId}.md` | Markdown |
| Pending Messages | `data/.pending/` | JSON (temporary) |
| Challenges | `data/challenges/` | Markdown with frontmatter |
| Todos | `data/todos/` | Markdown with frontmatter |
| User Profile | `data/profile/` | JSON |
| Skills | `skills/` | SKILL.md files |
| Activity Log | `data/profile/activity-log.json` | JSON |

**Note:** The old `data/.inbox/` is deprecated and no longer used.

---

## Chat File Format

Messages are still persisted to markdown files for history:

```markdown
# Chat with unified - 2025-12-28

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

## What You Can Do

When processing messages, you have full access to:

1. **Read all data files** - challenges, todos, skills, user profile
2. **Web search** - for learning resources, documentation
3. **Update files** - create todos, update streaks, log activities
4. **Use skills** - invoke any skill from the skills/ folder
5. **Generate content** - motivation, plans, recommendations
6. **Stream responses** - send responses in real-time chunks

---

## Example: Processing a Check-in Request

User message: "I want to do my daily check-in"

**1. Read pending message:**
```bash
cat data/.pending/req-*.json
```

**2. Gather context:**
```bash
cat data/challenges/30-day-react-mastery/plan.md
cat data/todos/2025-12-28.md
```

**3. Send response:**
```javascript
const listener = require('./lib/ws-listener')

const response = `Welcome back! Let's do your daily check-in for 30-Day React Mastery. 📋

📊 Current Status:
- Day 8 of 30
- Streak: 8 days 🔥
- Progress: 30%

✅ Yesterday's Completed:
- Review useEffect documentation

📋 Today's Focus:
- Complete React useState tutorial
- Build a simple counter app

How did yesterday go? Did you complete the useEffect review?`

listener.sendResponse(requestId, response)
```

**4. Response appears in UI instantly!**

---

## Quick Commands

```bash
# View pending messages
ls data/.pending/

# Read a pending message
cat data/.pending/req-*.json

# View today's chat history
cat data/chats/2025-12-28/unified.md

# View active challenges
cat data/challenges/*/plan.md

# Check WebSocket server status
# (Look for "UI clients: X, Claude CLI clients: Y" in terminal)
```

---

## Troubleshooting

**UI shows "Disconnected":**
- Make sure WebSocket server is running: `npm run dev:ws`
- Check server is on port 8765

**Messages not reaching Claude Code:**
- Make sure listener is running: `node lib/ws-listener.js`
- Check listener shows "Connected to WebSocket server"
- Look for "Successfully registered as claude-cli"

**Responses not appearing in UI:**
- Make sure you're using the correct `requestId`
- Check terminal for errors
- Verify WebSocket connections in both terminals

---

## Tips

1. **Be conversational** - Write responses as natural dialogue
2. **Reference data** - Pull in real stats from challenges/todos
3. **Be proactive** - Suggest next actions, remind about deadlines
4. **Use emojis** - They make responses more engaging (📊 ✅ 📋 🔥 💪)
5. **Stream long responses** - For better UX on lengthy replies
6. **Check `.pending/` directory** - Clean up after processing

---

This file is your guide. The UI handles display; you handle the intelligence!
