import { Message } from '@/components/ConversationView'

// Core streaming interfaces
export interface StreamRequest {
  messages: Message[]
  model?: 'gpt-4' | 'claude-3' | 'gpt-3.5-turbo'
  stream?: boolean
}

export interface StreamChunk {
  id: string
  content: string
  delta: string        // New content since last chunk
  done: boolean
  error?: string
}

export interface StreamingMessage extends Message {
  content: string           // Progressive content updates
  status: 'streaming' | 'complete' | 'failed'
  streamId?: string         // For tracking specific streams
  partialContent?: string   // Current streaming content
  finalContent?: string     // Complete content when done
}

// Enhanced chat state for streaming
export interface ChatState {
  messages: StreamingMessage[]
  activeStream: {
    messageId: string
    streamId: string
    startTime: number
  } | null
  streamingErrors: Map<string, Error>
}

// Hook interface for useStreamingChat
export interface UseStreamingChatReturn {
  messages: StreamingMessage[]
  sendMessage: (content: string) => Promise<void>
  isStreaming: boolean
  streamError: Error | null
  retryMessage: (messageId: string) => Promise<void>
  cancelStream: () => void
}

// Stream configuration options
export interface StreamConfig {
  debounceMs?: number      // Debounce time for content updates (default: 50ms)
  timeoutMs?: number       // Stream timeout (default: 30000ms)
  retryAttempts?: number   // Max retry attempts (default: 3)
  retryDelayMs?: number    // Initial retry delay (default: 1000ms)
}

// Event types for Server-Sent Events
export type StreamEventType = 'chunk' | 'complete' | 'error' | 'heartbeat'

export interface StreamEvent {
  type: StreamEventType
  data: StreamChunk | { error: string } | { heartbeat: number }
}

// AI Provider interfaces
export interface AIProvider {
  name: string
  stream(messages: Message[]): AsyncIterable<StreamChunk>
}

export interface OpenAIStreamResponse {
  choices: Array<{
    delta: {
      content?: string
    }
    finish_reason?: string
  }>
}