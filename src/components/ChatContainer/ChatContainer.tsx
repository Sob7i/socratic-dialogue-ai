'use client'

import React, { useCallback } from 'react'
import { ConversationView, Message } from '../ConversationView'
import { MessageInput } from '../MessageInput'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

export interface ChatContainerProps {
	conversationId?: string
	initialMessages?: Message[]
	autoScroll?: boolean
	maxHeight?: string
	showMessageActions?: boolean
	onMessageSent?: (message: Message) => void
	onRetry?: (messageId: string) => void
	onCopyMessage?: (messageId: string, content: string) => void
	onError?: (error: Error) => void
}

export function ChatContainer({
	conversationId,
	initialMessages = [],
	autoScroll = true,
	maxHeight,
	showMessageActions = false,
	onMessageSent,
	onRetry,
	onCopyMessage,
	onError,
}: ChatContainerProps) {
	// Use AI SDK's useChat hook
	const {
		messages: aiMessages,
		sendMessage,
		status,
		error,
		regenerate,
		stop,
	} = useChat({
		transport: new DefaultChatTransport({ api: '/api/chat' }),
		messages: initialMessages?.map((msg) => ({
			id: msg.id,
			role: msg.role,
			parts: [{ type: 'text' as const, text: msg.content }],
			createdAt: msg.timestamp,
		})),
	})

	// Convert AI SDK messages to our format for compatibility
	const isLoading = status === 'streaming'
	const messages = aiMessages.map((msg: any) => {
		const textPart = msg.parts?.find((part: any) => part.type === 'text')

		return {
			id: msg.id,
			role: msg.role as 'user' | 'assistant',
			content: textPart?.text || '',
			status:
				isLoading && msg === aiMessages[aiMessages.length - 1]
					? ('streaming' as const)
					: error
					? ('failed' as const)
					: ('complete' as const),
			timestamp: msg.createdAt || new Date(),
		}
	})

	const isProcessing = isLoading

	// Handle streaming errors
	React.useEffect(() => {
		if (error && onError) {
			onError(error)
		}
	}, [error, onError])

	// Handle retry functionality
	const handleRetry = useCallback(
		async (messageId: string) => {
			try {
				// Use AI SDK's regenerate function to retry
				regenerate()

				// Also call parent's onRetry if provided
				onRetry?.(messageId)
			} catch (error) {
				console.error('Error retrying message:', error)
				onError?.(error as Error)
			}
		},
		[regenerate, onRetry, onError]
	)

	// Handle copy message functionality
	const handleCopyMessage = useCallback(
		async (messageId: string, content: string) => {
			try {
				if (navigator.clipboard && window.isSecureContext) {
					await navigator.clipboard.writeText(content)
				} else {
					// Fallback for older browsers
					const textArea = document.createElement('textarea')
					textArea.value = content
					textArea.style.position = 'fixed'
					textArea.style.opacity = '0'
					document.body.appendChild(textArea)
					textArea.select()
					try {
						// Use deprecated method as fallback only
						document.execCommand('copy')
					} finally {
						document.body.removeChild(textArea)
					}
				}

				onCopyMessage?.(messageId, content)
			} catch (error) {
				console.error('Error copying message:', error)
				onError?.(error as Error)
			}
		},
		[onCopyMessage, onError]
	)

	return (
		<div
			className="flex flex-col h-full max-w-4xl mx-auto w-full"
			data-testid="chat-container"
			data-conversation-id={conversationId}
			role="region"
			aria-label="Chat conversation interface"
		>
			{/* Conversation Area */}
			<div className="flex-1 overflow-hidden">
				<ConversationView
					messages={messages}
					isLoading={isProcessing}
					onRetry={onRetry ? handleRetry : undefined}
					autoScroll={autoScroll}
					maxHeight={maxHeight}
					showMessageActions={showMessageActions}
					onCopyMessage={showMessageActions ? handleCopyMessage : undefined}
				/>
			</div>

			{/* Input Area - Fixed to bottom */}
			<div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<MessageInput
					onSendMessage={(content: string) => sendMessage({ text: content })}
					isDisabled={isProcessing}
					placeholder="Type your message..."
					multiline={true}
					showCharCount={true}
					maxLength={2000}
					onCancelStream={isLoading ? stop : undefined}
				/>
			</div>
		</div>
	)
}
