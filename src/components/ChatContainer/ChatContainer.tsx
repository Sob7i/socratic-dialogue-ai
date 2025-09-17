'use client'

import React, { useCallback } from 'react'
import { ConversationView, Message } from '../ConversationView'
import { MessageInput } from '../MessageInput'
import { useStreamingChat } from '@/hooks/useStreamingChat'

export interface ChatContainerProps {
  conversationId?: string
  initialMessages?: Message[]
  autoScroll?: boolean
  maxHeight?: string
  showMessageActions?: boolean
  onMessageSent?: (message: Message) => void
  onRetry?: (messageId: string) => void
  onCopyMessage?: (messageId: string, content: string) => void
  onError?: (error: Error) => void
}

export function ChatContainer({
  conversationId,
  initialMessages = [],
  autoScroll = true,
  maxHeight,
  showMessageActions = false,
  onMessageSent,
  onRetry,
  onCopyMessage,
  onError
}: ChatContainerProps) {
  // Use streaming chat hook instead of local state
  const {
    messages: streamingMessages,
    sendMessage: sendStreamingMessage,
    isStreaming,
    streamError,
    retryMessage,
    cancelStream
  } = useStreamingChat()

  // Convert streaming messages to regular messages for compatibility
  const messages = streamingMessages.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    status: msg.status,
    timestamp: msg.timestamp
  }))

  const isProcessing = isStreaming

  // Handle streaming errors
  React.useEffect(() => {
    if (streamError && onError) {
      onError(streamError)
    }
  }, [streamError, onError])

  // Handle sending a new message
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isProcessing) {
      return
    }

    try {
      // Send message using streaming hook
      await sendStreamingMessage(content.trim())

      // Create a message object for parent notification
      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        role: 'user',
        content: content.trim(),
        status: 'complete',
        timestamp: new Date()
      }

      // Notify parent component of new message
      onMessageSent?.(newMessage)

    } catch (error) {
      console.error('Error sending message:', error)
      onError?.(error as Error)
    }
  }, [isProcessing, sendStreamingMessage, onMessageSent, onError])

  // Handle retry functionality
  const handleRetry = useCallback(async (messageId: string) => {
    try {
      // Use streaming hook's retry functionality
      await retryMessage(messageId)

      // Also call parent's onRetry if provided
      onRetry?.(messageId)
    } catch (error) {
      console.error('Error retrying message:', error)
      onError?.(error as Error)
    }
  }, [retryMessage, onRetry, onError])

  // Handle copy message functionality
  const handleCopyMessage = useCallback(async (messageId: string, content: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = content
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        try {
          // Use deprecated method as fallback only
          document.execCommand('copy')
        } finally {
          document.body.removeChild(textArea)
        }
      }

      onCopyMessage?.(messageId, content)
    } catch (error) {
      console.error('Error copying message:', error)
      onError?.(error as Error)
    }
  }, [onCopyMessage, onError])

  return (
    <div
      className="flex flex-col h-full max-w-4xl mx-auto w-full"
      data-testid="chat-container"
      data-conversation-id={conversationId}
      role="region"
      aria-label="Chat conversation interface"
    >
      {/* Conversation Area */}
      <div className="flex-1 overflow-hidden">
        <ConversationView
          messages={messages}
          isLoading={isProcessing}
          onRetry={onRetry ? handleRetry : undefined}
          autoScroll={autoScroll}
          maxHeight={maxHeight}
          showMessageActions={showMessageActions}
          onCopyMessage={showMessageActions ? handleCopyMessage : undefined}
        />
      </div>

      {/* Input Area - Fixed to bottom */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <MessageInput
          onSendMessage={handleSendMessage}
          isDisabled={isProcessing}
          placeholder="Type your message..."
          multiline={true}
          showCharCount={true}
          maxLength={2000}
          onCancelStream={isStreaming ? cancelStream : undefined}
        />
      </div>
    </div>
  )
}