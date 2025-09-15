import React from 'react'

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
}

export function ConversationView({ messages = [], isLoading = false }: ConversationViewProps) {
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

        {status === 'failed' && (
          <div role="alert" aria-label="Message failed">
            <button
              type="button"
              onClick={() => {
                // Retry logic would be handled by parent component
                console.log('Retry message:', message.id)
              }}
            >
              Retry
            </button>
          </div>
        )}

        <time className="message__timestamp">
          {formatTimestamp(message.timestamp)}
        </time>
      </article>
    )
  }

  return (
    <main
      className="conversation-view"
      aria-label="Conversation messages"
      role="main"
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