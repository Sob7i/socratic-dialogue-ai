/**
 * @jest-environment node
 */

import { POST } from './route'

// Add global polyfills for Node.js environment
global.Request = Request
global.Response = Response

// Mock the AI SDK functions
jest.mock('ai', () => ({
	streamText: jest.fn(),
	convertToModelMessages: jest.fn(),
}))

jest.mock('@ai-sdk/openai', () => ({
	openai: jest.fn(),
}))

// Import mocked functions
import { streamText, convertToModelMessages } from 'ai'
import { openai } from '@ai-sdk/openai'

const mockStreamText = streamText as jest.MockedFunction<typeof streamText>
const mockConvertToModelMessages = convertToModelMessages as jest.MockedFunction<typeof convertToModelMessages>
const mockOpenai = openai as jest.MockedFunction<typeof openai>

// Mock environment variables
const originalEnv = process.env

describe('/api/chat route', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		process.env = { ...originalEnv, OPENAI_API_KEY: 'test-api-key' }
	})

	afterEach(() => {
		process.env = originalEnv
	})

	describe('POST method', () => {
		it('should return 400 when messages array is missing', async () => {
			const request = new Request('http://localhost/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({}),
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data.error).toBe('Messages array is required and cannot be empty')
		})

		it('should return 400 when messages array is empty', async () => {
			const request = new Request('http://localhost/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: [] }),
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data.error).toBe('Messages array is required and cannot be empty')
		})

		it('should return 400 when messages is not an array', async () => {
			const request = new Request('http://localhost/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: 'not-an-array' }),
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(400)
			expect(data.error).toBe('Messages array is required and cannot be empty')
		})

		it('should return 500 when OpenAI API key is not configured', async () => {
			process.env = { ...originalEnv }
			delete process.env.OPENAI_API_KEY

			const request = new Request('http://localhost/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: [{ role: 'user', content: 'test' }] }),
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(500)
			expect(data.error).toBe('OpenAI API key not configured')
		})

		it('should process valid messages and return stream response', async () => {
			const testMessages = [
				{ id: '1', role: 'user', content: 'Hello', timestamp: new Date() }
			]
			const mockModelMessages = [
				{ role: 'user', content: 'Hello' }
			]
			const mockStreamResponse = {
				toTextStreamResponse: jest.fn().mockReturnValue(new Response('stream')),
			}

			mockConvertToModelMessages.mockReturnValue(mockModelMessages)
			mockOpenai.mockReturnValue('mock-model')
			mockStreamText.mockResolvedValue(mockStreamResponse as any)

			const request = new Request('http://localhost/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: testMessages }),
			})

			const response = await POST(request)

			expect(mockConvertToModelMessages).toHaveBeenCalledWith(testMessages)
			expect(mockOpenai).toHaveBeenCalledWith('gpt-4o-mini')
			expect(mockStreamText).toHaveBeenCalledWith({
				model: 'mock-model',
				system: expect.stringContaining('You are a Socratic tutor'),
				messages: mockModelMessages,
			})
			expect(mockStreamResponse.toTextStreamResponse).toHaveBeenCalled()
		})

		it('should handle streamText errors gracefully', async () => {
			const testMessages = [
				{ id: '1', role: 'user', content: 'Hello', timestamp: new Date() }
			]
			const mockModelMessages = [
				{ role: 'user', content: 'Hello' }
			]

			mockConvertToModelMessages.mockReturnValue(mockModelMessages)
			mockOpenai.mockReturnValue('mock-model')
			mockStreamText.mockRejectedValue(new Error('API Error'))

			const request = new Request('http://localhost/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: testMessages }),
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(500)
			expect(data.error).toBe('Failed to process chat request')
		})

		it('should handle JSON parsing errors', async () => {
			const request = new Request('http://localhost/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: 'invalid-json',
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(500)
			expect(data.error).toBe('Failed to process chat request')
		})

		it('should include correct Socratic tutor system prompt', async () => {
			const testMessages = [
				{ id: '1', role: 'user', content: 'Test question', timestamp: new Date() }
			]
			const mockModelMessages = [
				{ role: 'user', content: 'Test question' }
			]
			const mockStreamResponse = {
				toTextStreamResponse: jest.fn().mockReturnValue(new Response('stream')),
			}

			mockConvertToModelMessages.mockReturnValue(mockModelMessages)
			mockOpenai.mockReturnValue('mock-model')
			mockStreamText.mockResolvedValue(mockStreamResponse as any)

			const request = new Request('http://localhost/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: testMessages }),
			})

			await POST(request)

			expect(mockStreamText).toHaveBeenCalledWith({
				model: 'mock-model',
				system: expect.stringMatching(/You are a Socratic tutor.*Ask probing questions.*Guide users to discover answers/s),
				messages: mockModelMessages,
			})
		})
	})
})