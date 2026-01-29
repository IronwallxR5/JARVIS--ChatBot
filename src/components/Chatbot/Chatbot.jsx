/**
 * Chatbot Component
 * Main chat interface that orchestrates all chat functionality
 * 
 * Architecture:
 * - Uses useChat hook for state management
 * - Composed of smaller, reusable components
 * - Supports accessibility and keyboard navigation
 */

import React, { memo, useCallback } from 'react';
import { useChat } from '../../hooks';
import ChatMessage from '../ChatMessage';
import ChatInput from '../ChatInput';
import TypingIndicator from '../TypingIndicator';
import EmptyState from '../EmptyState';
import ErrorBanner from '../ErrorBanner';
import './Chatbot.css';

/**
 * Chat header with status indicator
 */
const ChatHeader = memo(({ isConfigured }) => (
  <header className="chat-header" role="banner">
    <div className="header-content">
      <div className="header-status">
        <span 
          className={`status-indicator ${isConfigured ? 'online' : 'offline'}`}
          aria-label={isConfigured ? 'Online' : 'Offline'}
        />
        <h1 className="header-title">JARVIS</h1>
      </div>
      <span className="header-subtitle">AI Assistant</span>
    </div>
  </header>
));

ChatHeader.displayName = 'ChatHeader';

/**
 * Message list container
 */
const MessageList = memo(({ messages, messagesEndRef }) => (
  <div 
    className="chat-messages" 
    role="log" 
    aria-live="polite"
    aria-label="Chat messages"
  >
    {messages.map((message) => (
      <ChatMessage 
        key={message.id} 
        message={message}
        showTimestamp={true}
      />
    ))}
    <div ref={messagesEndRef} aria-hidden="true" />
  </div>
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
    
    // Refs
    messagesEndRef,
    inputRef,
    
    // Actions
    sendMessage,
    handleInputChange,
    retryLastMessage,
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

  return (
    <div 
      className="chatbot-container"
      role="region"
      aria-label="JARVIS AI Chat"
    >
      <ChatHeader isConfigured={isConfigured} />
      
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
          <MessageList 
            messages={messages}
            messagesEndRef={messagesEndRef}
          />
        )}
        
        {isLoading && <TypingIndicator />}
      </main>
      
      <ChatInput
        value={inputValue}
        onChange={handleInputChange}
        onSubmit={sendMessage}
        isLoading={isLoading}
        isDisabled={!isConfigured}
        inputRef={inputRef}
      />
    </div>
  );
});

Chatbot.displayName = 'Chatbot';

export default Chatbot;
