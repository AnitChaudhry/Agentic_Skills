/**
 * Response Generator Module
 *
 * Generates natural, conversational responses like Claude.
 * Dynamically uses skills, prompts, and templates for enhanced responses.
 *
 * Priority Order:
 * 1. Skills (explicit /commands and implicit keyword matching)
 * 2. Dynamic Prompts (general templates)
 * 3. Intent-based detection (fallback)
 */

const quickQuery = require('./quick-query');
const promptsManager = require('./prompts-manager');
const skillsManager = require('./skills-manager');

/**
 * Get time-appropriate greeting
 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Hi';
}

/**
 * Generate response based on user message intent
 * Checks skills first, then prompts, then intent-based
 */
function generateResponse(profileId, userMessage, agentId = 'unified') {
  const lowerMessage = userMessage.toLowerCase();

  // 1. Try to match a skill first (highest priority)
  const matchedSkill = skillsManager.matchSkill(userMessage, agentId);

  if (matchedSkill) {
    console.log(`[ResponseGenerator] Using skill: ${matchedSkill.id}`);
    return generateSkillBasedResponse(profileId, userMessage, matchedSkill);
  }

  // 2. Try to match a prompt
  const matchedPrompt = promptsManager.matchPrompt(userMessage);

  if (matchedPrompt) {
    console.log(`[ResponseGenerator] Using prompt: ${matchedPrompt.name}`);
    return generatePromptBasedResponse(profileId, userMessage, matchedPrompt);
  }

  // 3. Fall back to intent-based detection
  if (lowerMessage.includes('task') || lowerMessage.includes('todo')) {
    return generateTodayTasksResponse(profileId);
  }

  if (lowerMessage.includes('progress') || lowerMessage.includes('summary') || lowerMessage.includes('stats')) {
    return generateProgressResponse(profileId);
  }

  if (lowerMessage.includes('challenge')) {
    return generateChallengesResponse(profileId);
  }

  if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
    const query = userMessage.replace(/search|find/gi, '').trim();
    return generateSearchResponse(profileId, query);
  }

  // Default: greeting/general
  return generateGeneralResponse(profileId, userMessage);
}

/**
 * Generate response using a matched skill
 */
function generateSkillBasedResponse(profileId, userMessage, skill) {
  // Gather profile data for skill response
  const profile = quickQuery.getProfile(profileId);
  const todaysData = quickQuery.getTodaysTasks(profileId);
  const progressData = quickQuery.getProgressSummary(profileId);
  const challengesData = quickQuery.getChallenges(profileId, { active: true });

  // Build profile data object for skill
  const profileData = {
    name: profile.found ? profile.data.name : 'there',
    streak: progressData.streaks?.[0]?.streak || 0,
    challenges: challengesData.data || [],
    currentChallenge: challengesData.data?.[0] || null,
    completedTasks: todaysData.summary?.completedToday || 0,
    pendingTasks: todaysData.summary?.totalTodos || 0,
    todos: todaysData.todos || []
  };

  // Generate response using skills manager
  const response = skillsManager.generateSkillResponse(skill, userMessage, profileData);

  return response || generateGeneralResponse(profileId, userMessage);
}

/**
 * Generate response using a matched prompt template
 */
function generatePromptBasedResponse(profileId, userMessage, prompt) {
  // Gather data for template variables
  const profile = quickQuery.getProfile(profileId);
  const todaysData = quickQuery.getTodaysTasks(profileId);
  const progressData = quickQuery.getProgressSummary(profileId);
  const challengesData = quickQuery.getChallenges(profileId, { active: true });

  // Build variables object
  const variables = {
    name: profile.found ? profile.data.name : 'there',
    greeting: getGreeting(),
    user_message: userMessage,
    total_tasks: todaysData.summary?.totalTodos || 0,
    completed_tasks: todaysData.summary?.completedToday || 0,
    pending_tasks: todaysData.summary?.totalTodos || 0,
    total_challenges: challengesData.count || 0,
    active_challenges: challengesData.count || 0,
    completion_rate: progressData.todos?.completionRate?.toFixed(0) || 0,
    current_streak: progressData.streaks?.[0]?.streak || 0,
    today_date: new Date().toLocaleDateString(),
    today_day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
  };

  // Add task list if available
  if (todaysData.todos && todaysData.todos.length > 0) {
    variables.task_list = todaysData.todos
      .slice(0, 5)
      .map((t, i) => `${i + 1}. ${t.text || t.title}`)
      .join('\n');
  }

  // Add challenge list if available
  if (challengesData.data && challengesData.data.length > 0) {
    variables.challenge_list = challengesData.data
      .map((c, i) => {
        const name = c.name || c.challenge_name;
        const streak = c.streak || 0;
        return streak > 0 ? `${i + 1}. ${name} (${streak} day streak)` : `${i + 1}. ${name}`;
      })
      .join('\n');
  }

  // Fill the template
  const response = promptsManager.fillTemplate(prompt.template, variables);

  return response || generateGeneralResponse(profileId, userMessage);
}

