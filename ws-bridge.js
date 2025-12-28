/**
 * WebSocket Bridge for Claude Code ↔ UI Communication
 *
 * This creates a WebSocket server on port 8765 that:
 * 1. Receives messages from the UI
 * 2. Writes them to the inbox for Claude Code to see
 * 3. Watches for responses and sends them back to UI
 *
 * Run: node ws-bridge.js
 * Then start Claude Code in another terminal: claude
 */

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { watch } = require('fs');

const PORT = 8765;
const DATA_DIR = path.join(__dirname, 'data');
const INBOX_DIR = path.join(DATA_DIR, '.inbox');
const OUTBOX_DIR = path.join(DATA_DIR, '.outbox');

// Ensure directories exist
[INBOX_DIR, OUTBOX_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create WebSocket server
const wss = new WebSocket.Server({ port: PORT });

console.log(`\n🔌 WebSocket Bridge started on ws://localhost:${PORT}`);
console.log(`📥 Inbox: ${INBOX_DIR}`);
console.log(`📤 Outbox: ${OUTBOX_DIR}`);
console.log(`\n⏳ Waiting for UI connection...\n`);

// Track connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('✅ UI Connected!');
  console.log('─'.repeat(50));

  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'status',
    content: 'Connected to Claude Code Bridge',
    timestamp: new Date().toISOString()
  }));

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());

      console.log('\n📨 MESSAGE FROM UI:');
      console.log('─'.repeat(50));
      console.log(`Agent: ${message.agentId}`);
      console.log(`Content: ${message.content}`);
      console.log(`Request ID: ${message.requestId}`);
      console.log('─'.repeat(50));

      // Write to inbox for Claude Code to see
      const inboxFile = path.join(INBOX_DIR, `${Date.now()}-${message.requestId}.json`);
      fs.writeFileSync(inboxFile, JSON.stringify({
        ...message,
        receivedAt: new Date().toISOString(),
        status: 'pending'
      }, null, 2));

      console.log(`\n💾 Saved to inbox: ${path.basename(inboxFile)}`);
      console.log('\n🤖 CLAUDE CODE: Check the inbox and respond!\n');
      console.log(`   Read:  cat "${inboxFile}"`);
      console.log(`   Reply: Create response in .outbox folder\n`);

      // Send typing indicator
      ws.send(JSON.stringify({
        type: 'typing',
        requestId: message.requestId,
        timestamp: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('❌ UI Disconnected');
  });
});

// Watch outbox for responses
console.log('👀 Watching outbox for responses...\n');

watch(OUTBOX_DIR, (eventType, filename) => {
  if (eventType === 'rename' && filename && filename.endsWith('.json')) {
    const filePath = path.join(OUTBOX_DIR, filename);

    // Small delay to ensure file is fully written
    setTimeout(() => {
      try {
        if (fs.existsSync(filePath)) {
          const response = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

          console.log('\n📤 RESPONSE FROM CLAUDE CODE:');
          console.log('─'.repeat(50));
          console.log(`Content: ${response.content?.substring(0, 100)}...`);
          console.log('─'.repeat(50));

          // Send to all connected clients
          clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              // Send response start
              client.send(JSON.stringify({
                type: 'response_start',
                requestId: response.requestId,
                timestamp: new Date().toISOString()
              }));

              // Send content
              client.send(JSON.stringify({
                type: 'response_chunk',
                requestId: response.requestId,
                content: response.content,
                timestamp: new Date().toISOString()
              }));

              // Send response end
              client.send(JSON.stringify({
                type: 'response_end',
                requestId: response.requestId,
                timestamp: new Date().toISOString()
              }));
            }
          });

          // Clean up processed file
          fs.unlinkSync(filePath);
          console.log('✅ Response sent to UI\n');
        }
      } catch (error) {
        console.error('Error processing response:', error);
      }
    }, 100);
  }
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down WebSocket Bridge...');
  wss.close();
  process.exit(0);
});

console.log('─'.repeat(50));
console.log('INSTRUCTIONS:');
console.log('─'.repeat(50));
console.log('1. Keep this terminal open (WebSocket Bridge)');
console.log('2. Open another terminal and run: claude');
console.log('3. Open http://localhost:3000 in browser');
console.log('4. When you chat in UI, you\'ll see messages here');
console.log('5. Claude Code can respond by creating files in .outbox');
console.log('─'.repeat(50));
console.log('\n');
