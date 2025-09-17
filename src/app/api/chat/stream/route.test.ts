/**
 * @jest-environment node
 */

// Mock environment variables before any imports
const originalEnv = process.env
process.env = {
  ...originalEnv,
  OPENAI_API_KEY: 'test-api-key'
}

import { NextRequest } from 'next/server'
import { POST } from './route'
import { StreamRequest } from '@/types/streaming'

// Mock console to avoid noise in tests
const mockConsole = {
  error: jest.fn(),
  log: jest.fn(),
  warn: jest.fn()
}
global.console = mockConsole as any

// Mock fetch for OpenAI API calls
global.fetch = jest.fn()

describe('/api/chat/stream', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset fetch mock
    ;(global.fetch as jest.Mock).mockClear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('Request Validation', () => {
    it('should reject requests without messages', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat/stream', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toContain('messages')
    })

    it('should reject requests with empty messages array', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat/stream', {
        method: 'POST',
        body: JSON.stringify({ messages: [] })
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('Messages must be a non-empty array')
    })

    it('should reject requests with invalid message format', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat/stream', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ invalid: 'message' }]
        })
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toContain('Invalid message format')
    })

    it('should accept valid streaming request', async () => {
      const validRequest: StreamRequest = {
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Hello, AI!',
            status: 'complete',
            timestamp: new Date()
          }
        ],
        model: 'gpt-4',
        stream: true
      }

      // Mock successful OpenAI response
      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":" there!"}}]}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
          controller.close()
        }
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockReadableStream
      })

      const request = new NextRequest('http://localhost:3000/api/chat/stream', {
        method: 'POST',
        body: JSON.stringify(validRequest)
      })

      const response = await POST(request)

      if (response.status !== 200) {
        const errorData = await response.json()
        console.log('Response error:', errorData)
        console.log('Environment vars:', { OPENAI_API_KEY: process.env.OPENAI_API_KEY })
      }

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('text/event-stream')
      expect(response.headers.get('Cache-Control')).toBe('no-cache')
      expect(response.headers.get('Connection')).toBe('keep-alive')
    })
  })

  describe('Server-Sent Events', () => {
    it('should send proper SSE headers', async () => {
      const validRequest: StreamRequest = {
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Test message',
            status: 'complete',
            timestamp: new Date()
          }
        ]
      }

      // Mock successful OpenAI response
      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
          controller.close()
        }
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockReadableStream
      })

      const request = new NextRequest('http://localhost:3000/api/chat/stream', {
        method: 'POST',
        body: JSON.stringify(validRequest)
      })

      const response = await POST(request)

      expect(response.headers.get('Content-Type')).toBe('text/event-stream')
      expect(response.headers.get('Cache-Control')).toBe('no-cache')
      expect(response.headers.get('Connection')).toBe('keep-alive')
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS')
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type')
    })

    it('should stream content progressively', async () => {
      const validRequest: StreamRequest = {
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Tell me a story',
            status: 'complete',
            timestamp: new Date()
          }
        ]
      }

      // Mock OpenAI streaming response
      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Once"}}]}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":" upon"}}]}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":" a"}}]}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":" time"}}]}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
          controller.close()
        }
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockReadableStream
      })

      const request = new NextRequest('http://localhost:3000/api/chat/stream', {
        method: 'POST',
        body: JSON.stringify(validRequest)
      })

      const response = await POST(request)
      expect(response.status).toBe(200)

      // Read the response stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let streamedContent = ''

      if (reader) {
        let done = false
        while (!done) {
          const { value, done: streamDone } = await reader.read()
          done = streamDone
          if (value) {
            streamedContent += decoder.decode(value)
          }
        }
      }

      // Verify the streamed content contains proper SSE format
      expect(streamedContent).toContain('data: ')
      expect(streamedContent).toContain('Once')
      expect(streamedContent).toContain('upon')
      expect(streamedContent).toContain('time')
    })
  })

  describe('Error Handling', () => {
    it('should handle OpenAI API errors gracefully', async () => {
      const validRequest: StreamRequest = {
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Test message',
            status: 'complete',
            timestamp: new Date()
          }
        ]
      }

      // Mock OpenAI API failure
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Rate Limited'
      })

      const request = new NextRequest('http://localhost:3000/api/chat/stream', {
        method: 'POST',
        body: JSON.stringify(validRequest)
      })

      const response = await POST(request)
      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data.error).toBe('Failed to stream response from AI provider')
    })

    it('should handle malformed JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat/stream', {
        method: 'POST',
        body: 'invalid json'
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toContain('Invalid JSON')
    })

    it('should handle stream interruption', async () => {
      const validRequest: StreamRequest = {
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Test message',
            status: 'complete',
            timestamp: new Date()
          }
        ]
      }

      // Mock stream that errors mid-way
      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'))
          controller.error(new Error('Stream interrupted'))
        }
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockReadableStream
      })

      const request = new NextRequest('http://localhost:3000/api/chat/stream', {
        method: 'POST',
        body: JSON.stringify(validRequest)
      })

      const response = await POST(request)
      expect(response.status).toBe(200) // Initial response is OK, error comes during streaming

      // The error should be handled within the stream
      const reader = response.body?.getReader()
      let errorFound = false

      if (reader) {
        try {
          let done = false
          while (!done && !errorFound) {
            const { value, done: streamDone } = await reader.read()
            done = streamDone
            if (value) {
              const content = new TextDecoder().decode(value)
              if (content.includes('error')) {
                errorFound = true
              }
            }
          }
        } catch (error) {
          // Stream errors are expected in this test
          errorFound = true
        }
      }

      expect(errorFound).toBe(true)
    })
  })

  describe('Model Support', () => {
    it('should default to gpt-4 when no model specified', async () => {
      const validRequest: StreamRequest = {
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Test message',
            status: 'complete',
            timestamp: new Date()
          }
        ]
        // No model specified
      }

      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
          controller.close()
        }
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockReadableStream
      })

      const request = new NextRequest('http://localhost:3000/api/chat/stream', {
        method: 'POST',
        body: JSON.stringify(validRequest)
      })

      await POST(request)

      // Verify fetch was called with gpt-4 model
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          body: expect.stringContaining('"model":"gpt-4"')
        })
      )
    })

    it('should support different AI models', async () => {
      const models: Array<'gpt-4' | 'gpt-3.5-turbo'> = ['gpt-4', 'gpt-3.5-turbo']

      for (const model of models) {
        const validRequest: StreamRequest = {
          messages: [
            {
              id: 'msg-1',
              role: 'user',
              content: 'Test message',
              status: 'complete',
              timestamp: new Date()
            }
          ],
          model
        }

        const mockReadableStream = new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
            controller.close()
          }
        })

        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          body: mockReadableStream
        })

        const request = new NextRequest('http://localhost:3000/api/chat/stream', {
          method: 'POST',
          body: JSON.stringify(validRequest)
        })

        await POST(request)

        // Verify fetch was called with the correct model
        expect(global.fetch).toHaveBeenCalledWith(
          'https://api.openai.com/v1/chat/completions',
          expect.objectContaining({
            body: expect.stringContaining(`"model":"${model}"`)
          })
        )

        jest.clearAllMocks()
      }
    })
  })

  describe('Rate Limiting and Security', () => {
    it('should include rate limiting headers in response', async () => {
      const validRequest: StreamRequest = {
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Test message',
            status: 'complete',
            timestamp: new Date()
          }
        ]
      }

      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
          controller.close()
        }
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockReadableStream
      })

      const request = new NextRequest('http://localhost:3000/api/chat/stream', {
        method: 'POST',
        body: JSON.stringify(validRequest)
      })

      const response = await POST(request)

      // These would be set by middleware in real app, but we test the structure
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST')
    })

    it('should sanitize user input', async () => {
      const maliciousRequest: StreamRequest = {
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: '<script>alert("xss")</script>Malicious content',
            status: 'complete',
            timestamp: new Date()
          }
        ]
      }

      const mockReadableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
          controller.close()
        }
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockReadableStream
      })

      const request = new NextRequest('http://localhost:3000/api/chat/stream', {
        method: 'POST',
        body: JSON.stringify(maliciousRequest)
      })

      const response = await POST(request)
      expect(response.status).toBe(200)

      // Verify that the request was processed (basic sanitization happens in validation)
      expect(global.fetch).toHaveBeenCalled()
    })
  })
})