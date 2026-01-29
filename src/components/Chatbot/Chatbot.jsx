/**
 * Chatbot Component
 * Main chat interface that orchestrates all chat functionality
 * 
 * Architecture:
 * - Uses useChat hook for state management with streaming support
 * - Composed of smaller, reusable components
 * - Supports accessibility and keyboard navigation
 * - Optimized for 60fps during streaming
 */

import React, { memo, useCallback, useMemo } from 'react';
import { useChat } from '../../hooks';
import ChatMessage from '../ChatMessage';
import ChatInput from '../ChatInput';
import TypingIndicator from '../TypingIndicator';
import EmptyState from '../EmptyState';
import ErrorBanner from '../ErrorBanner';
import { SENDER } from '../../constants';
import './Chatbot.css';

/**
 * Floating arc reactor decoration
 */
const ArcReactor = memo(() => (
  <div className="floating-reactor" aria-hidden="true">
    <div className="reactor-core"></div>
    <div className="reactor-ring"></div>
    <div className="reactor-glow"></div>
  </div>
));

ArcReactor.displayName = 'ArcReactor';

/**
 * Streaming message component - renders the active streaming content
 * Isolated to prevent re-renders of the full message list
 */
const StreamingMessage = memo(({ content, messageId }) => {
  if (!content || !messageId) return null;
  
  const streamingMessage = {
    id: messageId,
    text: content,
    sender: SENDER.BOT,
    timestamp: Date.now(),
  };
  
  return (
    <ChatMessage 
      message={streamingMessage}
      showTimestamp={false}
      isStreaming={true}
    />
  );
});

StreamingMessage.displayName = 'StreamingMessage';

/**
 * Message list container - memoized to prevent re-renders during streaming
 */
const MessageList = memo(({ messages }) => (
  <>
    {messages.map((message) => (
      <ChatMessage 
        key={message.id} 
        message={message}
        showTimestamp={true}
      />
    ))}
  </>
));

MessageList.displayName = 'MessageList';

/**
 * Main Chatbot Component
 */
const Chatbot = memo(() => {
  const {
    // State
    messages,
    error,
    inputValue,
    isConfigured,
    isLoading,
    isStreaming,
    
    // Streaming state (isolated for performance)
    streamingContent,
    streamingMessageId,
    
    // Refs
    messagesEndRef,
    inputRef,
    
    // Actions
    sendMessage,
    handleInputChange,
    retryLastMessage,
    cancelStreaming,
    setError,
    setInputValue,
  } = useChat();

  // Handle quick action clicks from empty state
  const handleQuickAction = useCallback((prompt) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  }, [setInputValue, inputRef]);

  // Dismiss error
  const handleDismissError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Determine if we should show empty state
  const showEmptyState = messages.length === 0 || !isConfigured;
  const showMessages = messages.length > 0 && isConfigured;
  
  // Memoize the message list to prevent re-renders during streaming
  const memoizedMessages = useMemo(() => messages, [messages]);

  return (
    <div 
      className="chatbot-container"
      role="region"
      aria-label="JARVIS AI Chat"
    >
      <ArcReactor />
      
      {error && (
        <ErrorBanner 
          message={error}
          onDismiss={handleDismissError}
          onRetry={retryLastMessage}
        />
      )}
      
      <main className="chat-main">
        {showEmptyState && (
          <EmptyState 
            onActionClick={handleQuickAction}
            isConfigured={isConfigured}
          />
        )}
        
        {showMessages && (
          <div 
            className="chat-messages" 
            role="log" 
            aria-live="polite"
            aria-label="Chat messages"
          >
            <MessageList messages={memoizedMessages} />
            
            {/* Isolated streaming message for performance */}
            <StreamingMessage 
              content={streamingContent}
              messageId={streamingMessageId}
            />
            
            {/* Loading indicator (non-streaming fallback) */}
            {isLoading && !isStreaming && <TypingIndicator />}
            
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>
        )}
        
        {!showMessages && isLoading && <TypingIndicator />}
      </main>
      
      <ChatInput
        value={inputValue}
        onChange={handleInputChange}
        onSubmit={sendMessage}
        onCancel={isStreaming ? cancelStreaming : undefined}
        isLoading={isLoading}
        isStreaming={isStreaming}
        isDisabled={!isConfigured}
        inputRef={inputRef}
      />
    </div>
  );
});

Chatbot.displayName = 'Chatbot';

export default Chatbot;
