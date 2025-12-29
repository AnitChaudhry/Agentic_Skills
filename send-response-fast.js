#!/usr/bin/env node
/**
 * Fast Response Generator using Cache System
 *
 * This script demonstrates how to use the quick query API
 * to generate instant responses without reading files.
 */

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const quickQuery = require('./lib/quick-query');

// Configuration
const WS_URL = 'ws://localhost:8765';
const PENDING_DIR = path.join(__dirname, 'data', '.pending');

// Get request ID from command line
const requestId = process.argv[2];
if (!requestId) {
  console.error('Usage: node send-response-fast.js <requestId>');
  process.exit(1);
}

// Main function
async function main() {
  // Initialize cache system
  console.log('Initializing fast cache system...');
  await quickQuery.initialize();
  console.log('✓ Cache ready\n');

  // Read the pending request
  const pendingFile = path.join(PENDING_DIR, `${requestId}.json`);
  if (!fs.existsSync(pendingFile)) {
    console.error(`Error: Pending request file not found: ${requestId}.json`);
    process.exit(1);
  }

  const request = JSON.parse(fs.readFileSync(pendingFile, 'utf8'));
  const { agentId, content, timestamp } = request;

  // Extract profile ID from request (if available in metadata or localStorage)
  // For now, we'll use the first profile found
  const cacheStats = quickQuery.getCacheStats();
  const profileId = Array.from(cacheStats.totalEntries.profiles || [])[0] || 'anit-gmail-co';

  console.log(`Processing request: ${requestId}`);
  console.log(`Agent: ${agentId}`);
  console.log(`Content: ${content}`);
  console.log(`Profile: ${profileId}\n`);

  // Generate response using cached data (INSTANT!)
  const startTime = Date.now();
  const response = await generateResponse(profileId, content);
  const queryTime = Date.now() - startTime;

  console.log(`✓ Response generated in ${queryTime}ms (cache-powered!)\n`);

  // Send response via WebSocket
  await sendResponse(requestId, agentId, response);

  // Show cache stats
  console.log('\nCache Performance:');
  const stats = quickQuery.getCacheStats();
  console.log(`  Hit Rate: ${(stats.hitRate * 100).toFixed(1)}%`);
  console.log(`  Total Hits: ${stats.hits}`);
  console.log(`  Total Misses: ${stats.misses}`);

  // Cleanup
  quickQuery.shutdown();
  process.exit(0);
}

/**
 * Generate response using quick query API (instant!)
 */
async function generateResponse(profileId, userMessage) {
  const lowerMessage = userMessage.toLowerCase();

  // Detect intent from message
  if (lowerMessage.includes('task') || lowerMessage.includes('today')) {
    return generateTodayTasksResponse(profileId);
  }

  if (lowerMessage.includes('progress') || lowerMessage.includes('summary')) {
    return generateProgressResponse(profileId);
  }

  if (lowerMessage.includes('challenge')) {
    return generateChallengesResponse(profileId);
  }

  if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
    const query = userMessage.replace(/search|find/gi, '').trim();
    return generateSearchResponse(profileId, query);
  }

  // Default: general status
  return generateGeneralResponse(profileId);
}

/**
 * Generate today's tasks response (instant!)
 */
function generateTodayTasksResponse(profileId) {
  const data = quickQuery.getTodaysTasks(profileId);

  if (!data.profile) {
    return `I couldn't find your profile. Please make sure you're logged in.`;
  }

  const { profile, summary, todos, challenges } = data;

  let response = `Hey ${profile.name}! 👋\n\n`;

  if (summary.totalTodos === 0 && summary.totalChallenges === 0) {
    response += `You don't have any active tasks or challenges set up yet.\n\n`;
    response += `📋 **Quick Start:**\n`;
    response += `• Create your first challenge\n`;
    response += `• Set up a daily schedule\n`;
    response += `• Define specific goals\n\n`;
    response += `Your big goal: ${profile.goal || 'Not set'}\n\n`;
    response += `Would you like me to help you create your first challenge? 🚀`;
  } else {
    response += `Here's what's on your plate today:\n\n`;

    if (summary.completedToday > 0) {
      response += `✅ **Completed:** ${summary.completedToday} task${summary.completedToday > 1 ? 's' : ''}\n`;
    }

    if (summary.totalTodos > 0) {
      response += `📋 **Pending Tasks:** ${summary.totalTodos}\n`;
      todos.slice(0, 5).forEach((todo, i) => {
        response += `   ${i + 1}. ${todo.text || todo.title}\n`;
      });
      if (todos.length > 5) {
        response += `   ... and ${todos.length - 5} more\n`;
      }
      response += `\n`;
    }

    if (challenges.length > 0) {
      response += `🎯 **Active Challenges:** ${challenges.length}\n`;
      challenges.forEach(c => {
        const name = c.name || c.challenge_name;
        const streak = c.streak || 0;
        response += `   • ${name} (${streak} day streak 🔥)\n`;
      });
      response += `\n`;
    }

    response += `Keep up the great work! 💪`;
  }

  return response;
}

/**
 * Generate progress summary response (instant!)
 */
