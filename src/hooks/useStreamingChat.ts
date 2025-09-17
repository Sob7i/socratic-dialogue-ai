import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

// Simple wrapper to maintain compatibility with existing components
export function useStreamingChat() {
  const { messages, status, error, regenerate, sendMessage } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' })
  })

  const isLoading = status === 'streaming'

  // Convert AI SDK messages to our format for compatibility
  const formattedMessages = messages.map((msg: any) => {
    const textPart = msg.parts?.find((part: any) => part.type === 'text')
    return {
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: textPart?.text || '',
      status: isLoading && msg === messages[messages.length - 1]
        ? 'streaming' as const
        : error
          ? 'failed' as const
          : 'complete' as const,
      timestamp: msg.createdAt || new Date(),
    }
  })

  return {
    messages: formattedMessages,
    isStreaming: isLoading,
    streamError: error,
    sendMessage: async (content: string) => {
      sendMessage({ text: content })
    },
    retryMessage: async () => {
      regenerate()
    },
    cancelStream: () => {
      // AI SDK doesn't expose cancel directly, but we can implement if needed
    },
  }
}