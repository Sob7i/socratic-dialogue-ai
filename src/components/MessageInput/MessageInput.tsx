import React, {
	useState,
	useRef,
	useEffect,
	KeyboardEvent,
	ChangeEvent,
} from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, X } from 'lucide-react'

export interface MessageInputProps {
	onSendMessage: (content: string) => void
	isDisabled?: boolean
	placeholder?: string
	maxLength?: number
	multiline?: boolean
	showCharCount?: boolean
	onCancelStream?: () => void
}

export function MessageInput({
	onSendMessage,
	isDisabled = false,
	placeholder = 'Enter your message...',
	maxLength = 2000,
	multiline = false,
	showCharCount = false,
	onCancelStream,
}: MessageInputProps) {
	const [value, setValue] = useState('')
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const trimmedValue = value.trim()
	const isSendDisabled = isDisabled || trimmedValue.length === 0
	const currentLength = value.length
	const isNearLimit = maxLength && currentLength >= maxLength * 0.8
	const isAtLimit = maxLength && currentLength >= maxLength

	// Auto-resize functionality for multiline
	useEffect(() => {
		if (multiline && textareaRef.current) {
			const textarea = textareaRef.current
			textarea.style.height = 'auto'
			textarea.style.height = `${textarea.scrollHeight}px`
		}
	}, [value, multiline])

	const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = event.target.value

		// Enforce maxLength
		if (maxLength && newValue.length > maxLength) {
			return
		}

		setValue(newValue)
	}

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (isDisabled) {
			event.preventDefault()
			return
		}

		const { key, shiftKey, ctrlKey, metaKey } = event

		if (key === 'Enter') {
			// Shift+Enter creates new line
			if (shiftKey) {
				return // Allow default behavior (new line)
			}

			// Ctrl+Enter or Cmd+Enter (Mac) sends message
			if (ctrlKey || metaKey) {
				event.preventDefault()
				handleSendMessage()
				return
			}

			// Plain Enter sends message
			event.preventDefault()
			handleSendMessage()
		}
	}

	const handleSendMessage = () => {
		if (isSendDisabled) {
			return
		}

		const messageContent = trimmedValue
		if (messageContent) {
			onSendMessage(messageContent)
			setValue('')
		}
	}

	const getCharCountClassName = () => {
		if (isAtLimit) return 'text-destructive'
		if (isNearLimit) return 'text-orange-500'
		return 'text-muted-foreground'
	}

	return (
		<div className="flex w-full max-w-4xl mx-auto p-4 gap-2 items-end">
			<div className="flex-1 relative">
				<Textarea
					ref={textareaRef}
					className="min-h-[2.5rem] max-h-32 pr-12 resize-none"
					value={value}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={isDisabled}
					rows={1}
					tabIndex={0}
					aria-label="Enter your message"
					maxLength={maxLength}
				/>

				{/* Show cancel button when streaming, send button otherwise */}
				{onCancelStream ? (
					<Button
						className="absolute right-2 bottom-2 h-8 w-8 p-0"
						onClick={onCancelStream}
						type="button"
						tabIndex={0}
						aria-label="Cancel streaming"
						size="icon"
						variant="destructive"
					>
						<X className="h-4 w-4" />
					</Button>
				) : (
					<Button
						className="absolute right-2 bottom-2 h-8 w-8 p-0"
						onClick={handleSendMessage}
						disabled={isSendDisabled}
						type="button"
						tabIndex={0}
						aria-label="Send message"
						size="icon"
						variant={isSendDisabled ? "ghost" : "default"}
					>
						<Send className="h-4 w-4" />
					</Button>
				)}
			</div>

			{(showCharCount && maxLength) || isDisabled ? (
				<div className="flex justify-between items-center text-xs text-muted-foreground mt-2 px-2">
					{showCharCount && maxLength && (
						<span
							className={getCharCountClassName()}
							aria-live="polite"
							aria-label={`Character count: ${currentLength} of ${maxLength}`}
						>
							{currentLength}/{maxLength}
						</span>
					)}

					{isDisabled && (
						<span className="text-primary" aria-live="polite">
							Sending...
						</span>
					)}
				</div>
			) : null}
		</div>
	)
}

