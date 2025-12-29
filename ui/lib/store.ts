// Zustand global store for OpenAnalyst

import { create } from 'zustand'
import type { Agent, ChatMessage, FileNode, Todo, Challenge } from '@/types'

// Navigation Store - Track active selection (agent OR nav item)
interface NavigationState {
  activeType: 'agent' | 'nav' | null
  activeId: string | null
  setActive: (type: 'agent' | 'nav' | null, id: string | null) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeType: null,
  activeId: null,
  setActive: (type, id) => set({ activeType: type, activeId: id }),
}))

// Agent Store
interface AgentState {
  agents: Agent[]
  activeAgentId: string | null
  setActiveAgent: (id: string | null) => void
  loadAgents: () => Promise<void>
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  activeAgentId: null,
  setActiveAgent: (id) => set({ activeAgentId: id }),
  loadAgents: async () => {
    try {
      const response = await fetch('/api/agents')
      const agents = await response.json()
      set({ agents })
    } catch (error) {
      console.error('Failed to load agents:', error)
    }
  },
}))

// Chat Store
interface ChatState {
  messages: Record<string, ChatMessage[]> // Keyed by agentId
  isTyping: boolean
  setTyping: (isTyping: boolean) => void
  addMessage: (agentId: string, message: ChatMessage) => void
  markMessageAnswered: (agentId: string, messageIndex: number) => void
  loadHistory: (agentId: string) => Promise<void>
  sendMessage: (agentId: string, content: string, attachments?: File[]) => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {},
  isTyping: false,
  setTyping: (isTyping) => set({ isTyping }),
  addMessage: (agentId, message) => {
    const { messages } = get()
    set({
      messages: {
        ...messages,
        [agentId]: [...(messages[agentId] || []), message],
      },
    })
  },
  markMessageAnswered: (agentId, messageIndex) => {
    const { messages } = get()
    const agentMessages = messages[agentId] || []
    if (agentMessages[messageIndex]) {
      agentMessages[messageIndex] = {
        ...agentMessages[messageIndex],
        metadata: {
          ...agentMessages[messageIndex].metadata,
          answered: true,
        },
      }
      set({
        messages: {
          ...messages,
          [agentId]: [...agentMessages],
        },
      })
    }
  },
  loadHistory: async (agentId) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/chat/${agentId}?date=${today}`)
      const history = await response.json()
      set((state) => ({
        messages: {
          ...state.messages,
          [agentId]: history.messages || [],
        },
      }))
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  },
  sendMessage: async (agentId, content, attachments) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      agentId,
      attachments: attachments?.map((file) => ({
        id: Date.now().toString(),
        type: file.type.startsWith('image/') ? 'image' : 'file',
        path: file.name,
        name: file.name,
        size: file.size,
      })),
    }

    get().addMessage(agentId, message)

    try {
      // Import WebSocket client
      const { getWebSocketClient } = await import('./websocket')
      const wsClient = getWebSocketClient()

      // Show waiting indicator
      set({ isTyping: true })

      // Add a pending response message
      const pendingMessageId = `pending-${Date.now()}`
      get().addMessage(agentId, {
        id: pendingMessageId,
        role: 'assistant',
        content: '💬 Waiting for response...',
        timestamp: new Date().toISOString(),
        agentId,
        metadata: { isPending: true },
      })

      // Send via WebSocket and wait for response
      try {
        const response = await wsClient.sendChatMessage(agentId, content, attachments?.map(f => f.name))

        // Remove pending message and add real response
        const messages = get().messages[agentId] || []
        const filteredMessages = messages.filter(m => m.id !== pendingMessageId)

        set({
          messages: {
            ...get().messages,
            [agentId]: [...filteredMessages, {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: response,
              timestamp: new Date().toISOString(),
              agentId,
            }],
          },
          isTyping: false,
        })
      } catch (wsError: any) {
        console.error('WebSocket send failed:', wsError)

        // Remove pending message
        const messages = get().messages[agentId] || []
        const filteredMessages = messages.filter(m => m.id !== pendingMessageId)

        set({
          messages: {
            ...get().messages,
            [agentId]: [...filteredMessages, {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: '❌ Failed to get response. Make sure Claude Code listener is running.',
              timestamp: new Date().toISOString(),
              agentId,
            }],
          },
          isTyping: false,
        })
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      set({ isTyping: false })

      get().addMessage(agentId, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Failed to send message. Please try again.',
        timestamp: new Date().toISOString(),
        agentId,
      })
    }
  },
}))

// UI Store (panel sizes, preferences)
interface UIState {
  leftPanelWidth: number
  rightPanelWidth: number
  isLayer2Open: boolean
  setLeftPanelWidth: (width: number) => void
  setRightPanelWidth: (width: number) => void
  toggleLayer2: () => void
}

export const useUIStore = create<UIState>((set) => ({
  leftPanelWidth: 240,
  rightPanelWidth: 280,
  isLayer2Open: false,
  setLeftPanelWidth: (width) => set({ leftPanelWidth: width }),
  setRightPanelWidth: (width) => set({ rightPanelWidth: width }),
  toggleLayer2: () => set((state) => ({ isLayer2Open: !state.isLayer2Open })),
}))

// File Store (file tree cache)
interface FileState {
  trees: Record<string, FileNode[]> // Keyed by agentId
  selectedFile: string | null
  fileContent: string | null
  loadTree: (agentId: string) => Promise<void>
  selectFile: (path: string | null) => void
  loadFile: (path: string) => Promise<void>
}

export const useFileStore = create<FileState>((set) => ({
  trees: {},
  selectedFile: null,
  fileContent: null,
  loadTree: async (agentId) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/files`)
      const tree = await response.json()
      set((state) => ({
        trees: {
          ...state.trees,
          [agentId]: tree,
        },
      }))
    } catch (error) {
      console.error('Failed to load file tree:', error)
    }
  },
  selectFile: (path) => set({ selectedFile: path, fileContent: null }),
  loadFile: async (path) => {
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`)
      const data = await response.json()
      set({ fileContent: data.content })
    } catch (error) {
      console.error('Failed to load file:', error)
    }
  },
}))

// Todos Store
interface TodoState {
  todos: Todo[]
  loadTodos: () => Promise<void>
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
}

export const useTodoStore = create<TodoState>((set) => ({
  todos: [],
  loadTodos: async () => {
    try {
      const response = await fetch('/api/todos')
      const todos = await response.json()
      set({ todos })
    } catch (error) {
      console.error('Failed to load todos:', error)
    }
  },
  addTodo: async (todo) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo),
      })
      const newTodo = await response.json()
      set((state) => ({ todos: [...state.todos, newTodo] }))
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  },
  toggleTodo: async (id) => {
    try {
      await fetch(`/api/todos/${id}`, { method: 'PATCH' })
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id
            ? { ...todo, status: todo.status === 'completed' ? 'pending' : 'completed' }
            : todo
        ),
      }))
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  },
}))

// Challenges/Streaks Store
interface ChallengeState {
  challenges: Challenge[]
  loadChallenges: () => Promise<void>
}

export const useChallengeStore = create<ChallengeState>((set) => ({
  challenges: [],
  loadChallenges: async () => {
    try {
      const response = await fetch('/api/challenges')
      const data = await response.json()
      // API returns { challenges: [...] }, extract the array
      set({ challenges: data.challenges || [] })
    } catch (error) {
      console.error('Failed to load challenges:', error)
      set({ challenges: [] })
    }
  },
}))

// Onboarding Store
interface OnboardingState {
  isActive: boolean
  type: 'user' | 'challenge' | null
  currentStep: string
  responses: Record<string, any>

  startOnboarding: (type: 'user' | 'challenge') => void
  answerStep: (stepId: string, value: any) => void
  getNextStep: () => { stepId: string; message: string; options?: any[] } | null
  completeOnboarding: () => Promise<void>
  markMessageAnswered: (messageIndex: number) => void
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  isActive: false,
  type: null,
  currentStep: '',
  responses: {},

  startOnboarding: (type) => {
    set({
      isActive: true,
      type,
      currentStep: type === 'user' ? 'name' : 'challenge_name',
      responses: {},
    })
  },

  answerStep: (stepId, value) => {
    const { responses } = get()
    set({
      responses: { ...responses, [stepId]: value },
    })
  },

  getNextStep: () => {
    const { type, currentStep, responses } = get()

    if (!type) return null

    // Import will be done in UnifiedChat component
    // This is a placeholder - actual logic will use onboardingStateMachine
    return null
  },

  completeOnboarding: async () => {
    const { responses, type } = get()

    try {
      // Save onboarding data based on type
      if (type === 'user') {
        // Save to profile
        await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(responses),
        })
      } else if (type === 'challenge') {
        // Create challenge
        await fetch('/api/challenges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(responses),
        })
      }

      // Reset onboarding state
      set({
        isActive: false,
        type: null,
        currentStep: '',
        responses: {},
      })
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    }
  },

  markMessageAnswered: (messageIndex) => {
    // This will be handled in the chat store
  },
}))
