import { NextRequest, NextResponse } from 'next/server'
import { StreamRequest, StreamChunk, OpenAIStreamResponse } from '@/types/streaming'
import { Message } from '@/components/ConversationView'

// Environment variables validation helper
function getOpenAIKey(): string | undefined {
  return process.env.OPENAI_API_KEY
}

// Request validation helper
function validateStreamRequest(body: any): { isValid: boolean; error?: string } {
  if (!body.messages) {
    return { isValid: false, error: 'Missing required field: messages' }
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return { isValid: false, error: 'Messages must be a non-empty array' }
  }

  // Validate message format
  for (const message of body.messages) {
    if (!message.id || !message.role || !message.content) {
      return { isValid: false, error: 'Invalid message format: missing id, role, or content' }
    }

    if (!['user', 'assistant'].includes(message.role)) {
      return { isValid: false, error: 'Invalid message role: must be "user" or "assistant"' }
    }

    // Basic content sanitization check
    if (typeof message.content !== 'string') {
      return { isValid: false, error: 'Message content must be a string' }
    }
  }

  return { isValid: true }
}

// Convert our Message format to OpenAI format
function convertToOpenAIMessages(messages: Message[]): Array<{ role: string; content: string }> {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }))
}

// Stream chunk parser for OpenAI responses
function parseOpenAIChunk(chunk: string): StreamChunk | null {
  try {
    // Handle the [DONE] signal
    if (chunk.trim() === '[DONE]') {
      return {
        id: 'done',
        content: '',
        delta: '',
        done: true
      }
    }

    const data: OpenAIStreamResponse = JSON.parse(chunk)

    if (data.choices && data.choices[0] && data.choices[0].delta) {
      const delta = data.choices[0].delta.content || ''
      const isFinished = data.choices[0].finish_reason !== null

      return {
        id: Date.now().toString(),
        content: delta, // This will be accumulated on the client side
        delta: delta,
        done: isFinished
      }
    }

    return null
  } catch (error) {
    console.error('Error parsing OpenAI chunk:', error)
    return null
  }
}

// Main streaming function
async function streamFromOpenAI(messages: Message[], model: string): Promise<ReadableStream> {
  const openAIMessages = convertToOpenAIMessages(messages)

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: model,
      messages: openAIMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2048
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
  }

  if (!response.body) {
    throw new Error('No response body from OpenAI')
  }

  // Transform the OpenAI stream into our SSE format
  return new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      try {
        // Send initial heartbeat
        controller.enqueue(new TextEncoder().encode('data: {"type":"heartbeat","data":{"heartbeat":' + Date.now() + '}}\n\n'))

        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            // Send completion signal
            controller.enqueue(new TextEncoder().encode('data: {"type":"complete","data":{"done":true}}\n\n'))
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer

          for (const line of lines) {
            const trimmedLine = line.trim()

            if (trimmedLine.startsWith('data: ')) {
              const chunkData = trimmedLine.slice(6) // Remove 'data: ' prefix

              if (chunkData === '[DONE]') {
                controller.enqueue(new TextEncoder().encode('data: {"type":"complete","data":{"done":true}}\n\n'))
                controller.close()
                return
              }

              const streamChunk = parseOpenAIChunk(chunkData)
              if (streamChunk && streamChunk.delta) {
                // Send the chunk in our SSE format
                const sseData = {
                  type: 'chunk',
                  data: streamChunk
                }
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(sseData)}\n\n`))
              }
            }
          }
        }
      } catch (error) {
        console.error('Streaming error:', error)
        // Send error to client
        const errorData = {
          type: 'error',
          data: { error: error instanceof Error ? error.message : 'Unknown streaming error' }
        }
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(errorData)}\n\n`))
        controller.close()
      } finally {
        reader.releaseLock()
      }
    },

    cancel() {
      // Clean up resources when stream is cancelled
      console.log('Stream cancelled by client')
    }
  })
}

// POST handler for streaming chat
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: StreamRequest
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Validate request
    const validation = validateStreamRequest(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Check if API key is available
    const OPENAI_API_KEY = getOpenAIKey()
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Default model if not specified
    const model = body.model || 'gpt-4'

    try {
      // Create the streaming response
      const stream = await streamFromOpenAI(body.messages, model)

      // Return streaming response with proper headers
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    } catch (error) {
      console.error('Failed to create stream:', error)
      return NextResponse.json(
        { error: 'Failed to stream response from AI provider' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Unexpected error in streaming API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}