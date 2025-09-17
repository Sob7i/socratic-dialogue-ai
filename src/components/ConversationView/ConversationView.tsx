'use client'

import React, { useEffect, useRef, memo } from 'react'
import { MessageBubble } from './MessageBubble'
import { MessageActions } from './MessageActions'
import { EmptyState } from './EmptyState'
import { TypingIndicator } from '@/components/ui/typing-indicator'

export interface Message {
	id: string
	role: 'user' | 'assistant'
	content: string
	status: 'complete' | 'streaming' | 'failed'
	timestamp: Date
}

export interface ConversationViewProps {
	messages: Message[]
	isLoading?: boolean
	onRetry?: (messageId: string) => void
	autoScroll?: boolean
	maxHeight?: string
	showMessageActions?: boolean
	onCopyMessage?: (messageId: string, content: string) => void
}

export function ConversationView({
	messages = [],
	isLoading = false,
	onRetry,
	autoScroll,
	maxHeight,
	showMessageActions = false,
	onCopyMessage,
}: ConversationViewProps) {
	const containerRef = useRef<HTMLDivElement>(null)

	// Auto-scroll functionality with streaming optimization
	useEffect(() => {
		if (autoScroll && containerRef.current) {
			const container = containerRef.current
			const isAtBottom =
				container.scrollHeight - container.scrollTop <=
				container.clientHeight + 10

			// Only auto-scroll if user hasn't manually scrolled up or if currently streaming
			const hasStreamingMessage = messages.some(
				(msg) => msg.status === 'streaming'
			)
			if (isAtBottom || container.scrollTop === 0 || hasStreamingMessage) {
				// Use requestAnimationFrame for smooth scrolling during streaming
				requestAnimationFrame(() => {
					container.scrollTop = container.scrollHeight
				})
			}
		}
	}, [messages, autoScroll])

	const formatTimestamp = (timestamp: Date) => {
		if (!timestamp || isNaN(timestamp.getTime())) {
			return ''
		}
		return timestamp.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	// Memoized message component for performance during streaming
	const MessageItem = memo(({ message }: { message: Message }) => {
		const role = message.role ?? 'user'
		const isUser = role === 'user'
		return (
			<div
				key={message.id}
				className={`flex w-full mb-4 ${
					isUser ? 'justify-end' : 'justify-start'
				}`}
				data-role={role}
				data-status={message.status}
			>
				<div
					className={`flex flex-col max-w-[70%] ${
						isUser ? 'items-end' : 'items-start'
					}`}
				>
					{/* Message bubble */}
					<MessageBubble message={message} />

					{/* Message metadata and actions */}
					<div
						className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${
							isUser ? 'flex-row-reverse' : 'flex-row'
						}`}
					>
						<time>{formatTimestamp(message.timestamp)}</time>
						<MessageActions
							message={message}
							showMessageActions={showMessageActions}
							onCopyMessage={onCopyMessage}
							onRetry={onRetry}
						/>
					</div>
				</div>
			</div>
		)
	})

	// Add display name for debugging
	MessageItem.displayName = 'MessageItem'

	// Generate dynamic class names and styles
	const containerClassName = [
		'conversation-view',
		maxHeight ? 'conversation-view--scrollable' : '',
	]
		.filter(Boolean)
		.join(' ')

	const containerStyle: React.CSSProperties = {
		...(maxHeight && { maxHeight, overflowY: 'auto' }),
	}

	return (
		<div
			ref={containerRef}
			className={`flex flex-col px-4 py-6 space-y-1 ${containerClassName}`}
			style={containerStyle}
			aria-label="Conversation messages"
			role="region"
			data-auto-scroll={autoScroll?.toString()}
		>
			{messages.length === 0 ? (
				<EmptyState />
			) : (
				messages.map((message) => (
					<MessageItem key={message.id} message={message} />
				))
			)}

			{isLoading && (
				<div
					data-testid="conversation-loading"
					aria-label="Loading conversation"
					className="flex justify-start mb-4"
				>
					<div className="max-w-[70%] px-4 py-2 rounded-2xl rounded-bl-sm bg-muted text-foreground text-sm">
						<TypingIndicator aria-label="Assistant is thinking" />
					</div>
				</div>
			)}
		</div>
	)
}