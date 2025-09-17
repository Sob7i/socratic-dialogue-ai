import React from 'react'
import { cn } from '@/lib/utils'

interface TypingIndicatorProps {
	className?: string
	size?: 'sm' | 'md' | 'lg'
	'aria-label'?: string
}

export function TypingIndicator({
	className,
	size = 'md',
	'aria-label': ariaLabel = 'Typing indicator',
}: TypingIndicatorProps) {
	const sizeClasses = {
		sm: 'w-1 h-1',
		md: 'w-2 h-2',
		lg: 'w-3 h-3',
	}

	const spaceClasses = {
		sm: 'space-x-0.5',
		md: 'space-x-1',
		lg: 'space-x-1.5',
	}

	return (
		<div
			data-testid="typing-indicator"
			aria-label={ariaLabel}
			role="status"
			className={cn('inline-flex items-center', spaceClasses[size], className)}
		>
			<div className={cn('flex', spaceClasses[size])}>
				<div
					className={cn(
						sizeClasses[size],
						'bg-current rounded-full animate-bounce [animation-delay:-0.3s]'
					)}
				/>
				<div
					className={cn(
						sizeClasses[size],
						'bg-current rounded-full animate-bounce [animation-delay:-0.15s]'
					)}
				/>
				<div
					className={cn(
						sizeClasses[size],
						'bg-current rounded-full animate-bounce'
					)}
				/>
			</div>
		</div>
	)
}