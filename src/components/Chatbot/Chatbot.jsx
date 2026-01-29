/**
 * Chatbot Component
 * Main chat interface that orchestrates all chat functionality
 * 
 * Architecture:
 * - Uses useChat hook for state management with streaming support
 * - Uses useStickyScroll for smart auto-scroll during streaming
 * - Composed of smaller, reusable components
 * - Supports accessibility and keyboard navigation
 * - Optimized for 60fps during streaming
 */

import React, { memo, useCallback, useMemo, useEffect } from 'react';
import { useChat, useStickyScroll } from '../../hooks';
import ChatMessage from '../ChatMessage';
import ChatInput from '../ChatInput';
import StreamingText from '../StreamingText';
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
 * Uses StreamingText for optimized plain text rendering during streaming
 * Isolated to prevent re-renders of the full message list
 */
const StreamingMessage = memo(({ content }) => {
  if (!content) return null;
  
  return (
    <div 
      className="chat-message bot streaming"
      role="article"
      aria-label="JARVIS is responding"
    >
      <div className="message-container">
        <div className="message-avatar bot-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
            <circle cx="12" cy="12" r="9" stroke="currentColor" fill="none"/>
            <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor"/>
            <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
            <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
            <circle cx="6" cy="18" r="1.5" fill="currentColor"/>
            <circle cx="18" cy="18" r="1.5" fill="currentColor"/>
            <line x1="7.5" y1="6" x2="9" y2="9" stroke="currentColor" strokeWidth="1"/>
            <line x1="16.5" y1="6" x2="15" y2="9" stroke="currentColor" strokeWidth="1"/>
            <line x1="7.5" y1="18" x2="9" y2="15" stroke="currentColor" strokeWidth="1"/>
            <line x1="16.5" y1="18" x2="15" y2="15" stroke="currentColor" strokeWidth="1"/>
            <circle cx="10.5" cy="11" r="0.8" fill="var(--jarvis-primary, #00d4ff)"/>
            <circle cx="13.5" cy="11" r="0.8" fill="var(--jarvis-primary, #00d4ff)"/>
          </svg>
        </div>
        
        <div className="message-body">
          <div className="message-header">
            <span className="message-sender">JARVIS</span>
            <span className="streaming-badge">Streaming...</span>
          </div>
          
          <div className="message-content-wrapper">
            <div className="message-text">
              <StreamingText text={content} showCursor={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
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
    
    // Refs
    inputRef,
    
    // Actions
    sendMessage,
    handleInputChange,
    retryLastMessage,
    cancelStreaming,
    setError,
    setInputValue,
  } = useChat();

  // Smart auto-scroll with user intent detection
  const { 
    containerRef, 
    scrollToBottom,
    forceScrollToBottom,
  } = useStickyScroll();

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Auto-scroll during streaming (batched via RAF in useStickyScroll)
  useEffect(() => {
    if (streamingContent) {
      scrollToBottom();
    }
  }, [streamingContent, scrollToBottom]);

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
            ref={containerRef}
            className="chat-messages" 
            role="log" 
            aria-live="polite"
            aria-label="Chat messages"
          >
            <MessageList messages={memoizedMessages} />
            
            {/* Isolated streaming message for performance */}
            <StreamingMessage content={streamingContent} />
            
            {/* Loading indicator (non-streaming fallback) */}
            {isLoading && !isStreaming && <TypingIndicator />}
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
