import { streamText, convertToModelMessages } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
	try {
		const { messages } = await req.json()

		// Validate messages
		if (!messages || !Array.isArray(messages) || messages.length === 0) {
			return Response.json(
				{ error: 'Messages array is required and cannot be empty' },
				{ status: 400 }
			)
		}

		// Check for OpenAI API key
		if (!process.env.OPENAI_API_KEY) {
			return Response.json(
				{ error: 'OpenAI API key not configured' },
				{ status: 500 }
			)
		}

		// Convert UIMessages to ModelMessages using the correct v5 function
		const modelMessages = convertToModelMessages(messages)
		const result = streamText({
			model: openai('gpt-4o-mini'),
			system: `You are a Socratic tutor. Your role is to guide users to discover insights through thoughtful questions rather than providing direct answers.

Key principles:
- Ask probing questions that help users think deeper
- Guide users to discover answers themselves
- Be encouraging and supportive
- Ask one question at a time
- Build on the user's responses
- Help users explore different perspectives

Always respond in a conversational, engaging manner that encourages further exploration of the topic.`,
			messages: modelMessages,
		})

		return result.toTextStreamResponse()
	} catch (error) {
		console.error('Error in chat API:', error)
		return Response.json(
			{ error: 'Failed to process chat request' },
			{ status: 500 }
		)
	}
}
