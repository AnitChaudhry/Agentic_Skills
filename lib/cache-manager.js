/**
 * Fast In-Memory Cache Manager for OpenAnalyst
 *
 * This module provides instant data access without reading files every time.
 * Uses in-memory caching with automatic invalidation when files change.
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class CacheManager extends EventEmitter {
  constructor() {
    super();

    // In-memory cache storage
    this.cache = {
      profiles: new Map(),      // profileId -> profile data
      challenges: new Map(),    // profileId -> challenges array
      todos: new Map(),         // profileId -> todos array
      chats: new Map(),         // profileId -> recent chats
      agents: new Map(),        // agentId -> agent data
      index: null,              // Master index file
    };

    // Cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      lastUpdate: null,
    };

    // File watchers for auto-invalidation
    this.watchers = new Map();

    // TTL in milliseconds (default: 5 minutes)
    this.defaultTTL = 5 * 60 * 1000;

    // Cache entries with expiration
    this.expirations = new Map();

    this.dataDir = path.join(__dirname, '..', 'data');
    this.indexFile = path.join(this.dataDir, '.cache-index.json');
  }

  /**
   * Initialize the cache by loading index and watching files
   */
  async initialize() {
    console.log('[CacheManager] Initializing cache system...');

    // Load or create index
    await this.loadIndex();

    // Preload frequently accessed data
    await this.preloadData();

    // Start file watchers
    this.startWatchers();

    // Start cleanup interval for expired entries
    this.startCleanupInterval();

    console.log('[CacheManager] ✓ Cache system ready');
    console.log(`[CacheManager] Loaded: ${this.cache.profiles.size} profiles, ${this.cache.agents.size} agents`);
  }

  /**
   * Load or create the master index file
   */
  async loadIndex() {
    try {
      if (fs.existsSync(this.indexFile)) {
        const indexData = JSON.parse(fs.readFileSync(this.indexFile, 'utf8'));
        this.cache.index = indexData;
        console.log('[CacheManager] Loaded existing index');
      } else {
        await this.buildIndex();
      }
    } catch (error) {
      console.error('[CacheManager] Error loading index:', error.message);
      await this.buildIndex();
    }
  }

  /**
   * Build master index from file system
   */
  async buildIndex() {
    console.log('[CacheManager] Building index...');

    const index = {
      version: '1.0',
      lastBuild: new Date().toISOString(),
      profiles: {},
      agents: {},
      stats: {
        totalProfiles: 0,
        totalChallenges: 0,
        totalTodos: 0,
      }
    };

    // Index profiles
    const profilesDir = path.join(this.dataDir, 'profiles');
    if (fs.existsSync(profilesDir)) {
      const profileDirs = fs.readdirSync(profilesDir).filter(f =>
        fs.statSync(path.join(profilesDir, f)).isDirectory()
      );

      for (const profileId of profileDirs) {
        const profilePath = path.join(profilesDir, profileId);
        index.profiles[profileId] = {
          id: profileId,
          path: profilePath,
          challenges: path.join(profilePath, 'challenges'),
          todos: path.join(profilePath, 'todos'),
          chats: path.join(profilePath, 'chats'),
        };
        index.stats.totalProfiles++;
      }
    }

    // Index agents
    const agentsFile = path.join(this.dataDir, 'agents.json');
    if (fs.existsSync(agentsFile)) {
      const agentsData = JSON.parse(fs.readFileSync(agentsFile, 'utf8'));
      index.agents = agentsData.agents || {};
    }

    this.cache.index = index;

    // Save index to disk
    fs.writeFileSync(this.indexFile, JSON.stringify(index, null, 2));
    console.log('[CacheManager] ✓ Index built and saved');

    return index;
  }

  /**
   * Preload frequently accessed data into memory
   */
  async preloadData() {
    const index = this.cache.index;
    if (!index) return;

    // Preload all profiles
    for (const [profileId, profileInfo] of Object.entries(index.profiles)) {
      await this.loadProfile(profileId);
      await this.loadChallenges(profileId);
      await this.loadTodos(profileId);
    }

    // Preload agents
    for (const [agentId, agentData] of Object.entries(index.agents)) {
      this.cache.agents.set(agentId, agentData);
    }
  }

  /**
   * Load profile data into cache
   */
  async loadProfile(profileId) {
    try {
      const profilePath = path.join(this.dataDir, 'profiles', profileId, 'profile.md');
      if (!fs.existsSync(profilePath)) return null;

      const content = fs.readFileSync(profilePath, 'utf8');

      // Parse markdown frontmatter and content
      const profile = this.parseMarkdownProfile(content, profileId);

      this.cache.profiles.set(profileId, profile);
      this.setExpiration(`profile:${profileId}`);

      return profile;
    } catch (error) {
      console.error(`[CacheManager] Error loading profile ${profileId}:`, error.message);
      return null;
    }
  }

  /**
   * Load challenges for a profile
   */
  async loadChallenges(profileId) {
    try {
      const challengesDir = path.join(this.dataDir, 'profiles', profileId, 'challenges');
      if (!fs.existsSync(challengesDir)) {
        this.cache.challenges.set(profileId, []);
        return [];
      }

      const challengeFiles = fs.readdirSync(challengesDir)
        .filter(f => f.endsWith('.md') || f.endsWith('.json'));

      const challenges = [];
      for (const file of challengeFiles) {
        const filePath = path.join(challengesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        if (file.endsWith('.json')) {
          challenges.push(JSON.parse(content));
        } else {
          challenges.push(this.parseMarkdownChallenge(content));
        }
      }

      this.cache.challenges.set(profileId, challenges);
      this.setExpiration(`challenges:${profileId}`);

      return challenges;
    } catch (error) {
      console.error(`[CacheManager] Error loading challenges for ${profileId}:`, error.message);
      return [];
    }
  }

  /**
   * Load todos for a profile
   */
  async loadTodos(profileId) {
    try {
      const todosDir = path.join(this.dataDir, 'profiles', profileId, 'todos');
      if (!fs.existsSync(todosDir)) {
        this.cache.todos.set(profileId, []);
        return [];
      }

      const todoFiles = fs.readdirSync(todosDir).filter(f => f.endsWith('.json'));
      const todos = [];

      for (const file of todoFiles) {
        const filePath = path.join(todosDir, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (Array.isArray(content)) {
          todos.push(...content);
        } else if (content.todos) {
          todos.push(...content.todos);
        }
      }

      this.cache.todos.set(profileId, todos);
      this.setExpiration(`todos:${profileId}`);

      return todos;
    } catch (error) {
      console.error(`[CacheManager] Error loading todos for ${profileId}:`, error.message);
      return [];
    }
  }

  /**
   * Parse markdown profile into structured data
   */
  parseMarkdownProfile(content, profileId) {
    const profile = { id: profileId };

    // Extract key-value pairs from markdown
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^-\s*\*\*(.+?):\*\*\s*(.+)$/);
      if (match) {
        const key = match[1].toLowerCase().replace(/\s+/g, '_');
        profile[key] = match[2];
      }
    }

    return profile;
  }

  /**
   * Parse markdown challenge into structured data
   */
  parseMarkdownChallenge(content) {
    // Simple frontmatter parser
    const challenge = {};
    const lines = content.split('\n');

    for (const line of lines) {
      const match = line.match(/^-\s*\*\*(.+?):\*\*\s*(.+)$/);
      if (match) {
        const key = match[1].toLowerCase().replace(/\s+/g, '_');
        challenge[key] = match[2];
      }
    }

    return challenge;
  }

  /**
   * Get profile from cache (instant)
   */
  getProfile(profileId) {
    const cached = this.cache.profiles.get(profileId);

    if (cached && !this.isExpired(`profile:${profileId}`)) {
      this.stats.hits++;
      return cached;
    }

    this.stats.misses++;
    // Async reload in background
    this.loadProfile(profileId);
    return cached || null;
  }

  /**
   * Get challenges from cache (instant)
   */
  getChallenges(profileId) {
    const cached = this.cache.challenges.get(profileId);

    if (cached && !this.isExpired(`challenges:${profileId}`)) {
      this.stats.hits++;
      return cached;
    }

    this.stats.misses++;
    this.loadChallenges(profileId);
    return cached || [];
  }

  /**
   * Get todos from cache (instant)
   */
  getTodos(profileId) {
    const cached = this.cache.todos.get(profileId);

    if (cached && !this.isExpired(`todos:${profileId}`)) {
      this.stats.hits++;
      return cached;
    }

    this.stats.misses++;
    this.loadTodos(profileId);
    return cached || [];
  }

  /**
   * Get agent data from cache
   */
  getAgent(agentId) {
    const cached = this.cache.agents.get(agentId);
    this.stats.hits++;
    return cached || null;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      ...this.stats,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      totalEntries: {
        profiles: this.cache.profiles.size,
        challenges: this.cache.challenges.size,
        todos: this.cache.todos.size,
        agents: this.cache.agents.size,
      }
    };
  }

  /**
   * Set expiration time for cache entry
   */
  setExpiration(key, ttl = this.defaultTTL) {
    this.expirations.set(key, Date.now() + ttl);
  }

  /**
   * Check if cache entry is expired
   */
  isExpired(key) {
    const expiration = this.expirations.get(key);
    if (!expiration) return false;
    return Date.now() > expiration;
  }

  /**
   * Invalidate cache for a specific key
   */
  invalidate(key) {
    const [type, id] = key.split(':');

    switch (type) {
      case 'profile':
        this.cache.profiles.delete(id);
        break;
      case 'challenges':
        this.cache.challenges.delete(id);
        break;
      case 'todos':
        this.cache.todos.delete(id);
        break;
    }

    this.expirations.delete(key);
    console.log(`[CacheManager] Invalidated: ${key}`);
  }

  /**
   * Start file watchers for auto-invalidation
   */
  startWatchers() {
    const profilesDir = path.join(this.dataDir, 'profiles');

    if (fs.existsSync(profilesDir)) {
      // Watch profiles directory
      const watcher = fs.watch(profilesDir, { recursive: true }, (eventType, filename) => {
        if (!filename) return;

        // Extract profile ID from path
        const parts = filename.split(path.sep);
        const profileId = parts[0];

        // Invalidate relevant cache
        if (filename.includes('profile.md')) {
          this.invalidate(`profile:${profileId}`);
        } else if (filename.includes('challenges')) {
          this.invalidate(`challenges:${profileId}`);
        } else if (filename.includes('todos')) {
          this.invalidate(`todos:${profileId}`);
        }
      });

      this.watchers.set('profiles', watcher);
    }
  }

  /**
   * Start cleanup interval for expired entries
   */
  startCleanupInterval() {
    setInterval(() => {
      let cleaned = 0;

      for (const [key, expiration] of this.expirations.entries()) {
        if (Date.now() > expiration) {
          this.invalidate(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`[CacheManager] Cleaned ${cleaned} expired entries`);
      }
    }, 60000); // Every minute
  }

  /**
   * Rebuild index manually
   */
  async rebuildIndex() {
    console.log('[CacheManager] Rebuilding index...');
    await this.buildIndex();
    await this.preloadData();
    console.log('[CacheManager] ✓ Index rebuilt');
  }

  /**
   * Shutdown cache manager
   */
  shutdown() {
    console.log('[CacheManager] Shutting down...');

    // Close all watchers
    for (const [name, watcher] of this.watchers.entries()) {
      watcher.close();
      console.log(`[CacheManager] Closed watcher: ${name}`);
    }

    // Save final stats
    console.log('[CacheManager] Final stats:', this.getStats());
  }
}

// Export singleton instance
const cacheManager = new CacheManager();

module.exports = cacheManager;
