import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { MessageInput, MessageInputProps } from './MessageInput'

describe('MessageInput Component', () => {
  const defaultProps: MessageInputProps = {
    onSendMessage: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<MessageInput {...defaultProps} />)

      const textarea = screen.getByRole('textbox', { name: /enter your message/i })
      const sendButton = screen.getByRole('button', { name: /send message/i })

      expect(textarea).toBeInTheDocument()
      expect(sendButton).toBeInTheDocument()
    })

    it('renders with custom placeholder', () => {
      render(
        <MessageInput
          {...defaultProps}
          placeholder="Type your question here..."
        />
      )

      expect(screen.getByPlaceholderText('Type your question here...')).toBeInTheDocument()
    })

    it('applies multiline prop correctly', () => {
      render(<MessageInput {...defaultProps} multiline={true} />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '3')
    })

    it('shows character count when enabled', () => {
      render(
        <MessageInput
          {...defaultProps}
          showCharCount={true}
          maxLength={100}
        />
      )

      expect(screen.getByText('0/100')).toBeInTheDocument()
    })
  })

  describe('Input Validation', () => {
    it('disables send button for empty input', () => {
      render(<MessageInput {...defaultProps} />)

      const sendButton = screen.getByRole('button', { name: /send message/i })
      expect(sendButton).toBeDisabled()
    })

    it('disables send button for whitespace-only input', async () => {
      const user = userEvent.setup()
      render(<MessageInput {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      const sendButton = screen.getByRole('button', { name: /send message/i })

      await user.type(textarea, '   \n\t  ')
      expect(sendButton).toBeDisabled()
    })

    it('enables send button for valid input', async () => {
      const user = userEvent.setup()
      render(<MessageInput {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      const sendButton = screen.getByRole('button', { name: /send message/i })

      await user.type(textarea, 'Hello world')
      expect(sendButton).toBeEnabled()
    })

    it('prevents input beyond maxLength', async () => {
      const user = userEvent.setup()
      render(<MessageInput {...defaultProps} maxLength={10} />)

      const textarea = screen.getByRole('textbox')

      await user.type(textarea, 'This is a very long message that exceeds the limit')
      expect(textarea).toHaveValue('This is a ')
    })

    it('shows warning when approaching character limit', async () => {
      const user = userEvent.setup()
      render(
        <MessageInput
          {...defaultProps}
          maxLength={20}
          showCharCount={true}
        />
      )

      const textarea = screen.getByRole('textbox')

      await user.type(textarea, 'Almost at limit!')

      const charCount = screen.getByText('16/20')
      expect(charCount).toHaveClass('char-count--warning')
    })

    it('shows error state at character limit', async () => {
      const user = userEvent.setup()
      render(
        <MessageInput
          {...defaultProps}
          maxLength={10}
          showCharCount={true}
        />
      )

      const textarea = screen.getByRole('textbox')

      await user.type(textarea, 'Exactly 10')

      const charCount = screen.getByText('10/10')
      expect(charCount).toHaveClass('char-count--error')
    })
  })

  describe('Keyboard Interactions', () => {
    it('sends message on Enter key', async () => {
      const user = userEvent.setup()
      const mockSendMessage = jest.fn()
      render(<MessageInput {...defaultProps} onSendMessage={mockSendMessage} />)

      const textarea = screen.getByRole('textbox')

      await user.type(textarea, 'Test message')
      await user.keyboard('{Enter}')

      expect(mockSendMessage).toHaveBeenCalledWith('Test message')
      expect(textarea).toHaveValue('')
    })

    it('creates new line on Shift+Enter', async () => {
      const user = userEvent.setup()
      const mockSendMessage = jest.fn()
      render(<MessageInput {...defaultProps} onSendMessage={mockSendMessage} />)

      const textarea = screen.getByRole('textbox')

      await user.type(textarea, 'First line')
      await user.keyboard('{Shift>}{Enter}')
      await user.type(textarea, 'Second line')

      expect(textarea).toHaveValue('First line\nSecond line')
      expect(mockSendMessage).not.toHaveBeenCalled()
    })

    it('sends message on Ctrl+Enter', async () => {
      const user = userEvent.setup()
      const mockSendMessage = jest.fn()
      render(<MessageInput {...defaultProps} onSendMessage={mockSendMessage} />)

      const textarea = screen.getByRole('textbox')

      await user.type(textarea, 'Test message')
      await user.keyboard('{Control>}{Enter}')

      expect(mockSendMessage).toHaveBeenCalledWith('Test message')
    })

    it('sends message on Cmd+Enter (Mac)', async () => {
      const user = userEvent.setup()
      const mockSendMessage = jest.fn()
      render(<MessageInput {...defaultProps} onSendMessage={mockSendMessage} />)

      const textarea = screen.getByRole('textbox')

      await user.type(textarea, 'Test message')
      await user.keyboard('{Meta>}{Enter}')

      expect(mockSendMessage).toHaveBeenCalledWith('Test message')
    })

    it('does not send empty message on Enter', async () => {
      const user = userEvent.setup()
      const mockSendMessage = jest.fn()
      render(<MessageInput {...defaultProps} onSendMessage={mockSendMessage} />)

      const textarea = screen.getByRole('textbox')

      await user.click(textarea)
      await user.keyboard('{Enter}')

      expect(mockSendMessage).not.toHaveBeenCalled()
    })
  })

  describe('Auto-resize Functionality', () => {
    it('auto-resizes textarea based on content', async () => {
      const user = userEvent.setup()
      render(<MessageInput {...defaultProps} multiline={true} />)

      const textarea = screen.getByRole('textbox')

      // Mock scrollHeight for testing since jsdom doesn't calculate real layout
      Object.defineProperty(textarea, 'scrollHeight', {
        value: 100,
        writable: true
      })

      await user.type(textarea, 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5')

      // Wait for resize to occur
      await waitFor(() => {
        expect(textarea.style.height).toBe('100px')
      })
    })

    it('resets height when content is cleared', async () => {
      const user = userEvent.setup()
      render(<MessageInput {...defaultProps} multiline={true} />)

      const textarea = screen.getByRole('textbox')

      await user.type(textarea, 'Lots of content\nLine 2\nLine 3')
      await user.clear(textarea)

      await waitFor(() => {
        expect(textarea).toHaveAttribute('rows', '3')
      })
    })
  })

  describe('Disabled State', () => {
    it('disables textarea and send button when disabled', () => {
      render(<MessageInput {...defaultProps} isDisabled={true} />)

      const textarea = screen.getByRole('textbox')
      const sendButton = screen.getByRole('button', { name: /send message/i })

      expect(textarea).toBeDisabled()
      expect(sendButton).toBeDisabled()
    })

    it('shows loading indicator when disabled', () => {
      render(<MessageInput {...defaultProps} isDisabled={true} />)

      expect(screen.getByText(/sending/i)).toBeInTheDocument()
    })

    it('prevents keyboard shortcuts when disabled', async () => {
      const user = userEvent.setup()
      const mockSendMessage = jest.fn()
      render(
        <MessageInput
          {...defaultProps}
          onSendMessage={mockSendMessage}
          isDisabled={true}
        />
      )

      const textarea = screen.getByRole('textbox')

      // Try to type and send
      await user.type(textarea, 'Test message')
      await user.keyboard('{Enter}')

      expect(mockSendMessage).not.toHaveBeenCalled()
    })
  })

  describe('Character Count Display', () => {
    it('updates character count as user types', async () => {
      const user = userEvent.setup()
      render(
        <MessageInput
          {...defaultProps}
          showCharCount={true}
          maxLength={50}
        />
      )

      const textarea = screen.getByRole('textbox')

      await user.type(textarea, 'Hello')
      expect(screen.getByText('5/50')).toBeInTheDocument()

      await user.type(textarea, ' World!')
      expect(screen.getByText('12/50')).toBeInTheDocument()
    })

    it('handles character count for multiline content', async () => {
      const user = userEvent.setup()
      render(
        <MessageInput
          {...defaultProps}
          showCharCount={true}
          maxLength={30}
          multiline={true}
        />
      )

      const textarea = screen.getByRole('textbox')

      await user.type(textarea, 'Line 1\nLine 2\nLine 3')
      expect(screen.getByText('20/30')).toBeInTheDocument()
    })
  })

  describe('Send Button Interactions', () => {
    it('sends message when send button is clicked', async () => {
      const user = userEvent.setup()
      const mockSendMessage = jest.fn()
      render(<MessageInput {...defaultProps} onSendMessage={mockSendMessage} />)

      const textarea = screen.getByRole('textbox')
      const sendButton = screen.getByRole('button', { name: /send message/i })

      await user.type(textarea, 'Button click test')
      await user.click(sendButton)

      expect(mockSendMessage).toHaveBeenCalledWith('Button click test')
      expect(textarea).toHaveValue('')
    })

    it('trims whitespace from message content', async () => {
      const user = userEvent.setup()
      const mockSendMessage = jest.fn()
      render(<MessageInput {...defaultProps} onSendMessage={mockSendMessage} />)

      const textarea = screen.getByRole('textbox')
      const sendButton = screen.getByRole('button', { name: /send message/i })

      await user.type(textarea, '   Hello World   ')
      await user.click(sendButton)

      expect(mockSendMessage).toHaveBeenCalledWith('Hello World')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<MessageInput {...defaultProps} />)

      const textarea = screen.getByRole('textbox', { name: /enter your message/i })
      const sendButton = screen.getByRole('button', { name: /send message/i })

      expect(textarea).toHaveAttribute('aria-label', 'Enter your message')
      expect(sendButton).toHaveAttribute('aria-label', 'Send message')
    })

    it('has proper tab order', () => {
      render(<MessageInput {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      const sendButton = screen.getByRole('button', { name: /send message/i })

      expect(textarea).toHaveAttribute('tabIndex', '0')
      expect(sendButton).toHaveAttribute('tabIndex', '0')
    })

    it('announces character count to screen readers', () => {
      render(
        <MessageInput
          {...defaultProps}
          showCharCount={true}
          maxLength={100}
        />
      )

      const charCount = screen.getByText('0/100')
      expect(charCount).toHaveAttribute('aria-live', 'polite')
      expect(charCount).toHaveAttribute('aria-label', 'Character count: 0 of 100')
    })

    it('announces disabled state to screen readers', () => {
      render(<MessageInput {...defaultProps} isDisabled={true} />)

      const statusMessage = screen.getByText(/sending/i)
      expect(statusMessage).toHaveAttribute('aria-live', 'polite')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<MessageInput {...defaultProps} />)

      const textarea = screen.getByRole('textbox')
      const sendButton = screen.getByRole('button', { name: /send message/i })

      // Tab to textarea
      await user.tab()
      expect(textarea).toHaveFocus()

      // Add some text to enable the send button
      await user.type(textarea, 'Test message')

      // Tab to send button (now enabled)
      await user.tab()
      expect(sendButton).toHaveFocus()
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid consecutive sends', async () => {
      const user = userEvent.setup()
      const mockSendMessage = jest.fn()
      render(<MessageInput {...defaultProps} onSendMessage={mockSendMessage} />)

      const textarea = screen.getByRole('textbox')

      await user.type(textarea, 'Message 1')
      await user.keyboard('{Enter}')

      await user.type(textarea, 'Message 2')
      await user.keyboard('{Enter}')

      expect(mockSendMessage).toHaveBeenCalledTimes(2)
      expect(mockSendMessage).toHaveBeenNthCalledWith(1, 'Message 1')
      expect(mockSendMessage).toHaveBeenNthCalledWith(2, 'Message 2')
    })

    it('handles special characters and emojis', async () => {
      const user = userEvent.setup()
      const mockSendMessage = jest.fn()
      render(<MessageInput {...defaultProps} onSendMessage={mockSendMessage} />)

      const textarea = screen.getByRole('textbox')
      const specialMessage = 'Hello! 🌟 Special chars: @#$%^&*()'

      await user.type(textarea, specialMessage)
      await user.keyboard('{Enter}')

      expect(mockSendMessage).toHaveBeenCalledWith(specialMessage)
    })

    it('handles paste operations', async () => {
      const user = userEvent.setup()
      const mockSendMessage = jest.fn()
      render(<MessageInput {...defaultProps} maxLength={50} />)

      const textarea = screen.getByRole('textbox')

      await user.click(textarea)
      await user.paste('Pasted content from clipboard')

      expect(textarea).toHaveValue('Pasted content from clipboard')
    })

    it('handles paste that exceeds maxLength', async () => {
      const user = userEvent.setup()
      render(<MessageInput {...defaultProps} maxLength={10} />)

      const textarea = screen.getByRole('textbox')

      await user.click(textarea)
      await user.paste('This is way too long for the limit')

      expect(textarea).toHaveValue('This is wa')
    })
  })
})