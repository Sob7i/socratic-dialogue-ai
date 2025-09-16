'use client'

import React, { useEffect, useRef } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  status: 'complete' | 'streaming' | 'failed'
  timestamp: Date
}

export interface ConversationViewProps {
  messages: Message[]
  isLoading?: boolean
  onRetry?: (messageId: string) => void
  autoScroll?: boolean
  maxHeight?: string
  showMessageActions?: boolean
  onCopyMessage?: (messageId: string, content: string) => void
}

export function ConversationView({
  messages = [],
  isLoading = false,
  onRetry,
  autoScroll,
  maxHeight,
  showMessageActions = false,
  onCopyMessage
}: ConversationViewProps) {
  const containerRef = useRef<HTMLElement>(null)

  // Auto-scroll functionality
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      const container = containerRef.current
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 10

      // Only auto-scroll if user hasn't manually scrolled up
      if (isAtBottom || container.scrollTop === 0) {
        container.scrollTop = container.scrollHeight
      }
    }
  }, [messages, autoScroll])

  const formatTimestamp = (timestamp: Date) => {
    if (!timestamp || isNaN(timestamp.getTime())) {
      return ''
    }
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const renderMessage = (message: Message) => {
    const content = message.content ?? ''
    const role = message.role ?? 'user'
    const status = message.status ?? 'complete'

    return (
      <article
        key={message.id}
        className={`message message--${role} ${role === 'user' ? 'user' : 'assistant'}`}
        data-role={role}
        data-status={status}
        aria-label={`${role === 'user' ? 'User' : 'Assistant'} message`}
      >
        <div className="message__content">
          {content}
          {status === 'streaming' && (
            <>
              <div
                data-testid="typing-indicator"
                aria-label="Typing indicator"
                role="status"
                className="typing-indicator"
              >
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </>
          )}
        </div>

        {status === 'failed' && onRetry && (
          <div role="alert" aria-label="Message failed">
            <button
              type="button"
              onClick={() => onRetry(message.id)}
              aria-label={`Retry message: ${message.content.substring(0, 50)}`}
            >
              Retry
            </button>
          </div>
        )}

        {showMessageActions && status === 'complete' && onCopyMessage && (
          <div className="message__actions">
            <button
              type="button"
              onClick={() => onCopyMessage(message.id, message.content)}
              aria-label={`Copy message: ${message.content.substring(0, 50)}`}
            >
              Copy
            </button>
          </div>
        )}

        <time className="message__timestamp">
          {formatTimestamp(message.timestamp)}
        </time>
      </article>
    )
  }

  // Generate dynamic class names and styles
  const containerClassName = [
    'conversation-view',
    maxHeight ? 'conversation-view--scrollable' : ''
  ].filter(Boolean).join(' ')

  const containerStyle: React.CSSProperties = {
    ...(maxHeight && { maxHeight, overflowY: 'auto' })
  }

  return (
    <main
      ref={containerRef}
      className={containerClassName}
      style={containerStyle}
      aria-label="Conversation messages"
      role="main"
      data-auto-scroll={autoScroll?.toString()}
    >
      {messages.map(renderMessage)}

      {isLoading && (
        <div
          data-testid="conversation-loading"
          aria-label="Loading conversation"
          className="conversation-loading"
        >
          Loading...
        </div>
      )}
    </main>
  )
}