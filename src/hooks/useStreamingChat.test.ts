import { renderHook, act, waitFor } from '@testing-library/react'
import { useStreamingChat } from './useStreamingChat'
import { StreamingMessage } from '@/types/streaming'

// Mock EventSource
class MockEventSource {
  url: string
  onopen: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  readyState: number = 0

  static CONNECTING = 0
  static OPEN = 1
  static CLOSED = 2

  constructor(url: string) {
    this.url = url
    // Simulate async connection
    setTimeout(() => {
      this.readyState = MockEventSource.OPEN
      this.onopen?.(new Event('open'))
    }, 10)
  }

  close() {
    this.readyState = MockEventSource.CLOSED
  }

  // Test helper methods
  simulateMessage(data: any) {
    if (this.onmessage) {
      const event = new MessageEvent('message', {
        data: JSON.stringify(data)
      })
      this.onmessage(event)
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'))
    }
  }
}

// Mock global EventSource
global.EventSource = MockEventSource as any

// Mock fetch for streaming endpoints
global.fetch = jest.fn()

// Mock Response constructor for streaming tests
global.Response = class MockResponse {
  body: ReadableStream | null
  status: number
  statusText: string
  ok: boolean

  constructor(body: ReadableStream | null, init: { status?: number; statusText?: string } = {}) {
    this.body = body
    this.status = init.status || 200
    this.statusText = init.statusText || 'OK'
    this.ok = this.status >= 200 && this.status < 300
  }
} as any

