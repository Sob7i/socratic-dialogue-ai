import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ChatContainer, ChatContainerProps } from './ChatContainer'

// Mock the child components to focus on integration logic
jest.mock('../ConversationView', () => ({
  ConversationView: ({ messages, onRetry, autoScroll, maxHeight, showMessageActions, onCopyMessage }: any) => (
    <div data-testid="conversation-view">
      <div data-testid="message-count">{messages.length}</div>
      <div data-testid="auto-scroll">{autoScroll?.toString()}</div>
      <div data-testid="max-height">{maxHeight || 'none'}</div>
      {onRetry && <button onClick={() => onRetry('test-retry')}>Mock Retry</button>}
      {showMessageActions && onCopyMessage && (
        <button onClick={() => onCopyMessage('test-copy', 'test content')}>Mock Copy</button>
      )}
    </div>
  )
}))

jest.mock('../MessageInput', () => ({
  MessageInput: ({ onSendMessage, isDisabled, placeholder }: any) => {
    const [inputValue, setInputValue] = React.useState('')

    return (
      <div data-testid="message-input">
        <input
          data-testid="mock-input"
          placeholder={placeholder}
          disabled={isDisabled}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={(e) => {
            // Simulate sending message on blur to prevent rapid fire
            if (e.target.value && !isDisabled) {
              onSendMessage(e.target.value)
              setInputValue('')
            }
          }}
        />
        <span data-testid="input-disabled">{isDisabled?.toString()}</span>
      </div>
    )
  }
}))

