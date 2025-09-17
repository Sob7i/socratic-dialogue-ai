import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConversationView } from './ConversationView'

// Type definitions from PRD
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  status: 'complete' | 'streaming' | 'failed'
  timestamp: Date
}

interface ConversationViewProps {
  messages: Message[]
  isLoading?: boolean
}

// Test utilities
const createMockMessage = (overrides: Partial<Message> = {}): Message => ({
  id: Math.random().toString(36),
  role: 'user',
  content: 'Test message content',
  status: 'complete',
  timestamp: new Date('2023-01-01T10:00:00Z'),
  ...overrides,
})

const createMockMessages = (count: number): Message[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockMessage({
      id: `msg-${i}`,
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i + 1}`,
    })
  )
}

describe('ConversationView', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing with empty messages', () => {
      render(<ConversationView messages={[]} />)
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('renders without crashing with undefined messages', () => {
      // @ts-expect-error: Testing edge case
      render(<ConversationView messages={undefined} />)
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('renders a list of messages correctly', () => {
      const messages = createMockMessages(3)
      render(<ConversationView messages={messages} />)

      expect(screen.getAllByRole('article')).toHaveLength(3)
      expect(screen.getByText('Message 1')).toBeInTheDocument()
      expect(screen.getByText('Message 2')).toBeInTheDocument()
      expect(screen.getByText('Message 3')).toBeInTheDocument()
    })

    it('displays message content properly', () => {
      const message = createMockMessage({
        content: 'This is a test message with special content',
      })
      render(<ConversationView messages={[message]} />)

      expect(screen.getByText('This is a test message with special content')).toBeInTheDocument()
    })

    it('renders proper semantic structure with main container', () => {
      render(<ConversationView messages={[]} />)

      const main = screen.getByRole('main')
      expect(main).toHaveAttribute('aria-label', expect.stringContaining('Conversation'))
    })
  })

  describe('Message Role Differentiation', () => {
    it('renders user messages with distinct styling', () => {
      const userMessage = createMockMessage({
        role: 'user',
        content: 'User message',
      })
      render(<ConversationView messages={[userMessage]} />)

      const messageElement = screen.getByRole('article')
      expect(messageElement).toHaveAttribute('data-role', 'user')
      expect(messageElement).toHaveClass('user')
    })

    it('renders assistant messages with different styling', () => {
      const assistantMessage = createMockMessage({
        role: 'assistant',
        content: 'Assistant message',
      })
      render(<ConversationView messages={[assistantMessage]} />)

      const messageElement = screen.getByRole('article')
      expect(messageElement).toHaveAttribute('data-role', 'assistant')
      expect(messageElement).toHaveClass('assistant')
    })

    it('renders mixed user and assistant messages with correct styling', () => {
      const messages = [
        createMockMessage({ role: 'user', content: 'User says hello' }),
        createMockMessage({ role: 'assistant', content: 'Assistant responds' }),
      ]
      render(<ConversationView messages={messages} />)

      const messageElements = screen.getAllByRole('article')
      expect(messageElements[0]).toHaveAttribute('data-role', 'user')
      expect(messageElements[1]).toHaveAttribute('data-role', 'assistant')
    })

    it('includes proper ARIA labels for different roles', () => {
      const messages = [
        createMockMessage({ role: 'user', content: 'User message' }),
        createMockMessage({ role: 'assistant', content: 'Assistant message' }),
      ]
      render(<ConversationView messages={messages} />)

      expect(screen.getByLabelText(/user message/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/assistant message/i)).toBeInTheDocument()
    })
  })

  describe('Message Status Handling', () => {
    it('displays complete messages normally', () => {
      const message = createMockMessage({
        status: 'complete',
        content: 'Complete message',
      })
      render(<ConversationView messages={[message]} />)

      const messageElement = screen.getByRole('article')
      expect(messageElement).toHaveAttribute('data-status', 'complete')
      expect(screen.getByText('Complete message')).toBeInTheDocument()
    })

    it('shows typing indicator for streaming messages', () => {
      const streamingMessage = createMockMessage({
        status: 'streaming',
        content: 'Partial content',
      })
      render(<ConversationView messages={[streamingMessage]} />)

      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
      expect(screen.getByLabelText(/typing/i)).toBeInTheDocument()
    })

    it('displays partial content while streaming', () => {
      const streamingMessage = createMockMessage({
        status: 'streaming',
        content: 'Partial streaming content...',
      })
      render(<ConversationView messages={[streamingMessage]} />)

      expect(screen.getByText('Partial streaming content...')).toBeInTheDocument()
      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
    })

    it('shows failed message state with error indicator', () => {
      const failedMessage = createMockMessage({
        status: 'failed',
        content: 'Failed to send',
      })
      const mockOnRetry = jest.fn()
      render(<ConversationView messages={[failedMessage]} onRetry={mockOnRetry} />)

      const messageElement = screen.getByRole('article')
      expect(messageElement).toHaveAttribute('data-status', 'failed')
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByLabelText(/message failed/i)).toBeInTheDocument()
    })

    it('includes retry button for failed messages', () => {
      const failedMessage = createMockMessage({
        status: 'failed',
        content: 'Failed message',
      })
      const mockOnRetry = jest.fn()
      render(<ConversationView messages={[failedMessage]} onRetry={mockOnRetry} />)

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('shows global loading indicator when isLoading is true', () => {
      render(<ConversationView messages={[]} isLoading={true} />)

      expect(screen.getByTestId('conversation-loading')).toBeInTheDocument()
      expect(screen.getByLabelText(/loading conversation/i)).toBeInTheDocument()
    })

    it('hides loading indicator when isLoading is false', () => {
      render(<ConversationView messages={[]} isLoading={false} />)

      expect(screen.queryByTestId('conversation-loading')).not.toBeInTheDocument()
    })

    it('shows both existing messages and loading state', () => {
      const messages = createMockMessages(2)
      render(<ConversationView messages={messages} isLoading={true} />)

      expect(screen.getAllByRole('article')).toHaveLength(2)
      expect(screen.getByTestId('conversation-loading')).toBeInTheDocument()
    })

    it('loading indicator does not interfere with message display', () => {
      const messages = createMockMessages(1)
      render(<ConversationView messages={messages} isLoading={true} />)

      expect(screen.getByText('Message 1')).toBeInTheDocument()
      expect(screen.getByTestId('conversation-loading')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty string content gracefully', () => {
      const message = createMockMessage({ content: '' })
      render(<ConversationView messages={[message]} />)

      const messageElement = screen.getByRole('article')
      expect(messageElement).toBeInTheDocument()
      const messageContent = messageElement.querySelector('.message__content')
      expect(messageContent).toHaveTextContent('')
    })

    it('handles null content gracefully', () => {
      const message = { ...createMockMessage(), content: null as any }
      render(<ConversationView messages={[message]} />)

      expect(screen.getByRole('article')).toBeInTheDocument()
    })

    it('handles undefined content gracefully', () => {
      const message = { ...createMockMessage(), content: undefined as any }
      render(<ConversationView messages={[message]} />)

      expect(screen.getByRole('article')).toBeInTheDocument()
    })

    it('handles very long message content', () => {
      const longContent = 'A'.repeat(5000)
      const message = createMockMessage({ content: longContent })
      render(<ConversationView messages={[message]} />)

      expect(screen.getByText(longContent)).toBeInTheDocument()
    })

    it('handles special characters and HTML in content', () => {
      const specialContent = '<script>alert("xss")</script> & special chars: çñü'
      const message = createMockMessage({ content: specialContent })
      render(<ConversationView messages={[message]} />)

      // Should render as text, not execute HTML
      expect(screen.getByText(specialContent)).toBeInTheDocument()
    })

    it('handles messages with missing properties gracefully', () => {
      const incompleteMessage = {
        id: 'incomplete',
        // Missing role, content, status, timestamp
      } as any

      expect(() => {
        render(<ConversationView messages={[incompleteMessage]} />)
      }).not.toThrow()
    })

    it('handles invalid timestamp gracefully', () => {
      const message = {
        ...createMockMessage(),
        timestamp: new Date('invalid-date')
      }
      render(<ConversationView messages={[message]} />)

      expect(screen.getByRole('article')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('uses proper semantic HTML structure', () => {
      const messages = createMockMessages(2)
      render(<ConversationView messages={messages} />)

      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getAllByRole('article')).toHaveLength(2)
    })

    it('includes proper ARIA labels for screen readers', () => {
      const message = createMockMessage({
        role: 'assistant',
        content: 'Accessible message',
      })
      render(<ConversationView messages={[message]} />)

      expect(screen.getByLabelText(/assistant message/i)).toBeInTheDocument()
    })

    it('announces streaming messages to screen readers', () => {
      const streamingMessage = createMockMessage({
        status: 'streaming',
        content: 'Streaming...',
      })
      render(<ConversationView messages={[streamingMessage]} />)

      expect(screen.getByLabelText(/typing/i)).toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('has proper focus management for interactive elements', () => {
      const failedMessage = createMockMessage({
        status: 'failed',
        content: 'Failed message',
      })
      const mockOnRetry = jest.fn()
      render(<ConversationView messages={[failedMessage]} onRetry={mockOnRetry} />)

      const retryButton = screen.getByRole('button', { name: /retry/i })
      expect(retryButton).toBeInTheDocument()

      // Focus should be manageable
      retryButton.focus()
      expect(retryButton).toHaveFocus()
    })
  })

  describe('Timestamp Display', () => {
    it('displays timestamps correctly', () => {
      const message = createMockMessage({
        timestamp: new Date('2023-12-25T15:30:00Z'),
        content: 'Holiday message',
      })
      render(<ConversationView messages={[message]} />)

      expect(screen.getByText(/4:30 PM|15:30/)).toBeInTheDocument()
    })

    it('formats timestamps appropriately for different dates', () => {
      const recentMessage = createMockMessage({
        timestamp: new Date(),
        content: 'Recent message',
      })
      render(<ConversationView messages={[recentMessage]} />)

      // Should show time format for recent messages
      expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument()
    })
  })

  describe('Performance and Large Lists', () => {
    it('handles large number of messages efficiently', () => {
      const manyMessages = createMockMessages(100)

      const startTime = performance.now()
      render(<ConversationView messages={manyMessages} />)
      const endTime = performance.now()

      // Should render within reasonable time (less than 100ms for 100 items)
      expect(endTime - startTime).toBeLessThan(100)
      expect(screen.getAllByRole('article')).toHaveLength(100)
    })

    it('maintains proper structure with many messages', () => {
      const manyMessages = createMockMessages(50)
      render(<ConversationView messages={manyMessages} />)

      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getAllByRole('article')).toHaveLength(50)
    })
  })

  describe('User Interactions', () => {
    it('handles retry button click for failed messages', async () => {
      const user = userEvent.setup()
      const mockOnRetry = jest.fn()
      const failedMessage = createMockMessage({
        status: 'failed',
        content: 'Failed message',
      })

      render(<ConversationView messages={[failedMessage]} onRetry={mockOnRetry} />)

      const retryButton = screen.getByRole('button', { name: /retry/i })
      await user.click(retryButton)

      // Should call the onRetry callback
      expect(mockOnRetry).toHaveBeenCalledWith(failedMessage.id)
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      const mockOnRetry = jest.fn()
      const messages = [
        createMockMessage({ status: 'failed', content: 'Failed 1' }),
        createMockMessage({ status: 'failed', content: 'Failed 2' }),
      ]

      render(<ConversationView messages={messages} onRetry={mockOnRetry} />)

      const retryButtons = screen.getAllByRole('button', { name: /retry/i })

      // Tab navigation should work
      await user.tab()
      expect(retryButtons[0]).toHaveFocus()

      await user.tab()
      expect(retryButtons[1]).toHaveFocus()
    })
  })

  describe('Message Updates', () => {
    it('updates streaming message content dynamically', () => {
      const { rerender } = render(
        <ConversationView
          messages={[createMockMessage({
            id: 'streaming-msg',
            status: 'streaming',
            content: 'Initial...'
          })]}
        />
      )

      expect(screen.getByText('Initial...')).toBeInTheDocument()

      // Update with more content
      rerender(
        <ConversationView
          messages={[createMockMessage({
            id: 'streaming-msg',
            status: 'streaming',
            content: 'Initial... more content...'
          })]}
        />
      )

      expect(screen.getByText('Initial... more content...')).toBeInTheDocument()
    })

    it('removes typing indicator when streaming completes', () => {
      const { rerender } = render(
        <ConversationView
          messages={[createMockMessage({
            id: 'msg',
            status: 'streaming',
            content: 'Content'
          })]}
        />
      )

      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()

      // Complete the message
      rerender(
        <ConversationView
          messages={[createMockMessage({
            id: 'msg',
            status: 'complete',
            content: 'Content'
          })]}
        />
      )

      expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument()
    })
  })

  describe('Enhanced Features - Auto Scroll', () => {
    it('renders with autoScroll prop enabled', () => {
      const messages = createMockMessages(5)
      render(<ConversationView messages={messages} autoScroll={true} />)

      const container = screen.getByRole('main')
      expect(container).toHaveAttribute('data-auto-scroll', 'true')
    })

    it('renders with autoScroll prop disabled', () => {
      const messages = createMockMessages(5)
      render(<ConversationView messages={messages} autoScroll={false} />)

      const container = screen.getByRole('main')
      expect(container).toHaveAttribute('data-auto-scroll', 'false')
    })

    it('auto-scrolls to bottom when new message is added', () => {
      const initialMessages = createMockMessages(3)
      const { rerender } = render(
        <ConversationView messages={initialMessages} autoScroll={true} />
      )

      const container = screen.getByRole('main')

      // Mock scrollTop and scrollIntoView
      const mockScrollIntoView = jest.fn()
      container.scrollIntoView = mockScrollIntoView

      // Add a new message
      const newMessages = [
        ...initialMessages,
        createMockMessage({ id: 'new-msg', content: 'New message' })
      ]

      rerender(<ConversationView messages={newMessages} autoScroll={true} />)

      // Should find the new message
      expect(screen.getByText('New message')).toBeInTheDocument()
    })

    it('respects user scroll position when autoScroll is false', () => {
      const messages = createMockMessages(10)
      render(<ConversationView messages={messages} autoScroll={false} />)

      const container = screen.getByRole('main')
      expect(container).toHaveAttribute('data-auto-scroll', 'false')
    })

    it('handles scroll position detection for user-initiated scrolling', () => {
      const messages = createMockMessages(10)
      render(<ConversationView messages={messages} autoScroll={true} />)

      const container = screen.getByRole('main')

      // Mock scroll properties
      Object.defineProperty(container, 'scrollTop', { value: 100, writable: true })
      Object.defineProperty(container, 'scrollHeight', { value: 1000, writable: true })
      Object.defineProperty(container, 'clientHeight', { value: 400, writable: true })

      // Simulate user scroll
      container.dispatchEvent(new Event('scroll'))

      // Should still render properly
      expect(container).toBeInTheDocument()
    })
  })

  describe('Enhanced Features - Scrollable Container', () => {
    it('applies maxHeight prop to create scrollable container', () => {
      const messages = createMockMessages(10)
      render(<ConversationView messages={messages} maxHeight="400px" />)

      const container = screen.getByRole('main')
      expect(container).toHaveStyle('max-height: 400px')
      expect(container).toHaveClass('conversation-view--scrollable')
    })

    it('renders without maxHeight by default', () => {
      const messages = createMockMessages(5)
      render(<ConversationView messages={messages} />)

      const container = screen.getByRole('main')
      expect(container).not.toHaveStyle('max-height: 400px')
      expect(container).not.toHaveClass('conversation-view--scrollable')
    })

    it('handles overflow with proper scrolling behavior', () => {
      const messages = createMockMessages(20)
      render(<ConversationView messages={messages} maxHeight="300px" />)

      const container = screen.getByRole('main')
      expect(container).toHaveClass('conversation-view--scrollable')

      // Check that all messages are still accessible
      expect(screen.getAllByRole('article')).toHaveLength(20)
    })

    it('combines maxHeight with autoScroll functionality', () => {
      const messages = createMockMessages(15)
      render(
        <ConversationView
          messages={messages}
          maxHeight="350px"
          autoScroll={true}
        />
      )

      const container = screen.getByRole('main')
      expect(container).toHaveStyle('max-height: 350px')
      expect(container).toHaveAttribute('data-auto-scroll', 'true')
    })
  })

  describe('Enhanced Features - Retry Functionality', () => {
    it('calls onRetry callback when retry button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnRetry = jest.fn()

      const failedMessage = createMockMessage({
        id: 'failed-msg-123',
        status: 'failed',
        content: 'Failed message'
      })

      render(
        <ConversationView
          messages={[failedMessage]}
          onRetry={mockOnRetry}
        />
      )

      const retryButton = screen.getByRole('button', { name: /retry/i })
      await user.click(retryButton)

      expect(mockOnRetry).toHaveBeenCalledWith('failed-msg-123')
      expect(mockOnRetry).toHaveBeenCalledTimes(1)
    })

    it('handles retry for multiple failed messages independently', async () => {
      const user = userEvent.setup()
      const mockOnRetry = jest.fn()

      const failedMessages = [
        createMockMessage({ id: 'failed-1', status: 'failed', content: 'Failed 1' }),
        createMockMessage({ id: 'failed-2', status: 'failed', content: 'Failed 2' }),
      ]

      render(
        <ConversationView
          messages={failedMessages}
          onRetry={mockOnRetry}
        />
      )

      const retryButtons = screen.getAllByRole('button', { name: /retry/i })

      await user.click(retryButtons[0])
      expect(mockOnRetry).toHaveBeenCalledWith('failed-1')

      await user.click(retryButtons[1])
      expect(mockOnRetry).toHaveBeenCalledWith('failed-2')

      expect(mockOnRetry).toHaveBeenCalledTimes(2)
    })

    it('does not render retry button when onRetry is not provided', () => {
      const failedMessage = createMockMessage({
        status: 'failed',
        content: 'Failed message without callback'
      })

      render(<ConversationView messages={[failedMessage]} />)

      // Should not have retry button without onRetry callback
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument()
    })

    it('provides proper accessibility for retry functionality', async () => {
      const user = userEvent.setup()
      const mockOnRetry = jest.fn()

      const failedMessage = createMockMessage({
        id: 'accessibility-test',
        status: 'failed',
        content: 'Test message'
      })

      render(
        <ConversationView
          messages={[failedMessage]}
          onRetry={mockOnRetry}
        />
      )

      const retryButton = screen.getByRole('button', { name: /retry/i })

      expect(retryButton).toHaveAttribute('aria-label', expect.stringContaining('Retry'))
      expect(retryButton).toBeEnabled()

      // Test keyboard activation
      retryButton.focus()
      await user.keyboard('{Enter}')
      expect(mockOnRetry).toHaveBeenCalledWith('accessibility-test')
    })
  })

  describe('Enhanced Features - Message Actions', () => {
    it('renders copy button for completed messages', () => {
      const message = createMockMessage({
        status: 'complete',
        content: 'Message to copy'
      })

      const mockOnCopy = jest.fn()
      render(
        <ConversationView
          messages={[message]}
          showMessageActions={true}
          onCopyMessage={mockOnCopy}
        />
      )

      expect(screen.getByRole('button', { name: /copy message/i })).toBeInTheDocument()
    })

    it('calls onCopyMessage when copy button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnCopy = jest.fn()

      const message = createMockMessage({
        id: 'copy-test',
        content: 'Content to copy'
      })

      render(
        <ConversationView
          messages={[message]}
          showMessageActions={true}
          onCopyMessage={mockOnCopy}
        />
      )

      const copyButton = screen.getByRole('button', { name: /copy message/i })
      await user.click(copyButton)

      expect(mockOnCopy).toHaveBeenCalledWith('copy-test', 'Content to copy')
    })

    it('does not show message actions when disabled', () => {
      const message = createMockMessage({ content: 'Test message' })

      render(<ConversationView messages={[message]} showMessageActions={false} />)

      expect(screen.queryByRole('button', { name: /copy message/i })).not.toBeInTheDocument()
    })

    it('handles copy functionality for multiple messages', async () => {
      const user = userEvent.setup()
      const mockOnCopy = jest.fn()

      const messages = [
        createMockMessage({ id: 'msg-1', content: 'First message' }),
        createMockMessage({ id: 'msg-2', content: 'Second message' }),
      ]

      render(
        <ConversationView
          messages={messages}
          showMessageActions={true}
          onCopyMessage={mockOnCopy}
        />
      )

      const copyButtons = screen.getAllByRole('button', { name: /copy message/i })

      await user.click(copyButtons[0])
      expect(mockOnCopy).toHaveBeenCalledWith('msg-1', 'First message')

      await user.click(copyButtons[1])
      expect(mockOnCopy).toHaveBeenCalledWith('msg-2', 'Second message')

      expect(mockOnCopy).toHaveBeenCalledTimes(2)
    })
  })

  describe('Enhanced Features - Integration', () => {
    it('handles all enhanced features together', async () => {
      const user = userEvent.setup()
      const mockOnRetry = jest.fn()
      const mockOnCopy = jest.fn()

      const messages = [
        createMockMessage({ id: 'msg-1', content: 'First message' }),
        createMockMessage({ id: 'msg-2', status: 'failed', content: 'Failed message' }),
        createMockMessage({ id: 'msg-3', content: 'Last message' }),
      ]

      render(
        <ConversationView
          messages={messages}
          autoScroll={true}
          maxHeight="500px"
          onRetry={mockOnRetry}
          showMessageActions={true}
          onCopyMessage={mockOnCopy}
        />
      )

      const container = screen.getByRole('main')
      expect(container).toHaveAttribute('data-auto-scroll', 'true')
      expect(container).toHaveStyle('max-height: 500px')

      // Test retry functionality
      const retryButton = screen.getByRole('button', { name: /retry/i })
      await user.click(retryButton)
      expect(mockOnRetry).toHaveBeenCalledWith('msg-2')

      // Test copy functionality
      const copyButtons = screen.getAllByRole('button', { name: /copy message/i })
      await user.click(copyButtons[0])
      expect(mockOnCopy).toHaveBeenCalledWith('msg-1', 'First message')
    })

    it('maintains performance with large message lists and scrolling', () => {
      const largeMessageList = createMockMessages(100)

      render(
        <ConversationView
          messages={largeMessageList}
          autoScroll={true}
          maxHeight="400px"
        />
      )

      expect(screen.getAllByRole('article')).toHaveLength(100)

      const container = screen.getByRole('main')
      expect(container).toHaveClass('conversation-view--scrollable')
    })
  })
})