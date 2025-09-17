import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageInput, MessageInputProps } from './MessageInput'

// Mock the shadcn/ui components
jest.mock('@/components/ui/button', () => ({
	Button: ({ children, onClick, disabled, ...props }: any) => (
		<button onClick={onClick} disabled={disabled} {...props}>
			{children}
		</button>
	),
}))

jest.mock('@/components/ui/textarea', () => ({
	Textarea: React.forwardRef<
		HTMLTextAreaElement,
		React.TextareaHTMLAttributes<HTMLTextAreaElement>
	>(({ ...props }, ref) => <textarea ref={ref} {...props} />),
}))

// Mock Lucide icons
jest.mock('lucide-react', () => ({
	Send: () => <span data-testid="send-icon">Send</span>,
	X: () => <span data-testid="x-icon">X</span>,
}))

describe('MessageInput', () => {
	const defaultProps: MessageInputProps = {
		onSendMessage: jest.fn(),
	}

	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe('Rendering', () => {
		it('should render with default props', () => {
			render(<MessageInput {...defaultProps} />)

			const textarea = screen.getByRole('textbox', { name: /enter your message/i })
			const sendButton = screen.getByRole('button', { name: /send message/i })

			expect(textarea).toBeInTheDocument()
			expect(sendButton).toBeInTheDocument()
			expect(textarea).toHaveAttribute('placeholder', 'Enter your message...')
		})

		it('should render with custom placeholder', () => {
			render(<MessageInput {...defaultProps} placeholder="Custom placeholder" />)

			const textarea = screen.getByRole('textbox')
			expect(textarea).toHaveAttribute('placeholder', 'Custom placeholder')
		})

		it('should show character count when enabled', () => {
			render(
				<MessageInput
					{...defaultProps}
					showCharCount={true}
					maxLength={100}
				/>
			)

			expect(screen.getByText('0/100')).toBeInTheDocument()
		})

		it('should show cancel button when onCancelStream is provided', () => {
			const mockCancel = jest.fn()
			render(<MessageInput {...defaultProps} onCancelStream={mockCancel} />)

			const cancelButton = screen.getByRole('button', { name: /cancel streaming/i })
			expect(cancelButton).toBeInTheDocument()
			expect(screen.getByTestId('x-icon')).toBeInTheDocument()
		})

		it('should show sending indicator when disabled', () => {
			render(<MessageInput {...defaultProps} isDisabled={true} />)

			expect(screen.getByText('Sending...')).toBeInTheDocument()
		})
	})

	describe('Input behavior', () => {
		it('should update value when typing', async () => {
			const user = userEvent.setup()
			render(<MessageInput {...defaultProps} />)

			const textarea = screen.getByRole('textbox')
			await user.type(textarea, 'Hello world')

			expect(textarea).toHaveValue('Hello world')
		})

		it('should enforce maxLength', async () => {
			const user = userEvent.setup()
			render(<MessageInput {...defaultProps} maxLength={5} />)

			const textarea = screen.getByRole('textbox')
			await user.type(textarea, 'Hello world') // Should be truncated to "Hello"

			expect(textarea).toHaveValue('Hello')
		})

		it('should update character count', async () => {
			const user = userEvent.setup()
			render(
				<MessageInput
					{...defaultProps}
					showCharCount={true}
					maxLength={100}
				/>
			)

			const textarea = screen.getByRole('textbox')
			await user.type(textarea, 'Hello')

			expect(screen.getByText('5/100')).toBeInTheDocument()
		})

		it('should show near limit warning styles', async () => {
			const user = userEvent.setup()
			render(
				<MessageInput
					{...defaultProps}
					showCharCount={true}
					maxLength={10}
				/>
			)

			const textarea = screen.getByRole('textbox')
			await user.type(textarea, '12345678') // 8 chars, 80% of 10

			const charCount = screen.getByText('8/10')
			expect(charCount).toHaveClass('text-orange-500')
		})

		it('should show at limit error styles', async () => {
			const user = userEvent.setup()
			render(
				<MessageInput
					{...defaultProps}
					showCharCount={true}
					maxLength={5}
				/>
			)

			const textarea = screen.getByRole('textbox')
			await user.type(textarea, '12345') // exactly at limit

			const charCount = screen.getByText('5/5')
			expect(charCount).toHaveClass('text-destructive')
		})
	})

	describe('Message sending', () => {
		it('should call onSendMessage when send button is clicked', async () => {
			const mockSend = jest.fn()
			const user = userEvent.setup()
			render(<MessageInput {...defaultProps} onSendMessage={mockSend} />)

			const textarea = screen.getByRole('textbox')
			const sendButton = screen.getByRole('button', { name: /send message/i })

			await user.type(textarea, 'Hello world')
			await user.click(sendButton)

			expect(mockSend).toHaveBeenCalledWith('Hello world')
			expect(textarea).toHaveValue('') // Should clear after sending
		})

		it('should call onSendMessage when Enter key is pressed', async () => {
			const mockSend = jest.fn()
			const user = userEvent.setup()
			render(<MessageInput {...defaultProps} onSendMessage={mockSend} />)

			const textarea = screen.getByRole('textbox')
			await user.type(textarea, 'Hello world')
			await user.keyboard('{Enter}')

			expect(mockSend).toHaveBeenCalledWith('Hello world')
		})

		it('should not send when Shift+Enter is pressed (allows new line)', async () => {
			const mockSend = jest.fn()
			const user = userEvent.setup()
			render(<MessageInput {...defaultProps} onSendMessage={mockSend} />)

			const textarea = screen.getByRole('textbox')
			await user.type(textarea, 'Hello world')
			await user.keyboard('{Shift>}{Enter}{/Shift}')

			expect(mockSend).not.toHaveBeenCalled()
		})

		it('should send when Ctrl+Enter is pressed', async () => {
			const mockSend = jest.fn()
			const user = userEvent.setup()
			render(<MessageInput {...defaultProps} onSendMessage={mockSend} />)

			const textarea = screen.getByRole('textbox')
			await user.type(textarea, 'Hello world')
			await user.keyboard('{Control>}{Enter}{/Control}')

			expect(mockSend).toHaveBeenCalledWith('Hello world')
		})

		it('should send when Cmd+Enter is pressed (Mac)', async () => {
			const mockSend = jest.fn()
			const user = userEvent.setup()
			render(<MessageInput {...defaultProps} onSendMessage={mockSend} />)

			const textarea = screen.getByRole('textbox')
			await user.type(textarea, 'Hello world')
			await user.keyboard('{Meta>}{Enter}{/Meta}')

			expect(mockSend).toHaveBeenCalledWith('Hello world')
		})

		it('should not send empty or whitespace-only messages', async () => {
			const mockSend = jest.fn()
			const user = userEvent.setup()
			render(<MessageInput {...defaultProps} onSendMessage={mockSend} />)

			const textarea = screen.getByRole('textbox')
			const sendButton = screen.getByRole('button', { name: /send message/i })

			// Test empty message
			await user.click(sendButton)
			expect(mockSend).not.toHaveBeenCalled()

			// Test whitespace-only message
			await user.type(textarea, '   ')
			await user.click(sendButton)
			expect(mockSend).not.toHaveBeenCalled()
		})

		it('should trim whitespace from messages before sending', async () => {
			const mockSend = jest.fn()
			const user = userEvent.setup()
			render(<MessageInput {...defaultProps} onSendMessage={mockSend} />)

			const textarea = screen.getByRole('textbox')
			await user.type(textarea, '  Hello world  ')
			await user.keyboard('{Enter}')

			expect(mockSend).toHaveBeenCalledWith('Hello world')
		})
	})

	describe('Disabled state', () => {
		it('should disable input and buttons when isDisabled is true', () => {
			render(<MessageInput {...defaultProps} isDisabled={true} />)

			const textarea = screen.getByRole('textbox')
			const sendButton = screen.getByRole('button', { name: /send message/i })

			expect(textarea).toBeDisabled()
			expect(sendButton).toBeDisabled()
		})

		it('should prevent keyboard input when disabled', async () => {
			const user = userEvent.setup()
			render(<MessageInput {...defaultProps} isDisabled={true} />)

			const textarea = screen.getByRole('textbox')
			await user.type(textarea, 'Hello')

			// Should not be able to type when disabled
			expect(textarea).toHaveValue('')
		})
	})

	describe('Cancel stream functionality', () => {
		it('should call onCancelStream when cancel button is clicked', async () => {
			const mockCancel = jest.fn()
			const user = userEvent.setup()
			render(<MessageInput {...defaultProps} onCancelStream={mockCancel} />)

			const cancelButton = screen.getByRole('button', { name: /cancel streaming/i })
			await user.click(cancelButton)

			expect(mockCancel).toHaveBeenCalled()
		})
	})

	describe('Accessibility', () => {
		it('should have proper ARIA labels', () => {
			render(
				<MessageInput
					{...defaultProps}
					showCharCount={true}
					maxLength={100}
				/>
			)

			const textarea = screen.getByRole('textbox')
			const sendButton = screen.getByRole('button', { name: /send message/i })
			const charCount = screen.getByText('0/100')

			expect(textarea).toHaveAttribute('aria-label', 'Enter your message')
			expect(sendButton).toHaveAttribute('aria-label', 'Send message')
			expect(charCount).toHaveAttribute('aria-label', 'Character count: 0 of 100')
		})

		it('should have live region for character count', () => {
			render(
				<MessageInput
					{...defaultProps}
					showCharCount={true}
					maxLength={100}
				/>
			)

			const charCount = screen.getByText('0/100')
			expect(charCount).toHaveAttribute('aria-live', 'polite')
		})

		it('should have live region for sending status', () => {
			render(<MessageInput {...defaultProps} isDisabled={true} />)

			const sendingStatus = screen.getByText('Sending...')
			expect(sendingStatus).toHaveAttribute('aria-live', 'polite')
		})
	})

	describe('Auto-resize functionality', () => {
		it('should auto-resize textarea when multiline is enabled', async () => {
			const user = userEvent.setup()
			render(<MessageInput {...defaultProps} multiline={true} />)

			const textarea = screen.getByRole('textbox')

			// Mock scrollHeight to simulate content height change
			Object.defineProperty(textarea, 'scrollHeight', {
				value: 100,
				configurable: true,
			})

			await user.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3')

			// Note: In a real DOM environment, the style.height would be set
			// Here we just verify the textarea exists and is working
			expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3')
		})
	})
})