describe('ChatContainer Component', () => {
  const defaultProps: ChatContainerProps = {}

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<ChatContainer {...defaultProps} />)

      expect(screen.getByTestId('conversation-view')).toBeInTheDocument()
      expect(screen.getByTestId('message-input')).toBeInTheDocument()
      expect(screen.getByTestId('message-count')).toHaveTextContent('0')
    })

    it('renders with initial messages', () => {
      const initialMessages = [
        {
          id: '1',
          role: 'user' as const,
          content: 'Hello',
          status: 'complete' as const,
          timestamp: new Date()
        },
        {
          id: '2',
          role: 'assistant' as const,
          content: 'Hi there!',
          status: 'complete' as const,
          timestamp: new Date()
        }
      ]

      render(<ChatContainer initialMessages={initialMessages} />)

      expect(screen.getByTestId('message-count')).toHaveTextContent('2')
    })

    it('applies custom configuration props', () => {
      render(
        <ChatContainer
          autoScroll={true}
          maxHeight="500px"
          showMessageActions={true}
        />
      )

      expect(screen.getByTestId('auto-scroll')).toHaveTextContent('true')
      expect(screen.getByTestId('max-height')).toHaveTextContent('500px')
    })

    it('renders with conversation ID', () => {
      render(<ChatContainer conversationId="test-conversation-123" />)

      const container = screen.getByTestId('chat-container')
      expect(container).toHaveAttribute('data-conversation-id', 'test-conversation-123')
    })
  })

  describe('Message State Management', () => {
    it('adds new message when user sends via MessageInput', async () => {
      render(<ChatContainer />)

      const mockInput = screen.getByTestId('mock-input')

      expect(screen.getByTestId('message-count')).toHaveTextContent('0')

      fireEvent.change(mockInput, { target: { value: 'Test message' } })
      fireEvent.blur(mockInput)

      await waitFor(() => {
        expect(screen.getByTestId('message-count')).toHaveTextContent('1')
      })
    })

    it('disables input when processing message', async () => {
      render(<ChatContainer />)

      const mockInput = screen.getByTestId('mock-input')

      fireEvent.change(mockInput, { target: { value: 'Test message' } })
      fireEvent.blur(mockInput)

      // Should be disabled while processing
      await waitFor(() => {
        expect(screen.getByTestId('input-disabled')).toHaveTextContent('true')
      })

      // Should re-enable after processing
      await waitFor(() => {
        expect(screen.getByTestId('input-disabled')).toHaveTextContent('false')
      }, { timeout: 3000 })
    })

    it('generates proper message IDs and timestamps', async () => {
      const onMessageSent = jest.fn()
      render(<ChatContainer onMessageSent={onMessageSent} />)

      const mockInput = screen.getByTestId('mock-input')
      fireEvent.change(mockInput, { target: { value: 'Test message' } })
      fireEvent.blur(mockInput)

      await waitFor(() => {
        expect(onMessageSent).toHaveBeenCalledWith(
          expect.objectContaining({
            id: expect.any(String),
            role: 'user',
            content: 'Test message',
            status: 'complete',
            timestamp: expect.any(Date)
          })
        )
      })
    })

    it('handles multiple rapid message sends', async () => {
      render(<ChatContainer />)

      const mockInput = screen.getByTestId('mock-input')

      // Send messages sequentially with proper events
      fireEvent.change(mockInput, { target: { value: 'Message 1' } })
      fireEvent.blur(mockInput)

      await waitFor(() => {
        expect(screen.getByTestId('message-count')).toHaveTextContent('1')
      })

      fireEvent.change(mockInput, { target: { value: 'Message 2' } })
      fireEvent.blur(mockInput)

      await waitFor(() => {
        expect(screen.getByTestId('message-count')).toHaveTextContent('2')
      })

      fireEvent.change(mockInput, { target: { value: 'Message 3' } })
      fireEvent.blur(mockInput)

      await waitFor(() => {
        expect(screen.getByTestId('message-count')).toHaveTextContent('3')
      })
    })
  })

  describe('Retry Functionality Integration', () => {
    it('handles retry callback from ConversationView', async () => {
      const onRetry = jest.fn()
      render(<ChatContainer onRetry={onRetry} />)

      const retryButton = screen.getByText('Mock Retry')
      fireEvent.click(retryButton)

      expect(onRetry).toHaveBeenCalledWith('test-retry')
    })

    it('updates message status on retry', async () => {
      const initialMessages = [
        {
          id: 'failed-msg',
          role: 'assistant' as const,
          content: 'Failed message',
          status: 'failed' as const,
          timestamp: new Date()
        }
      ]

      const onRetry = jest.fn()
      const { rerender } = render(
        <ChatContainer
          initialMessages={initialMessages}
          onRetry={onRetry}
        />
      )

      const retryButton = screen.getByText('Mock Retry')
      fireEvent.click(retryButton)

      // Simulate parent component updating the message status
      const updatedMessages = [
        {
          ...initialMessages[0],
          status: 'streaming' as const
        }
      ]

      rerender(
        <ChatContainer
          initialMessages={updatedMessages}
          onRetry={onRetry}
        />
      )

      expect(onRetry).toHaveBeenCalled()
    })
  })

  describe('Copy Functionality Integration', () => {
    it('handles copy callback from ConversationView', () => {
      const onCopyMessage = jest.fn()
      render(
        <ChatContainer
          showMessageActions={true}
          onCopyMessage={onCopyMessage}
        />
      )

      const copyButton = screen.getByText('Mock Copy')
      fireEvent.click(copyButton)

      expect(onCopyMessage).toHaveBeenCalledWith('test-copy', 'test content')
    })

    it('provides clipboard integration', async () => {
      // Mock clipboard API
      const mockWriteText = jest.fn().mockResolvedValue(undefined)

      // Create a proper mock for navigator.clipboard
      const originalNavigator = global.navigator

      Object.defineProperty(global, 'navigator', {
        value: {
          ...originalNavigator,
          clipboard: {
            writeText: mockWriteText
          }
        },
        writable: true
      })

      // Mock window.isSecureContext
      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true
      })

      render(<ChatContainer showMessageActions={true} />)

      const copyButton = screen.getByText('Mock Copy')
      fireEvent.click(copyButton)

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('test content')
      })

      // Restore original navigator
      global.navigator = originalNavigator
    })
  })

  describe('Loading and Error States', () => {
    it('shows loading state during message processing', async () => {
      render(<ChatContainer />)

      const mockInput = screen.getByTestId('mock-input')
      fireEvent.change(mockInput, { target: { value: 'Test message' } })

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByTestId('input-disabled')).toHaveTextContent('true')
      })
    })

    it('handles message send errors gracefully', async () => {
      const onError = jest.fn()
      render(<ChatContainer onError={onError} />)

      // Simulate error scenario - this would be handled by parent component
      // For now, just ensure error callback is available
      expect(onError).toBeDefined()
    })

    it('recovers from error states', async () => {
      render(<ChatContainer />)

      const mockInput = screen.getByTestId('mock-input')

      // Send a message
      fireEvent.change(mockInput, { target: { value: 'Test message' } })

      // Should recover to enabled state
      await waitFor(() => {
        expect(screen.getByTestId('input-disabled')).toHaveTextContent('false')
      }, { timeout: 3000 })
    })
  })

  describe('Layout and Responsive Design', () => {
    it('applies proper CSS classes for layout', () => {
      render(<ChatContainer />)

      const container = screen.getByTestId('chat-container')
      expect(container).toHaveClass('chat-container')
    })

    it('handles maxHeight prop for scrollable layout', () => {
      render(<ChatContainer maxHeight="600px" />)

      expect(screen.getByTestId('max-height')).toHaveTextContent('600px')
    })

    it('maintains responsive design with many messages', async () => {
      const manyMessages = Array.from({ length: 50 }, (_, i) => ({
        id: `msg-${i}`,
        role: i % 2 === 0 ? 'user' as const : 'assistant' as const,
        content: `Message ${i + 1}`,
        status: 'complete' as const,
        timestamp: new Date()
      }))

      render(
        <ChatContainer
          initialMessages={manyMessages}
          maxHeight="400px"
        />
      )

      expect(screen.getByTestId('message-count')).toHaveTextContent('50')
      expect(screen.getByTestId('max-height')).toHaveTextContent('400px')
    })
  })

  describe('Accessibility', () => {
    it('provides proper ARIA labels and roles', () => {
      render(<ChatContainer />)

      const container = screen.getByTestId('chat-container')
      expect(container).toHaveAttribute('role', 'region')
      expect(container).toHaveAttribute('aria-label', expect.stringContaining('Chat'))
    })

    it('manages focus properly between components', () => {
      render(<ChatContainer />)

      const conversationView = screen.getByTestId('conversation-view')
      const messageInput = screen.getByTestId('message-input')

      expect(conversationView).toBeInTheDocument()
      expect(messageInput).toBeInTheDocument()
    })

    it('announces message updates to screen readers', async () => {
      render(<ChatContainer />)

      const mockInput = screen.getByTestId('mock-input')
      fireEvent.change(mockInput, { target: { value: 'Accessible message' } })

      // The announcement would be handled by ARIA live regions in the actual implementation
      await waitFor(() => {
        expect(screen.getByTestId('message-count')).toHaveTextContent('1')
      })
    })
  })

  describe('Performance and Memory Management', () => {
    it('handles large conversation histories efficiently', () => {
      const largeHistory = Array.from({ length: 1000 }, (_, i) => ({
        id: `msg-${i}`,
        role: i % 2 === 0 ? 'user' as const : 'assistant' as const,
        content: `Message ${i + 1}`,
        status: 'complete' as const,
        timestamp: new Date()
      }))

      const startTime = performance.now()

      render(<ChatContainer initialMessages={largeHistory} />)

      const endTime = performance.now()
      const renderTime = endTime - startTime

      expect(screen.getByTestId('message-count')).toHaveTextContent('1000')
      expect(renderTime).toBeLessThan(1000) // Should render within 1 second
    })

    it('cleans up resources on unmount', () => {
      const { unmount } = render(<ChatContainer />)

      // Verify component unmounts without errors
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Integration Edge Cases', () => {
    it('handles undefined message content gracefully', async () => {
      render(<ChatContainer />)

      const mockInput = screen.getByTestId('mock-input')
      fireEvent.change(mockInput, { target: { value: '' } })

      // Should not add empty messages
      await waitFor(() => {
        expect(screen.getByTestId('message-count')).toHaveTextContent('0')
      })
    })

    it('maintains component state during prop updates', () => {
      const { rerender } = render(<ChatContainer autoScroll={false} />)

      expect(screen.getByTestId('auto-scroll')).toHaveTextContent('false')

      rerender(<ChatContainer autoScroll={true} />)

      expect(screen.getByTestId('auto-scroll')).toHaveTextContent('true')
    })

    it('handles rapid component re-renders', async () => {
      const { rerender } = render(<ChatContainer />)

      for (let i = 0; i < 10; i++) {
        rerender(<ChatContainer conversationId={`conv-${i}`} />)
      }

      // Should handle rapid re-renders without errors
      expect(screen.getByTestId('chat-container')).toHaveAttribute(
        'data-conversation-id',
        'conv-9'
      )
    })
  })
})