/**
 * Generate today's tasks response
 */
function generateTodayTasksResponse(profileId) {
  const data = quickQuery.getTodaysTasks(profileId);

  if (!data.profile) {
    return `I couldn't find your profile. Let's get you set up first.`;
  }

  const { profile, summary, todos, challenges } = data;
  const name = profile.name || 'there';

  if (summary.totalTodos === 0 && summary.totalChallenges === 0) {
    return `Hey ${name}, looks like you don't have any tasks or challenges set up yet. Want me to help you create your first one?`;
  }

  let parts = [];
  parts.push(`Hey ${name}, here's what you've got going on today:`);

  if (summary.completedToday > 0) {
    parts.push(`You've already completed ${summary.completedToday} task${summary.completedToday > 1 ? 's' : ''} - nice work!`);
  }

  if (summary.totalTodos > 0) {
    parts.push(`You have ${summary.totalTodos} pending task${summary.totalTodos > 1 ? 's' : ''}:`);
    todos.slice(0, 5).forEach((todo, i) => {
      parts.push(`  ${i + 1}. ${todo.text || todo.title}`);
    });
    if (todos.length > 5) {
      parts.push(`  ...and ${todos.length - 5} more`);
    }
  }

  if (challenges.length > 0) {
    const challengeList = challenges.map(c => {
      const name = c.name || c.challenge_name;
      const streak = c.streak || 0;
      return streak > 0 ? `${name} (${streak} day streak)` : name;
    }).join(', ');
    parts.push(`Active challenges: ${challengeList}`);
  }

  return parts.join('\n\n');
}

/**
 * Generate progress summary response
 */
function generateProgressResponse(profileId) {
  const data = quickQuery.getProgressSummary(profileId);
  const profile = quickQuery.getProfile(profileId);
  const name = profile.found ? profile.data.name : 'there';

  let parts = [];
  parts.push(`Here's your progress summary, ${name}:`);

  if (data.challenges.total > 0) {
    parts.push(`Challenges: ${data.challenges.active} active, ${data.challenges.completed} completed out of ${data.challenges.total} total`);
  } else {
    parts.push(`No challenges created yet.`);
  }

  const totalTasks = data.todos.completed + data.todos.pending;
  if (totalTasks > 0) {
    parts.push(`Tasks: ${data.todos.completed} completed, ${data.todos.pending} pending (${data.todos.completionRate.toFixed(0)}% completion rate)`);
  } else {
    parts.push(`No tasks tracked yet.`);
  }

  if (data.streaks.length > 0) {
    const streakList = data.streaks.map(s => `${s.name}: ${s.streak} days`).join(', ');
    parts.push(`Current streaks: ${streakList}`);
  }

  return parts.join('\n\n');
}

/**
 * Generate challenges response
 */
function generateChallengesResponse(profileId) {
  const data = quickQuery.getChallenges(profileId, { active: true });
  const profile = quickQuery.getProfile(profileId);
  const name = profile.found ? profile.data.name : 'there';

  if (data.count === 0) {
    return `You don't have any active challenges right now, ${name}. Want to start one?`;
  }

  let parts = [];
  parts.push(`Here are your ${data.count} active challenge${data.count > 1 ? 's' : ''}, ${name}:`);

  data.data.forEach((challenge, i) => {
    const cName = challenge.name || challenge.challenge_name;
    const streak = challenge.streak || 0;
    const goal = challenge.goal;

    let line = `${i + 1}. ${cName}`;
    if (streak > 0) line += ` - ${streak} day streak`;
    if (goal) line += ` (Goal: ${goal})`;
    parts.push(line);
  });

  return parts.join('\n');
}

/**
 * Generate search response
 */