function generateProgressResponse(profileId) {
  const data = quickQuery.getProgressSummary(profileId);

  let response = `📊 **Your Progress Summary**\n\n`;

  response += `**Challenges:**\n`;
  response += `   • Active: ${data.challenges.active}\n`;
  response += `   • Completed: ${data.challenges.completed}\n`;
  response += `   • Total: ${data.challenges.total}\n\n`;

  response += `**Tasks:**\n`;
  response += `   • Completed: ${data.todos.completed}\n`;
  response += `   • Pending: ${data.todos.pending}\n`;
  response += `   • Completion Rate: ${data.todos.completionRate.toFixed(1)}%\n\n`;

  if (data.streaks.length > 0) {
    response += `🔥 **Current Streaks:**\n`;
    data.streaks.forEach(s => {
      response += `   • ${s.name}: ${s.streak} days\n`;
    });
  }

  return response;
}

/**
 * Generate challenges response (instant!)
 */
function generateChallengesResponse(profileId) {
  const data = quickQuery.getChallenges(profileId, { active: true });

  let response = `🎯 **Your Active Challenges**\n\n`;

  if (data.count === 0) {
    response += `You don't have any active challenges right now.\n\n`;
    response += `Would you like to create one? I can help! 🚀`;
  } else {
    data.data.forEach((challenge, i) => {
      const name = challenge.name || challenge.challenge_name;
      const streak = challenge.streak || 0;
      const goal = challenge.goal || 'No goal set';

      response += `${i + 1}. **${name}**\n`;
      response += `   Streak: ${streak} days 🔥\n`;
      response += `   Goal: ${goal}\n\n`;
    });
  }

  return response;
}

/**
 * Generate search response (instant!)
 */
function generateSearchResponse(profileId, query) {
  const data = quickQuery.search(profileId, query);

  let response = `🔍 **Search Results for "${query}"**\n\n`;

  if (!data.found) {
    response += `No results found.\n\n`;
    response += `Try searching for challenges, tasks, or keywords related to your goals.`;
  } else {
    if (data.count.challenges > 0) {
      response += `**Challenges (${data.count.challenges}):**\n`;
      data.results.challenges.slice(0, 5).forEach(c => {
        response += `   • ${c.name || c.challenge_name}\n`;
      });
      response += `\n`;
    }

    if (data.count.todos > 0) {
      response += `**Tasks (${data.count.todos}):**\n`;
      data.results.todos.slice(0, 5).forEach(t => {
        response += `   • ${t.text || t.title}\n`;
      });
    }
  }

  return response;
}

/**
 * Generate general response (instant!)
 */
function generateGeneralResponse(profileId) {
  const profile = quickQuery.getProfile(profileId);
  const todaysData = quickQuery.getTodaysTasks(profileId);

  if (!profile.found) {
    return `Hey there! I'm having trouble finding your profile. Please make sure you're logged in.`;
  }

  const name = profile.data.name;
  const { summary } = todaysData;

  let response = `Hey ${name}! 👋\n\n`;
  response += `I'm here to help you stay accountable and reach your goals!\n\n`;

  response += `**Quick Stats:**\n`;
  response += `   • Active Challenges: ${summary.totalChallenges}\n`;
  response += `   • Today's Tasks: ${summary.totalTodos}\n`;
  response += `   • Completed Today: ${summary.completedToday}\n\n`;

  response += `**What can I help you with?**\n`;
  response += `   • "What are my tasks today?"\n`;
  response += `   • "Show me my progress"\n`;
  response += `   • "Create a new challenge"\n`;
  response += `   • "Search for [keyword]"\n\n`;

  response += `Let me know! 🚀`;

  return response;
}

/**
 * Send response via WebSocket
 */
function sendResponse(requestId, agentId, responseText) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);

    ws.on('open', () => {
      // Register as Claude CLI
      ws.send(JSON.stringify({
        type: 'register',
        clientType: 'claude-cli',
        timestamp: new Date().toISOString()
      }));
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === 'registered') {
        console.log('Streaming response to UI...');

        // Send streaming response
        ws.send(JSON.stringify({
          type: 'response_start',
          agentId,
          requestId,
          timestamp: new Date().toISOString()
        }));

        // Split into chunks
        const chunks = responseText.split('\n\n');
        let fullContent = '';

        chunks.forEach((chunk, index) => {
          setTimeout(() => {
            const chunkText = chunk + '\n\n';
            fullContent += chunkText;

            ws.send(JSON.stringify({
              type: 'response_chunk',
              agentId,
              requestId,
              content: chunkText,
              timestamp: new Date().toISOString()
            }));

            console.log(`  Chunk ${index + 1}/${chunks.length} sent`);

            if (index === chunks.length - 1) {
              setTimeout(() => {
                ws.send(JSON.stringify({
                  type: 'response_end',
                  agentId,
                  requestId,
                  fullContent: fullContent.trim(),
                  timestamp: new Date().toISOString()
                }));

                console.log('✓ Response complete!');

                // Delete pending file
                const pendingFile = path.join(PENDING_DIR, `${requestId}.json`);
                if (fs.existsSync(pendingFile)) {
                  fs.unlinkSync(pendingFile);
                }

                ws.close();
                resolve();
              }, 200);
            }
          }, index * 300);
        });
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error.message);
      reject(error);
    });
  });
}

// Run main
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
