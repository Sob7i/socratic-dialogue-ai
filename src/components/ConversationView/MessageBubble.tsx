import React from 'react'
import { Message } from './ConversationView'
import { TypingIndicator } from '@/components/ui/typing-indicator'

interface MessageBubbleProps {
	message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
	const content = message.content ?? ''
	const role = message.role ?? 'user'
	const status = message.status ?? 'complete'
	const isUser = role === 'user'

	return (
		<article
			className={`
        px-4 py-2 rounded-2xl text-sm
        ${
					isUser
						? 'bg-primary text-primary-foreground rounded-br-sm'
						: 'bg-muted text-foreground rounded-bl-sm'
				}
        ${status === 'failed' ? 'ring-2 ring-destructive' : ''}
      `}
			aria-label={`${isUser ? 'User' : 'Assistant'} message`}
		>
			<div className="whitespace-pre-wrap break-words">
				{status === 'failed' ? (
					<div className="text-destructive">
						<div className="flex items-center gap-2 mb-2">
							<span className="text-sm font-medium">⚠️ Failed to send message</span>
						</div>
						{content && (
							<div className="text-xs opacity-75 italic">
								Original message: &ldquo;{content}&rdquo;
							</div>
						)}
						<div className="text-xs opacity-75 mt-1">
							Please try again or check your connection.
						</div>
					</div>
				) : (
					<>
						{content}
						{status === 'streaming' && (
							<span className="ml-2">
								<TypingIndicator aria-label="Assistant is typing" size="sm" />
							</span>
						)}
					</>
				)}
			</div>
		</article>
	)
}