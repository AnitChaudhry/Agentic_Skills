const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const PORT = 8765;
// Use data/ folder in project directory instead of ~/.openanalyst/
const DATA_DIR = path.join(__dirname, '..', 'data');

// Create WebSocket server
const wss = new WebSocket.Server({ port: PORT });

console.log(`🚀 WebSocket server started on ws://localhost:${PORT}`);

// Store connected clients
const clients = new Map();

// Broadcast to all connected clients
function broadcast(message, excludeClient = null) {
  const messageStr = JSON.stringify(message);
  wss.clients.forEach(client => {
    if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

// Handle new connections
wss.on('connection', (ws) => {
  const clientId = Date.now().toString();
  clients.set(clientId, ws);

  console.log(`✅ Client connected: ${clientId} (Total clients: ${clients.size})`);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'status',
    content: 'Connected to OpenAnalyst WebSocket server',
    timestamp: new Date().toISOString()
  }));

  // Handle incoming messages
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`📨 Received message:`, message);

      // Handle different message types
      switch (message.type) {
        case 'chat':
          await handleChatMessage(message, ws);
          break;

        case 'file_update':
          handleFileUpdate(message);
          break;

        case 'typing':
          broadcast({
            type: 'typing',
            agentId: message.agentId,
            isTyping: message.isTyping,
            timestamp: new Date().toISOString()
          }, ws);
          break;

        case 'ping':
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString()
          }));
          break;

        default:
          console.log(`⚠️ Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('❌ Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        content: error.message,
        timestamp: new Date().toISOString()
      }));
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`👋 Client disconnected: ${clientId} (Total clients: ${clients.size})`);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for client ${clientId}:`, error);
  });
});

// Handle chat messages
async function handleChatMessage(message, ws) {
  const { agentId, content, requestId } = message;

  // Send typing indicator
  broadcast({
    type: 'typing',
    agentId,
    isTyping: true,
    timestamp: new Date().toISOString()
  });

  // Simulate response (in real implementation, this would call Claude API)
  setTimeout(() => {
    // Send response start
    ws.send(JSON.stringify({
      type: 'response_start',
      agentId,
      requestId,
      timestamp: new Date().toISOString()
    }));

    // Simulate streaming response
    const responseText = generateResponse(content);
    const words = responseText.split(' ');
    let currentIndex = 0;

    const streamInterval = setInterval(() => {
      if (currentIndex >= words.length) {
        clearInterval(streamInterval);

        // Send response end
        ws.send(JSON.stringify({
          type: 'response_end',
          agentId,
          requestId,
          timestamp: new Date().toISOString()
        }));

        // Stop typing indicator
        broadcast({
          type: 'typing',
          agentId,
          isTyping: false,
          timestamp: new Date().toISOString()
        });

        // Save chat message
        saveChatMessage(agentId, {
          role: 'user',
          content,
          timestamp: new Date().toISOString()
        });

        saveChatMessage(agentId, {
          role: 'assistant',
          content: responseText,
          timestamp: new Date().toISOString()
        });

        return;
      }

      const chunk = words.slice(currentIndex, currentIndex + 3).join(' ') + ' ';
      ws.send(JSON.stringify({
        type: 'response_chunk',
        agentId,
        requestId,
        content: chunk,
        timestamp: new Date().toISOString()
      }));

      currentIndex += 3;
    }, 100);

  }, 500);
}

// Generate mock response based on content
function generateResponse(content) {
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('check-in') || lowerContent.includes('checkin')) {
    return `Great! Let's do your check-in for today.

How are you feeling about your progress today? I'll walk you through a few quick questions:

1. How's your mood today? (1-5, where 5 is excellent)
2. Did you complete your planned tasks?
3. What wins did you have today?
4. Any blockers or challenges?
5. What's your commitment for tomorrow?

Just answer naturally, and I'll help you track your progress!`;
  }

  if (lowerContent.includes('new challenge') || lowerContent.includes('create') && lowerContent.includes('challenge')) {
    return `Excellent! Let's create a new challenge together. I'll help you design something achievable and motivating.

First, tell me: What skill or goal would you like to work on?

Some examples:
- Learn a new programming language
- Build a fitness habit
- Complete a creative project
- Develop a daily meditation practice

What interests you?`;
  }

  if (lowerContent.includes('vision board')) {
    return `I love this! Vision boards are powerful for manifesting your goals. Let's create something inspiring.

To start, think about your aspirations in these areas:
- Career & Professional Growth
- Health & Fitness
- Personal Development
- Relationships
- Creative Projects

What goals or dreams would you like to visualize? Share your thoughts, and I'll help you design a beautiful vision board.`;
  }

  return `I'm here to help you stay accountable and achieve your goals!

You can:
- Create a new challenge
- Do a quick check-in
- Create a vision board
- Track your progress
- Review your streaks

What would you like to work on today?`;
}

// Handle file updates
function handleFileUpdate(message) {
  console.log(`📁 File update: ${message.path}`);

  // Broadcast file update to all clients
  broadcast({
    type: 'file_update',
    path: message.path,
    content: message.content,
    timestamp: new Date().toISOString()
  });
}

// Save chat message to file
function saveChatMessage(agentId, message) {
  const today = new Date().toISOString().split('T')[0];
  const chatsDir = path.join(DATA_DIR, 'chats', today);

  if (!fs.existsSync(chatsDir)) {
    fs.mkdirSync(chatsDir, { recursive: true });
  }

  const chatFile = path.join(chatsDir, `${agentId}.md`);
  const timestamp = new Date().toLocaleString();
  const roleLabel = message.role === 'user' ? '**You**' : '**Assistant**';

  const entry = `\n\n## ${roleLabel} - ${timestamp}\n\n${message.content}\n\n---`;

  fs.appendFileSync(chatFile, entry);
}

// Handle server errors
wss.on('error', (error) => {
  console.error('❌ WebSocket server error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down WebSocket server...');
  wss.close(() => {
    console.log('✅ WebSocket server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down WebSocket server...');
  wss.close(() => {
    console.log('✅ WebSocket server closed');
    process.exit(0);
  });
});

console.log('📡 WebSocket server is ready for connections');
console.log('   Listening on ws://localhost:8765');
console.log('   Press Ctrl+C to stop\n');
