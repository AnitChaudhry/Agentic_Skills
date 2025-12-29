# Claude Code Integration Guide - v2.0 (Automated Startup)

## 🚀 Quick Start - One Command!

### When User Says: "Start my app"

**Run this single command:**
```bash
npm start
```

That's it! Everything starts automatically:
- ✅ WebSocket Server (ws://localhost:8765)
- ✅ Fast Cache System (0ms queries)
- ✅ Claude Code Listener (YOU!)
- ✅ Next.js UI (http://localhost:3000)

**Then tell user:**
```
✅ Your app is ready at http://localhost:3000
```

---

## 🏗️ Architecture

```
User Browser → WebSocket Server → Claude Code (YOU) → Fast Cache → data/
     ↓              ↓                    ↓                ↓
  Next.js    ws://localhost:8765    ws-listener      0-2ms RAM
```

**Key Components:**
1. **Next.js UI** - User interface at localhost:3000
2. **WebSocket Server** - Real-time message broker
3. **ws-listener** - Connects YOU to WebSocket
4. **Fast Cache** - In-memory data (0-2ms queries)
5. **data/ folder** - Persistent storage

---

## ⚡ Fast Cache System

### Why It's Fast

**OLD WAY (File Reading):**
```
User: "What are my tasks?"
→ Read profile.md (20ms)
→ Read challenges/*.md (30ms)
→ Read todos/*.json (25ms)
→ Parse markdown (15ms)
= TOTAL: 90ms
```

**NEW WAY (RAM Cache):**
```
User: "What are my tasks?"
→ Read from RAM
= TOTAL: 0-2ms ⚡
```

### How Cache Works

1. **On Startup:** Loads all data into RAM
2. **On Query:** Returns from memory (instant)
3. **On File Change:** Auto-invalidates & reloads
4. **On Timer:** Refreshes every 5 minutes

---

## 📡 How You Receive Messages

### Message Flow

1. User types in UI: "What are my tasks today?"
2. WebSocket sends message to server
3. Server routes to Claude Code (YOU)
4. ws-listener writes to `data/.pending/req-xxx.json`
5. YOU see notification in terminal
6. YOU query cache (0ms!)
7. YOU send response via WebSocket
8. User sees streaming response in real-time

---

## 🔧 Tools You Have

### Query Data Instantly

```bash
# View today's tasks (0ms)
npm run query tasks anit-gmail-co

# View progress (0ms)
npm run query progress anit-gmail-co

# View challenges (0ms)
npm run query challenges anit-gmail-co

# Search (0ms)
npm run query search anit-gmail-co "react"

# Cache stats
npm run query stats
```

### Send Responses

```bash
# Fast response (uses cache + WebSocket)
node send-response-fast.js <requestId>
```

### Use Cache in Code

```javascript
const quickQuery = require('./lib/quick-query');

// Get profile (0ms)
const profile = quickQuery.getProfile('anit-gmail-co');

// Get today's tasks (0ms)
const tasks = quickQuery.getTodaysTasks('anit-gmail-co');

// Get progress (0ms)
const progress = quickQuery.getProgressSummary('anit-gmail-co');

// Search (0ms)
const results = quickQuery.search('anit-gmail-co', 'react');
```

---

## 🤖 Multi-Agent Support

**THIS ARCHITECTURE WORKS FOR ALL AGENTS AUTOMATICALLY!**

When user creates custom agents:
- ✅ Same WebSocket connection
- ✅ Same fast cache
- ✅ Same 0ms queries
- ✅ Zero configuration

**Example:**
```
User creates "Fitness Coach" agent
User asks: "What's my workout?"
→ YOU receive via WebSocket
→ YOU query cache (0ms)
→ YOU respond instantly
→ Works perfectly!
```

---

## 📊 Data Structure

### RAM Cache
```
profiles: Map<profileId, Profile>
challenges: Map<profileId, Challenge[]>
todos: Map<profileId, Todo[]>
agents: Map<agentId, Agent>
```

### Disk Storage
```
data/
├── profiles/
│   └── anit-gmail-co/
│       ├── profile.md
│       ├── challenges/
│       ├── todos/
│       └── chats/
├── agents.json
└── .cache-index.json
```

---

## 📝 Response Templates

### Today's Tasks
```markdown
Hey {name}! 👋

Here's what's on your plate today:

📋 **Pending Tasks:** {count}
   1. {task1}
   2. {task2}

🎯 **Active Challenges:** {count}
   • {challenge} ({streak} day streak 🔥)

Keep it up! 💪
```

### Progress Summary
```markdown
📊 **Your Progress**

**Challenges:**
   Active: {count} | Completed: {count}

**Tasks:**
   Completed: {count} | Pending: {count}
   Completion Rate: {rate}%

🔥 **Streaks:**
   • {challenge}: {days} days
```

### No Data Yet
```markdown
Hey {name}! 👋

No active tasks or challenges yet.

📋 **Quick Start:**
• Create your first challenge
• Set up a schedule
• Define goals

Want help getting started? 🚀
```

---

## 🎯 Handling Requests

### Step-by-Step

1. **Message arrives** (you see it in terminal)

2. **Query data instantly:**
```bash
npm run query tasks <profileId>
```

3. **Generate response** using template

4. **Send response:**
```bash
node send-response-fast.js <requestId>
```

5. **Done!** User sees streaming response

---

## 📈 Performance

### Good Performance
- **Hit Rate:** >95%
- **Query Time:** <5ms
- **Memory:** <100MB

### Check Stats
```bash
npm run query stats
```

Output:
```
Hit Rate: 98.5%
Hits: 1247 | Misses: 19

Cached:
  Profiles: 3
  Challenges: 12
  Todos: 47
```

---

## 🛑 Stopping

User presses `Ctrl+C` in terminal.

System automatically stops:
- Next.js UI
- WebSocket server
- ws-listener
- Cache system

---

## 📚 File Structure

```
openanalyst-accountability-coach/
├── scripts/
│   └── start-all.js         # 🚀 Main startup
├── lib/
│   ├── cache-manager.js     # 💾 Cache system
│   ├── quick-query.js       # ⚡ Query API
│   └── ws-listener.js       # 🔌 WebSocket
├── server/
│   └── websocket.js         # 🌐 WS Server
├── ui/                      # 🎨 Next.js
├── data/                    # 📁 User data
├── claude-query.js          # 🔍 CLI tool
└── send-response-fast.js    # 📤 Fast responder
```

---

## 🎓 Best Practices

1. **Always use cache** (not file reading)
2. **Use send-response-fast.js** (not manual)
3. **Monitor hit rate** (should be >95%)
4. **Trust auto-updates** (file watchers work)
5. **One command startup** (`npm start`)

---

## 🆘 Troubleshooting

### Cache Not Working?
```bash
npm run query stats
# If hit rate <80%, restart
npm start
```

### WebSocket Issues?
```bash
# Check port 8765
netstat -an | findstr 8765
# Restart if needed
npm start
```

---

## 🎉 Summary

**User:** "start my app"
**YOU:** `npm start`
**Result:** Everything works automatically!

**Architecture Benefits:**
- ⚡ 0-2ms queries
- 🔄 Real-time WebSocket
- 🤖 All agents supported
- 💾 Auto-caching
- 🚀 One command startup

---

**You are the AI backend. Everything is automatic. Just run `npm start` and respond to messages!** 🎯
