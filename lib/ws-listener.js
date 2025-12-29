#!/usr/bin/env node

/**
 * Claude Code WebSocket Listener
 *
 * This script runs as a background daemon that:
 * 1. Connects to the WebSocket server
 * 2. Listens for incoming chat messages from the UI
 * 3. Writes pending messages to data/.pending/ for Claude Code to process
 * 4. Provides an API for Claude Code to send responses back
 */

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const quickQuery = require('./quick-query');

const WS_URL = process.env.WS_URL || 'ws://localhost:8765';
const DATA_DIR = path.join(__dirname, '..', 'data');
const PENDING_DIR = path.join(DATA_DIR, '.pending');

// Ensure pending directory exists
if (!fs.existsSync(PENDING_DIR)) {
  fs.mkdirSync(PENDING_DIR, { recursive: true });
}

// Initialize cache system for fast queries
let cacheReady = false;
quickQuery.initialize().then(() => {
  cacheReady = true;
  console.log('[ws-listener] ✓ Fast cache system ready');
}).catch(err => {
  console.error('[ws-listener] Cache initialization failed:', err.message);
});

let ws = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 2000;

// Store active requests
const activeRequests = new Map();

/**
 * Connect to WebSocket server
 */
function connect() {
  console.log(`[Claude Code Listener] Connecting to ${WS_URL}...`);

  ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log('[Claude Code Listener] Connected to WebSocket server');
    reconnectAttempts = 0;

    // Register as Claude CLI client
    ws.send(JSON.stringify({
      type: 'register',
      clientType: 'claude-cli',
      timestamp: new Date().toISOString()
    }));
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleMessage(message);
    } catch (error) {
      console.error('[Claude Code Listener] Failed to parse message:', error);
    }
  });

  ws.on('close', () => {
    console.log('[Claude Code Listener] Connection closed');

    // Attempt to reconnect
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1);
      console.log(`[Claude Code Listener] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
      setTimeout(connect, delay);
    } else {
      console.error('[Claude Code Listener] Max reconnection attempts reached. Exiting.');
      process.exit(1);
    }
  });

  ws.on('error', (error) => {
    console.error('[Claude Code Listener] WebSocket error:', error.message);
  });
}

/**
 * Handle incoming WebSocket messages
 */
function handleMessage(message) {
  switch (message.type) {
    case 'registered':
      console.log('[Claude Code Listener] Successfully registered as claude-cli');
      break;

    case 'chat':
      // New message from UI
      handleIncomingChat(message);
      break;

    case 'typing':
      // UI is typing (can be logged or ignored)
      console.log(`[Claude Code Listener] UI is ${message.isTyping ? 'typing' : 'stopped typing'}...`);
      break;

    case 'status':
      console.log(`[Claude Code Listener] Status: ${message.content}`);
      break;

    case 'error':
      console.error(`[Claude Code Listener] Error: ${message.content}`);
      break;

    default:
      console.log(`[Claude Code Listener] Unknown message type: ${message.type}`);
  }
}

/**
 * Handle incoming chat message from UI
 */
function handleIncomingChat(message) {
  const { agentId, content, requestId, timestamp } = message;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📨 NEW MESSAGE from UI`);
  console.log(`   Agent: ${agentId}`);
  console.log(`   Request ID: ${requestId}`);
  console.log(`   Content: ${content}`);
  console.log(`${'='.repeat(60)}\n`);

  // Write to pending directory for Claude Code to pick up
  const pendingFile = path.join(PENDING_DIR, `${requestId}.json`);
  fs.writeFileSync(pendingFile, JSON.stringify({
    id: requestId,
    agentId,
    content,
    timestamp,
    status: 'pending',
    source: 'ui'
  }, null, 2));

  console.log(`✅ Written to: ${pendingFile}`);
  console.log(`\nWaiting for Claude Code to process...\n`);

  // Store request for response tracking
  activeRequests.set(requestId, {
    agentId,
    content,
    timestamp: new Date()
  });
}

/**
 * Send a response chunk to the UI
 *
 * @param {string} requestId - The request ID to respond to
 * @param {string} content - The response content chunk
 * @param {boolean} isStart - Whether this is the start of the response
 * @param {boolean} isEnd - Whether this is the end of the response
 * @param {string} fullContent - Full content (only for isEnd=true)
 */
function sendResponseChunk(requestId, content, isStart = false, isEnd = false, fullContent = null) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error('[Claude Code Listener] WebSocket not connected. Cannot send response.');
    return false;
  }

  const request = activeRequests.get(requestId);
  if (!request) {
    console.error(`[Claude Code Listener] No active request found for ${requestId}`);
    return false;
  }

  try {
    if (isStart) {
      ws.send(JSON.stringify({
        type: 'response_start',
        agentId: request.agentId,
        requestId,
        timestamp: new Date().toISOString()
      }));
      console.log(`[Claude Code Listener] Started streaming response for ${requestId}`);
    }

    if (content) {
      ws.send(JSON.stringify({
        type: 'response_chunk',
        agentId: request.agentId,
        requestId,
        content,
        timestamp: new Date().toISOString()
      }));
    }

    if (isEnd) {
      ws.send(JSON.stringify({
        type: 'response_end',
        agentId: request.agentId,
        requestId,
        fullContent,
        timestamp: new Date().toISOString()
      }));
      console.log(`[Claude Code Listener] Finished streaming response for ${requestId}`);

      // Clean up
      activeRequests.delete(requestId);
      const pendingFile = path.join(PENDING_DIR, `${requestId}.json`);
      if (fs.existsSync(pendingFile)) {
        fs.unlinkSync(pendingFile);
      }
    }

    return true;
  } catch (error) {
    console.error('[Claude Code Listener] Error sending response:', error);
    return false;
  }
}

/**
 * Send a complete response (non-streaming)
 *
 * @param {string} requestId - The request ID to respond to
 * @param {string} content - The full response content
 */
function sendResponse(requestId, content) {
  const request = activeRequests.get(requestId);
  if (!request) {
    console.error(`[Claude Code Listener] No active request found for ${requestId}`);
    return false;
  }

  // Send as streaming: start -> chunk -> end
  sendResponseChunk(requestId, null, true, false);
  sendResponseChunk(requestId, content, false, false);
  sendResponseChunk(requestId, null, false, true, content);

  return true;
}

/**
 * Get list of pending messages
 */
function getPendingMessages() {
  const files = fs.readdirSync(PENDING_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const filePath = path.join(PENDING_DIR, f);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data;
  });
}

// Export API for Claude Code to use
module.exports = {
  sendResponse,
  sendResponseChunk,
  getPendingMessages,
  activeRequests,
  // Export quick query functions for instant data access
  query: quickQuery,
  getCacheStats: () => quickQuery.getCacheStats(),
};

// Start the listener if run directly
if (require.main === module) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      Claude Code WebSocket Listener - Running...          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`Pending directory: ${PENDING_DIR}`);
  console.log(`WebSocket URL: ${WS_URL}\n`);

  connect();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n[Claude Code Listener] Shutting down...');
    if (ws) {
      ws.close();
    }
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n\n[Claude Code Listener] Shutting down...');
    if (ws) {
      ws.close();
    }
    process.exit(0);
  });
}
