'use client'

import React, { useState, useCallback } from 'react'
import { ConversationView, Message } from '../ConversationView'
import { MessageInput } from '../MessageInput'

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
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isProcessing, setIsProcessing] = useState(false)

  // Generate unique message ID
  const generateMessageId = useCallback(() => {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  }, [])

  // Handle sending a new message
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isProcessing) {
      return
    }

    const newMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: content.trim(),
      status: 'complete',
      timestamp: new Date()
    }

    try {
      setIsProcessing(true)
      setMessages(prevMessages => [...prevMessages, newMessage])

      // Notify parent component of new message
      onMessageSent?.(newMessage)

      // Simulate brief processing delay (in real app, this would be AI response)
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (error) {
      console.error('Error sending message:', error)
      onError?.(error as Error)
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, generateMessageId, onMessageSent, onError])

  // Handle retry functionality
  const handleRetry = useCallback((messageId: string) => {
    onRetry?.(messageId)
  }, [onRetry])

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
        />
      </div>
    </div>
  )
}