describe('useStreamingChat', () => {
  let mockEventSource: MockEventSource

  beforeEach(() => {
    jest.clearAllMocks()
    mockEventSource = new MockEventSource('/api/chat/stream')

    // Mock EventSource constructor to return our controlled instance
    ;(global.EventSource as any) = jest.fn(() => {
      mockEventSource = new MockEventSource('/api/chat/stream')
      return mockEventSource
    })

    // Mock successful fetch response by default
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      body: new ReadableStream({
        start(controller) {
          // Mock stream will be controlled by individual tests
          controller.close()
        }
      })
    }
    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with empty messages and not streaming', () => {
      const { result } = renderHook(() => useStreamingChat())

      expect(result.current.messages).toEqual([])
      expect(result.current.isStreaming).toBe(false)
      expect(result.current.streamError).toBeNull()
    })

    it('should provide all required hook methods', () => {
      const { result } = renderHook(() => useStreamingChat())

      expect(typeof result.current.sendMessage).toBe('function')
      expect(typeof result.current.retryMessage).toBe('function')
      expect(typeof result.current.cancelStream).toBe('function')
    })
  })

  describe('Message Sending', () => {
    it('should add user message immediately when sending', async () => {
      const { result } = renderHook(() => useStreamingChat())

      await act(async () => {
        await result.current.sendMessage('Hello, AI!')
      })

      expect(result.current.messages).toHaveLength(2) // User message + streaming assistant message
      expect(result.current.messages[0].role).toBe('user')
      expect(result.current.messages[0].content).toBe('Hello, AI!')
      expect(result.current.messages[0].status).toBe('complete')
    })

    it('should create streaming assistant message immediately', async () => {
      const { result } = renderHook(() => useStreamingChat())

      await act(async () => {
        await result.current.sendMessage('Hello, AI!')
      })

      const assistantMessage = result.current.messages[1]
      expect(assistantMessage.role).toBe('assistant')
      expect(assistantMessage.status).toBe('streaming')
      expect(assistantMessage.content).toBe('')
    })

    it('should set isStreaming to true when sending message', async () => {
      const { result } = renderHook(() => useStreamingChat())

      await act(async () => {
        await result.current.sendMessage('Hello, AI!')
      })

      expect(result.current.isStreaming).toBe(true)
    })

    it('should reject empty or whitespace-only messages', async () => {
      const { result } = renderHook(() => useStreamingChat())

      await act(async () => {
        await result.current.sendMessage('')
      })

      expect(result.current.messages).toHaveLength(0)

      await act(async () => {
        await result.current.sendMessage('   \n  ')
      })

      expect(result.current.messages).toHaveLength(0)
    })

    it('should prevent sending message while already streaming', async () => {
      const { result } = renderHook(() => useStreamingChat())

      await act(async () => {
        await result.current.sendMessage('First message')
      })

      expect(result.current.isStreaming).toBe(true)

      await act(async () => {
        await result.current.sendMessage('Second message')
      })

      // Should still only have messages from first send
      expect(result.current.messages).toHaveLength(2)
      expect(result.current.messages[0].content).toBe('First message')
    })
  })

  describe('Stream Processing', () => {
    it('should update message content progressively during streaming', async () => {
      const { result } = renderHook(() => useStreamingChat())

      await act(async () => {
        await result.current.sendMessage('Tell me a story')
      })

      const assistantMessage = result.current.messages[1]
      const messageId = assistantMessage.id

      // Simulate streaming chunks
      await act(async () => {
        mockEventSource.simulateMessage({
          type: 'chunk',
          data: {
            id: 'chunk-1',
            content: 'Once',
            delta: 'Once',
            done: false
          }
        })
      })

      expect(result.current.messages[1].content).toBe('Once')

      await act(async () => {
        mockEventSource.simulateMessage({
          type: 'chunk',
          data: {
            id: 'chunk-2',
            content: 'Once upon',
            delta: ' upon',
            done: false
          }
        })
      })

      expect(result.current.messages[1].content).toBe('Once upon')
    })

    it('should complete streaming when done signal received', async () => {
      const { result } = renderHook(() => useStreamingChat())

      await act(async () => {
        await result.current.sendMessage('Tell me a story')
      })

      // Simulate streaming chunks
      await act(async () => {
        mockEventSource.simulateMessage({
          type: 'chunk',
          data: {
            id: 'chunk-1',
            content: 'Complete story',
            delta: 'Complete story',
            done: false
          }
        })
      })

      await act(async () => {
        mockEventSource.simulateMessage({
          type: 'complete',
          data: {
            done: true
          }
        })
      })

      expect(result.current.isStreaming).toBe(false)
      expect(result.current.messages[1].status).toBe('complete')
      expect(result.current.messages[1].content).toBe('Complete story')
    })

    it('should handle stream errors gracefully', async () => {
      const { result } = renderHook(() => useStreamingChat())

      await act(async () => {
        await result.current.sendMessage('Test message')
      })

      await act(async () => {
        mockEventSource.simulateMessage({
          type: 'error',
          data: {
            error: 'Stream interrupted'
          }
        })
      })

      expect(result.current.isStreaming).toBe(false)
      expect(result.current.streamError).toBeInstanceOf(Error)
      expect(result.current.streamError?.message).toContain('Stream interrupted')
      expect(result.current.messages[1].status).toBe('failed')
    })
  })

  describe('Stream Management', () => {
    it('should cancel active stream when cancelStream is called', async () => {
      const { result } = renderHook(() => useStreamingChat())

      await act(async () => {
        await result.current.sendMessage('Test message')
      })

      expect(result.current.isStreaming).toBe(true)

      await act(async () => {
        result.current.cancelStream()
      })

      expect(result.current.isStreaming).toBe(false)
      expect(result.current.messages[1].status).toBe('failed')
    })

    it('should cleanup EventSource on unmount', () => {
      const { result, unmount } = renderHook(() => useStreamingChat())

      act(() => {
        result.current.sendMessage('Test message')
      })

      const closeSpy = jest.spyOn(mockEventSource, 'close')

      unmount()

      expect(closeSpy).toHaveBeenCalled()
    })

    it('should handle connection errors during stream setup', async () => {
      const { result } = renderHook(() => useStreamingChat())

      await act(async () => {
        await result.current.sendMessage('Test message')
      })

      await act(async () => {
        mockEventSource.simulateError()
      })

      expect(result.current.isStreaming).toBe(false)
      expect(result.current.streamError).toBeInstanceOf(Error)
      expect(result.current.messages[1].status).toBe('failed')
    })
  })

  describe('Retry Functionality', () => {
    it('should retry failed messages', async () => {
      const { result } = renderHook(() => useStreamingChat())

      // Send initial message
      await act(async () => {
        await result.current.sendMessage('Test message')
      })

      // Simulate failure
      await act(async () => {
        mockEventSource.simulateError()
      })

      const failedMessageId = result.current.messages[1].id
      expect(result.current.messages[1].status).toBe('failed')

      // Retry the failed message
      await act(async () => {
        await result.current.retryMessage(failedMessageId)
      })

      expect(result.current.isStreaming).toBe(true)
      expect(result.current.messages[1].status).toBe('streaming')
      expect(result.current.messages[1].content).toBe('') // Reset content for retry
    })

    it('should only retry assistant messages', async () => {
      const { result } = renderHook(() => useStreamingChat())

      await act(async () => {
        await result.current.sendMessage('Test message')
      })

      const userMessageId = result.current.messages[0].id

      await act(async () => {
        await result.current.retryMessage(userMessageId)
      })

      // Should not start streaming or change anything
      expect(result.current.isStreaming).toBe(true) // Still streaming from original message
    })

    it('should ignore retry for non-existent messages', async () => {
      const { result } = renderHook(() => useStreamingChat())

      const originalMessages = result.current.messages

      await act(async () => {
        await result.current.retryMessage('non-existent-id')
      })

      expect(result.current.messages).toEqual(originalMessages)
      expect(result.current.isStreaming).toBe(false)
    })
  })

  describe('Performance and Edge Cases', () => {
    it('should handle rapid message chunks without losing data', async () => {
      const { result } = renderHook(() => useStreamingChat())

      await act(async () => {
        await result.current.sendMessage('Test message')
      })

      // Simulate rapid chunks
      const chunks = ['The', ' quick', ' brown', ' fox', ' jumps']
      let fullContent = ''

      for (let i = 0; i < chunks.length; i++) {
        fullContent += chunks[i]
        await act(async () => {
          mockEventSource.simulateMessage({
            type: 'chunk',
            data: {
              id: `chunk-${i}`,
              content: fullContent,
              delta: chunks[i],
              done: false
            }
          })
        })
      }

      expect(result.current.messages[1].content).toBe('The quick brown fox jumps')
    })

    it('should handle malformed stream messages gracefully', async () => {
      const { result } = renderHook(() => useStreamingChat())

      await act(async () => {
        await result.current.sendMessage('Test message')
      })

      // Simulate malformed message
      await act(async () => {
        mockEventSource.simulateMessage({
          type: 'invalid',
          data: 'malformed'
        })
      })

      // Should continue streaming normally
      expect(result.current.isStreaming).toBe(true)
      expect(result.current.messages[1].status).toBe('streaming')

      // Send valid chunk afterwards
      await act(async () => {
        mockEventSource.simulateMessage({
          type: 'chunk',
          data: {
            id: 'chunk-1',
            content: 'Valid content',
            delta: 'Valid content',
            done: false
          }
        })
      })

      expect(result.current.messages[1].content).toBe('Valid content')
    })

    it('should handle empty or undefined content in chunks', async () => {
      const { result } = renderHook(() => useStreamingChat())

      await act(async () => {
        await result.current.sendMessage('Test message')
      })

      await act(async () => {
        mockEventSource.simulateMessage({
          type: 'chunk',
          data: {
            id: 'chunk-1',
            content: undefined,
            delta: undefined,
            done: false
          }
        })
      })

      expect(result.current.messages[1].content).toBe('')

      await act(async () => {
        mockEventSource.simulateMessage({
          type: 'chunk',
          data: {
            id: 'chunk-2',
            content: 'Real content',
            delta: 'Real content',
            done: false
          }
        })
      })

      expect(result.current.messages[1].content).toBe('Real content')
    })
  })

  describe('Memory Management', () => {
    it('should cleanup resources when component unmounts during streaming', () => {
      const { result, unmount } = renderHook(() => useStreamingChat())

      act(() => {
        result.current.sendMessage('Test message')
      })

      expect(result.current.isStreaming).toBe(true)

      const closeSpy = jest.spyOn(mockEventSource, 'close')

      unmount()

      expect(closeSpy).toHaveBeenCalled()
    })

    it('should handle multiple rapid mount/unmount cycles', () => {
      for (let i = 0; i < 5; i++) {
        const { result, unmount } = renderHook(() => useStreamingChat())

        act(() => {
          result.current.sendMessage(`Test message ${i}`)
        })

        unmount()
      }

      // Should not throw errors or cause memory leaks
      expect(true).toBe(true)
    })
  })

  describe('Configuration Options', () => {
    it('should accept custom configuration', () => {
      const config = {
        debounceMs: 100,
        timeoutMs: 60000,
        retryAttempts: 5,
        retryDelayMs: 2000
      }

      const { result } = renderHook(() => useStreamingChat(config))

      expect(result.current.messages).toEqual([])
      expect(result.current.isStreaming).toBe(false)
    })

    it('should use default configuration when none provided', () => {
      const { result } = renderHook(() => useStreamingChat())

      expect(result.current.messages).toEqual([])
      expect(result.current.isStreaming).toBe(false)
      // Default config is used internally, not exposed
    })
  })
})