function generateSearchResponse(profileId, query) {
  if (!query || query.trim() === '') {
    return `What would you like me to search for?`;
  }

  const data = quickQuery.search(profileId, query);

  if (!data.found) {
    return `I couldn't find anything matching "${query}". Try a different keyword.`;
  }

  let parts = [];
  parts.push(`Found ${data.count.total} result${data.count.total > 1 ? 's' : ''} for "${query}":`);

  if (data.count.challenges > 0) {
    parts.push(`Challenges:`);
    data.results.challenges.slice(0, 3).forEach(c => {
      parts.push(`  - ${c.name || c.challenge_name}`);
    });
  }

  if (data.count.todos > 0) {
    parts.push(`Tasks:`);
    data.results.todos.slice(0, 3).forEach(t => {
      parts.push(`  - ${t.text || t.title}`);
    });
  }

  return parts.join('\n');
}

/**
 * Generate general/greeting response
 */
function generateGeneralResponse(profileId, userMessage) {
  const profile = quickQuery.getProfile(profileId);
  const todaysData = quickQuery.getTodaysTasks(profileId);
  const greeting = getGreeting();

  if (!profile.found) {
    return `${greeting}! I'm your OpenAnalyst accountability coach. I don't see a profile set up for you yet. Let's get started!`;
  }

  const name = profile.data.name;
  const { summary } = todaysData;
  const lowerMessage = userMessage.toLowerCase();

  // Simple greetings
  if (lowerMessage.match(/^(hi|hey|hello|yo|sup|what's up|howdy)/)) {
    if (summary.totalTodos === 0 && summary.totalChallenges === 0) {
      return `${greeting}, ${name}! Good to see you. You don't have any active tasks or challenges yet. Want to set something up?`;
    }

    let response = `${greeting}, ${name}! `;
    if (summary.totalTodos > 0) {
      response += `You have ${summary.totalTodos} task${summary.totalTodos > 1 ? 's' : ''} pending today. `;
    }
    if (summary.totalChallenges > 0) {
      response += `${summary.totalChallenges} active challenge${summary.totalChallenges > 1 ? 's' : ''} running. `;
    }
    if (summary.completedToday > 0) {
      response += `Already knocked out ${summary.completedToday} today!`;
    }
    return response.trim();
  }

  // Help request
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return `I'm your OpenAnalyst accountability coach. I can help you with:\n\n- Tracking your daily tasks\n- Managing challenges and streaks\n- Showing your progress\n- Searching through your goals\n\nJust ask me things like "what are my tasks?" or "show my progress"`;
  }

  // Default friendly response
  return `${greeting}, ${name}! I'm here to help you stay accountable. Ask me about your tasks, challenges, or progress - or just tell me what's on your mind.`;
}

/**
 * Generate response for UNIFIED chat (access all data, no profile required)
 * Checks skills first, then prompts
 */
function generateUnifiedResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  const allProfileIds = quickQuery.getAllProfileIds();
  const profileId = allProfileIds[0] || null;

  console.log(`[ResponseGenerator] Processing: "${userMessage.substring(0, 50)}..."`);

  // 1. Try to match a skill first (highest priority)
  const matchedSkill = skillsManager.matchSkill(userMessage, 'unified');

  console.log(`[ResponseGenerator] Skill match result: ${matchedSkill ? matchedSkill.id : 'none'}`);

  if (matchedSkill) {
    console.log(`[ResponseGenerator] Unified using skill: ${matchedSkill.id}`);
    if (profileId) {
      return generateSkillBasedResponse(profileId, userMessage, matchedSkill);
    }
    // Generate with minimal data if no profile
    const minimalData = {
      name: 'User',
      streak: 0,
      challenges: [],
      currentChallenge: null,
      completedTasks: 0,
      pendingTasks: 0,
      todos: []
    };
    return skillsManager.generateSkillResponse(matchedSkill, userMessage, minimalData);
  }

  // 2. Try to match a prompt
  const matchedPrompt = promptsManager.matchPrompt(userMessage);

  if (matchedPrompt) {
    console.log(`[ResponseGenerator] Unified using prompt: ${matchedPrompt.name}`);
    if (profileId) {
      return generatePromptBasedResponse(profileId, userMessage, matchedPrompt);
    }
    // Generate with minimal variables if no profile
    const variables = {
      name: 'User',
      user_message: userMessage,
      today_date: new Date().toLocaleDateString(),
      today_day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    };
    return promptsManager.fillTemplate(matchedPrompt.template, variables);
  }

  // Collect all data across all profiles
  let allChallenges = [];
  let allTodos = [];
  let allProfiles = [];

  allProfileIds.forEach(profileId => {
    const profile = quickQuery.getProfile(profileId);
    if (profile.found) {
      allProfiles.push({ id: profileId, ...profile.data });
    }

    const challenges = quickQuery.getChallenges(profileId);
    if (challenges.data) {
      allChallenges = allChallenges.concat(challenges.data.map(c => ({ ...c, profileId })));
    }

    const todos = quickQuery.getTodos(profileId);
    if (todos.data) {
      allTodos = allTodos.concat(todos.data.map(t => ({ ...t, profileId })));
    }
  });

  // Handle different intents
  if (lowerMessage.includes('user') || lowerMessage.includes('profile') || lowerMessage.includes('who')) {
    if (allProfiles.length === 0) {
      return `No users registered yet.`;
    }
    let response = `There ${allProfiles.length === 1 ? 'is' : 'are'} ${allProfiles.length} user${allProfiles.length > 1 ? 's' : ''} in the system:\n`;
    allProfiles.forEach((p, i) => {
      response += `\n${i + 1}. ${p.name || p.id} (${p.id})`;
      if (p.goal) response += ` - Goal: ${p.goal}`;
    });
    return response;
  }

  if (lowerMessage.includes('challenge')) {
    if (allChallenges.length === 0) {
      return `No challenges created yet across any users.`;
    }
    let response = `Found ${allChallenges.length} challenge${allChallenges.length > 1 ? 's' : ''} across all users:\n`;
    allChallenges.slice(0, 10).forEach((c, i) => {
      const name = c.name || c.challenge_name;
      const streak = c.streak || 0;
      response += `\n${i + 1}. ${name}`;
      if (streak > 0) response += ` (${streak} day streak)`;
      response += ` - by ${c.profileId}`;
    });
    if (allChallenges.length > 10) {
      response += `\n\n...and ${allChallenges.length - 10} more`;
    }
    return response;
  }

  if (lowerMessage.includes('task') || lowerMessage.includes('todo')) {
    if (allTodos.length === 0) {
      return `No tasks found across any users.`;
    }
    const pending = allTodos.filter(t => !t.completed);
    const completed = allTodos.filter(t => t.completed);
    let response = `Task summary across all users:\n\n`;
    response += `Total: ${allTodos.length} tasks\n`;
    response += `Pending: ${pending.length}\n`;
    response += `Completed: ${completed.length}`;
    if (pending.length > 0) {
      response += `\n\nRecent pending tasks:`;
      pending.slice(0, 5).forEach((t, i) => {
        response += `\n${i + 1}. ${t.text || t.title} (${t.profileId})`;
      });
    }
    return response;
  }

  if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
    const query = userMessage.replace(/search|find/gi, '').trim();
    if (!query) {
      return `What would you like me to search for across all data?`;
    }

    // Search across all profiles
    let results = [];
    allProfileIds.forEach(profileId => {
      const searchResult = quickQuery.search(profileId, query);
      if (searchResult.found) {
        results.push({ profileId, ...searchResult });
      }
    });

    if (results.length === 0) {
      return `No results found for "${query}" across any user data.`;
    }

    let response = `Search results for "${query}":\n`;
    results.forEach(r => {
      response += `\nFrom ${r.profileId}:`;
      if (r.count.challenges > 0) {
        r.results.challenges.slice(0, 2).forEach(c => {
          response += `\n  - Challenge: ${c.name || c.challenge_name}`;
        });
      }
      if (r.count.todos > 0) {
        r.results.todos.slice(0, 2).forEach(t => {
          response += `\n  - Task: ${t.text || t.title}`;
        });
      }
    });
    return response;
  }

  // Default: system overview
  let response = `Welcome to OpenAnalyst!\n\n`;
  response += `System overview:\n`;
  response += `- Users: ${allProfiles.length}\n`;
  response += `- Total challenges: ${allChallenges.length}\n`;
  response += `- Total tasks: ${allTodos.length}\n\n`;
  response += `This is the unified view. Ask me about:\n`;
  response += `- "Show all users"\n`;
  response += `- "Show all challenges"\n`;
  response += `- "Show all tasks"\n`;
  response += `- "Search for [keyword]"`;

  return response;
}

module.exports = {
  generateResponse,
  generateUnifiedResponse,
  generateTodayTasksResponse,
  generateProgressResponse,
  generateChallengesResponse,
  generateSearchResponse,
  generateGeneralResponse
};
