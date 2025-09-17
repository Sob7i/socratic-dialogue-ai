import { useState, useCallback, useRef, useEffect } from 'react'
import {
  StreamingMessage,
  UseStreamingChatReturn,
  StreamConfig,
  StreamEvent,
  StreamRequest
} from '@/types/streaming'

// Default configuration
const DEFAULT_CONFIG: Required<StreamConfig> = {
  debounceMs: 50,
  timeoutMs: 30000,
  retryAttempts: 3,
  retryDelayMs: 1000
}

export function useStreamingChat(config?: StreamConfig): UseStreamingChatReturn {
  const configuration = { ...DEFAULT_CONFIG, ...config }

  // State management
  const [messages, setMessages] = useState<StreamingMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamError, setStreamError] = useState<Error | null>(null)

  // Refs for cleanup and tracking
  const eventSourceRef = useRef<EventSource | null>(null)
  const activeStreamIdRef = useRef<string | null>(null)
  const retryCountRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Generate unique IDs
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  }, [])

  // Cleanup function
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    activeStreamIdRef.current = null
    setIsStreaming(false)
  }, [])

  // Handle stream completion
  const completeStream = useCallback((messageId: string, content: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, status: 'complete' as const, content, finalContent: content }
        : msg
    ))
    cleanup()
    setStreamError(null)
    retryCountRef.current = 0
  }, [cleanup])

  // Handle stream failure
  const failStream = useCallback((messageId: string, error: Error) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, status: 'failed' as const }
        : msg
    ))
    cleanup()
    setStreamError(error)
  }, [cleanup])

  // Update streaming message content
  const updateStreamingContent = useCallback((messageId: string, content: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, content, partialContent: content }
        : msg
    ))
  }, [])

  // Process stream events
  const processStreamEvent = useCallback((event: MessageEvent, messageId: string) => {
    try {
      const streamEvent: StreamEvent = JSON.parse(event.data)

      switch (streamEvent.type) {
        case 'chunk':
          if ('data' in streamEvent && streamEvent.data && typeof streamEvent.data === 'object') {
            const chunkData = streamEvent.data as any
            if (chunkData.content !== undefined) {
              updateStreamingContent(messageId, chunkData.content || '')
            }
          }
          break

        case 'complete':
          const currentMessage = messages.find(m => m.id === messageId)
          const finalContent = currentMessage?.content || ''
          completeStream(messageId, finalContent)
          break

        case 'error':
          if ('data' in streamEvent && streamEvent.data && typeof streamEvent.data === 'object') {
            const errorData = streamEvent.data as any
            const error = new Error(errorData.error || 'Stream error occurred')
            failStream(messageId, error)
          }
          break

        case 'heartbeat':
          // Keep connection alive, reset timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => {
              const error = new Error('Stream timeout')
              failStream(messageId, error)
            }, configuration.timeoutMs)
          }
          break

        default:
          // Ignore unknown event types
          console.warn('Unknown stream event type:', streamEvent.type)
          break
      }
    } catch (error) {
      console.warn('Failed to parse stream event:', error)
      // Don't fail the entire stream for parsing errors
    }
  }, [messages, updateStreamingContent, completeStream, failStream, configuration.timeoutMs])

  // Start streaming for a message
  const startStream = useCallback(async (messageId: string, allMessages: StreamingMessage[]) => {
    try {
      setIsStreaming(true)
      setStreamError(null)
      activeStreamIdRef.current = messageId

      // Prepare request payload
      const streamRequest: StreamRequest = {
        messages: allMessages.filter(m => m.status === 'complete').map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          status: m.status,
          timestamp: m.timestamp
        })),
        stream: true
      }

      // Make the streaming request using fetch
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(streamRequest)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      // Set up timeout
      timeoutRef.current = setTimeout(() => {
        const error = new Error('Stream timeout')
        failStream(messageId, error)
      }, configuration.timeoutMs)

      // Process the stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            // Stream completed successfully
            const currentMessage = messages.find(m => m.id === messageId)
            const finalContent = currentMessage?.content || ''
            completeStream(messageId, finalContent)
            break
          }

          // Decode and process the chunk
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (trimmedLine.startsWith('data: ')) {
              const data = trimmedLine.slice(6) // Remove 'data: ' prefix
              if (data) {
                try {
                  const event = { data } as MessageEvent
                  processStreamEvent(event, messageId)
                } catch (error) {
                  console.warn('Failed to process stream chunk:', error)
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

    } catch (error) {
      const streamError = error instanceof Error ? error : new Error('Unknown streaming error')
      failStream(messageId, streamError)
    }
  }, [processStreamEvent, failStream, completeStream, configuration.timeoutMs, messages])

  // Send message function
  const sendMessage = useCallback(async (content: string) => {
    const trimmedContent = content.trim()

    // Validate input
    if (!trimmedContent || isStreaming) {
      return
    }

    try {
      // Create user message
      const userMessage: StreamingMessage = {
        id: generateId(),
        role: 'user',
        content: trimmedContent,
        status: 'complete',
        timestamp: new Date()
      }

      // Create assistant message (streaming)
      const assistantMessage: StreamingMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        status: 'streaming',
        timestamp: new Date(),
        streamId: generateId(),
        partialContent: ''
      }

      // Update messages state
      const newMessages = [...messages, userMessage, assistantMessage]
      setMessages(newMessages)

      // Start streaming for the assistant message
      await startStream(assistantMessage.id, newMessages)

    } catch (error) {
      const streamError = error instanceof Error ? error : new Error('Failed to send message')
      setStreamError(streamError)
      setIsStreaming(false)
    }
  }, [messages, isStreaming, generateId, startStream])

  // Retry message function
  const retryMessage = useCallback(async (messageId: string) => {
    const message = messages.find(m => m.id === messageId)

    // Only retry assistant messages that failed
    if (!message || message.role !== 'assistant' || message.status !== 'failed') {
      return
    }

    // Reset message to streaming state
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, status: 'streaming' as const, content: '', partialContent: '' }
        : msg
    ))

    // Start streaming again
    await startStream(messageId, messages)
  }, [messages, startStream])

  // Cancel stream function
  const cancelStream = useCallback(() => {
    if (!isStreaming || !activeStreamIdRef.current) {
      return
    }

    const messageId = activeStreamIdRef.current
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, status: 'failed' as const }
        : msg
    ))

    cleanup()
  }, [isStreaming, cleanup])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return {
    messages,
    sendMessage,
    isStreaming,
    streamError,
    retryMessage,
    cancelStream
  }
}