/**
 * useChat Hook
 * Centralized chat state management and logic
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  createUserMessage, 
  createBotMessage, 
  createErrorMessage,
  getGeminiProvider,
} from '../services';
import { 
  CHAT_STATE, 
  WELCOME_MESSAGES,
  MESSAGE_STATUS,
  SENDER,
} from '../constants';
import { validateMessage, hasValidApiKey } from '../utils/helpers';

/**
 * Custom hook for managing chat state and operations
 * @returns {Object} - Chat state and methods
 */
export const useChat = () => {
  // State management - always use useState (no conditional hooks)
  const [messages, setMessages] = useState([]);
  const [chatState, setChatState] = useState(CHAT_STATE.IDLE);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState('');
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const aiProviderRef = useRef(null);
  const initializedRef = useRef(false);

  // Initialize AI provider
  useEffect(() => {
    if (!aiProviderRef.current) {
      aiProviderRef.current = getGeminiProvider();
    }
  }, []);

  // Check if API is configured
  const isConfigured = hasValidApiKey();

  // Initialize with welcome messages (only once)
  useEffect(() => {
    if (isConfigured && !initializedRef.current) {
      initializedRef.current = true;
      const welcomeMessages = WELCOME_MESSAGES.map((msg, index) => ({
        ...createBotMessage(msg.text),
        id: `welcome-${index}`,
      }));
      setMessages(welcomeMessages);
    }
  }, [isConfigured]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Send a message
   * @param {string} text - Message text
   */
  const sendMessage = useCallback(async (text = inputValue) => {
    // Validate input
    const validation = validateMessage(text);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    const userMessage = createUserMessage(validation.value);
    
    // Clear input and add user message
    setInputValue('');
    setMessages(prev => [...prev, userMessage]);
    setChatState(CHAT_STATE.LOADING);
    setError(null);

    try {
      // Get AI response
      const provider = aiProviderRef.current || getGeminiProvider();
      const responseText = await provider.generateResponse(validation.value);
      
      // Add bot message
      const botMessage = createBotMessage(responseText);
      setMessages(prev => [...prev, botMessage]);
      setChatState(CHAT_STATE.SUCCESS);
    } catch (err) {
      console.error('Chat error:', err);
      
      // Add error message
      const errorMessage = createErrorMessage(err);
      setMessages(prev => [...prev, errorMessage]);
      setError(err.message);
      setChatState(CHAT_STATE.ERROR);
    }
  }, [inputValue]);

  /**
   * Handle input change
   * @param {string} value - New input value
   */
  const handleInputChange = useCallback((value) => {
    setInputValue(value);
    if (error) setError(null);
  }, [error]);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setChatState(CHAT_STATE.IDLE);
    initializedRef.current = false; // Allow re-initialization
  }, []);

  /**
   * Retry the last failed message
   */
  const retryLastMessage = useCallback(() => {
    if (chatState !== CHAT_STATE.ERROR) return;
    
    // Find the last user message
    const lastUserMessage = [...messages]
      .reverse()
      .find(msg => msg.sender === SENDER.USER);
    
    if (lastUserMessage) {
      // Remove the error message and retry
      setMessages(prev => prev.filter(msg => msg.status !== MESSAGE_STATUS.ERROR));
      sendMessage(lastUserMessage.text);
    }
  }, [chatState, messages, sendMessage]);

  /**
   * Delete a specific message
   * @param {string} messageId - Message ID to delete
   */
  const deleteMessage = useCallback((messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  /**
   * Copy message text to clipboard
   * @param {string} text - Text to copy
   */
  const copyMessage = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    // State
    messages,
    chatState,
    error,
    inputValue,
    isConfigured,
    isLoading: chatState === CHAT_STATE.LOADING,
    
    // Refs
    messagesEndRef,
    inputRef,
    
    // Actions
    sendMessage,
    handleInputChange,
    clearMessages,
    retryLastMessage,
    deleteMessage,
    copyMessage,
    focusInput,
    scrollToBottom,
    
    // Setters (for advanced use cases)
    setInputValue,
    setError,
  };
};

export default useChat;
