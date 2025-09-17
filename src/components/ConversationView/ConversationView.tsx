'use client'

import React, { useEffect, useRef, memo } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, RotateCcw } from 'lucide-react'

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
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll functionality with streaming optimization
  useEffect(() => {
    if (autoScroll && containerRef.current) {
      const container = containerRef.current
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 10

      // Only auto-scroll if user hasn't manually scrolled up or if currently streaming
      const hasStreamingMessage = messages.some(msg => msg.status === 'streaming')
      if (isAtBottom || container.scrollTop === 0 || hasStreamingMessage) {
        // Use requestAnimationFrame for smooth scrolling during streaming
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight
        })
      }
    }
  }, [messages, autoScroll])

  const formatTimestamp = (timestamp: Date) => {
    if (!timestamp || isNaN(timestamp.getTime())) {
      return ''
    }
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Memoized message component for performance during streaming
  const MessageItem = memo(({ message }: { message: Message }) => {
    const content = message.content ?? ''
    const role = message.role ?? 'user'
    const status = message.status ?? 'complete'
    const isUser = role === 'user'

    return (
      <div
        key={message.id}
        className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
        data-role={role}
        data-status={status}
      >
        <div className={`flex flex-col max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Message bubble */}
          <article
            className={`
              px-4 py-2 rounded-2xl text-sm
              ${isUser
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-muted text-foreground rounded-bl-sm'
              }
              ${status === 'failed' ? 'ring-2 ring-destructive' : ''}
            `}
            aria-label={`${isUser ? 'User' : 'Assistant'} message`}
          >
            <div className="whitespace-pre-wrap break-words">
              {content}
              {status === 'streaming' && (
                <div
                  data-testid="typing-indicator"
                  aria-label="Typing indicator"
                  role="status"
                  className="inline-flex items-center space-x-1 ml-2"
                >
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Message metadata and actions */}
          <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <time>{formatTimestamp(message.timestamp)}</time>

            {/* Action buttons */}
            {(showMessageActions && status === 'complete' && onCopyMessage) || (status === 'failed' && onRetry) ? (
              <div className="flex items-center gap-1">
                {showMessageActions && status === 'complete' && onCopyMessage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-accent"
                    onClick={() => onCopyMessage(message.id, message.content)}
                    aria-label={`Copy message: ${message.content.substring(0, 50)}`}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
                {status === 'failed' && onRetry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-accent text-destructive hover:text-destructive"
                    onClick={() => onRetry(message.id)}
                    aria-label={`Retry message: ${message.content.substring(0, 50)}`}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    )
  })

  // Add display name for debugging
  MessageItem.displayName = 'MessageItem'

  // Generate dynamic class names and styles
  const containerClassName = [
    'conversation-view',
    maxHeight ? 'conversation-view--scrollable' : ''
  ].filter(Boolean).join(' ')

  const containerStyle: React.CSSProperties = {
    ...(maxHeight && { maxHeight, overflowY: 'auto' })
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col px-4 py-6 space-y-1 ${containerClassName}`}
      style={containerStyle}
      aria-label="Conversation messages"
      role="region"
      data-auto-scroll={autoScroll?.toString()}
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
          Start a conversation...
        </div>
      ) : (
        messages.map(message => (
          <MessageItem key={message.id} message={message} />
        ))
      )}

      {isLoading && (
        <div
          data-testid="conversation-loading"
          aria-label="Loading conversation"
          className="flex justify-start mb-4"
        >
          <div className="max-w-[70%] px-4 py-2 rounded-2xl rounded-bl-sm bg-muted text-foreground text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}