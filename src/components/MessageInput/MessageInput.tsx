import React, { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react'

export interface MessageInputProps {
  onSendMessage: (content: string) => void
  isDisabled?: boolean
  placeholder?: string
  maxLength?: number
  multiline?: boolean
  showCharCount?: boolean
}

export function MessageInput({
  onSendMessage,
  isDisabled = false,
  placeholder = 'Enter your message...',
  maxLength = 2000,
  multiline = false,
  showCharCount = false
}: MessageInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const trimmedValue = value.trim()
  const isSendDisabled = isDisabled || trimmedValue.length === 0
  const currentLength = value.length
  const isNearLimit = maxLength && currentLength >= maxLength * 0.8
  const isAtLimit = maxLength && currentLength >= maxLength

  // Auto-resize functionality for multiline
  useEffect(() => {
    if (multiline && textareaRef.current) {
      const textarea = textareaRef.current
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [value, multiline])

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value

    // Enforce maxLength
    if (maxLength && newValue.length > maxLength) {
      return
    }

    setValue(newValue)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (isDisabled) {
      event.preventDefault()
      return
    }

    const { key, shiftKey, ctrlKey, metaKey } = event

    if (key === 'Enter') {
      // Shift+Enter creates new line
      if (shiftKey) {
        return // Allow default behavior (new line)
      }

      // Ctrl+Enter or Cmd+Enter (Mac) sends message
      if (ctrlKey || metaKey) {
        event.preventDefault()
        handleSendMessage()
        return
      }

      // Plain Enter sends message
      event.preventDefault()
      handleSendMessage()
    }
  }

  const handleSendMessage = () => {
    if (isSendDisabled) {
      return
    }

    const messageContent = trimmedValue
    if (messageContent) {
      onSendMessage(messageContent)
      setValue('')
    }
  }

  const getCharCountClassName = () => {
    const baseClass = 'char-count'
    if (isAtLimit) return `${baseClass} char-count--error`
    if (isNearLimit) return `${baseClass} char-count--warning`
    return baseClass
  }

  return (
    <div className="message-input">
      <div className="message-input__container">
        <textarea
          ref={textareaRef}
          className="message-input__textarea"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={multiline ? 3 : 1}
          tabIndex={0}
          aria-label="Enter your message"
          maxLength={maxLength}
        />

        <button
          className="message-input__send-button"
          onClick={handleSendMessage}
          disabled={isSendDisabled}
          type="button"
          tabIndex={0}
          aria-label="Send message"
        >
          Send
        </button>
      </div>

      <div className="message-input__footer">
        {showCharCount && maxLength && (
          <div
            className={getCharCountClassName()}
            aria-live="polite"
            aria-label={`Character count: ${currentLength} of ${maxLength}`}
          >
            {currentLength}/{maxLength}
          </div>
        )}

        {isDisabled && (
          <div
            className="message-input__status"
            aria-live="polite"
          >
            Sending...
          </div>
        )}
      </div>
    </div>
  )
}