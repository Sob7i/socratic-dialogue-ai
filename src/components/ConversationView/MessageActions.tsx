import React from 'react'
import { Button } from '@/components/ui/button'
import { Copy, RotateCcw } from 'lucide-react'
import { Message } from './ConversationView'

interface MessageActionsProps {
	message: Message
	showMessageActions: boolean
	onCopyMessage?: (messageId: string, content: string) => void
	onRetry?: (messageId: string) => void
}

export function MessageActions({
	message,
	showMessageActions,
	onCopyMessage,
	onRetry,
}: MessageActionsProps) {
	const { id, content, status } = message

	// Don't show actions if not needed
	if (
		!(showMessageActions && status === 'complete' && onCopyMessage) &&
		!(status === 'failed' && onRetry)
	) {
		return null
	}

	return (
		<div className="flex items-center gap-1">
			{showMessageActions && status === 'complete' && onCopyMessage && (
				<Button
					variant="ghost"
					size="sm"
					className="h-6 w-6 p-0 hover:bg-accent"
					onClick={() => onCopyMessage(id, content)}
					aria-label={`Copy message: ${content.substring(0, 50)}`}
				>
					<Copy className="h-3 w-3" />
				</Button>
			)}
			{status === 'failed' && onRetry && (
				<Button
					variant="ghost"
					size="sm"
					className="h-6 w-6 p-0 hover:bg-accent text-destructive hover:text-destructive"
					onClick={() => onRetry(id)}
					aria-label={`Retry message: ${content.substring(0, 50)}`}
				>
					<RotateCcw className="h-3 w-3" />
				</Button>
			)}
		</div>
	)
}