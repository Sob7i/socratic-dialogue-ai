import React from 'react'

interface EmptyStateProps {
	message?: string
	className?: string
}

export function EmptyState({
	message = 'Start a conversation...',
	className = '',
}: EmptyStateProps) {
	return (
		<div
			className={`flex items-center justify-center h-32 text-muted-foreground text-sm ${className}`}
		>
			{message}
		</div>
	)
}