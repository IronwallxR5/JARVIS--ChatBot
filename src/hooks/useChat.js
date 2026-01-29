/**
 * useChat Hook
 * Centralized chat state management with streaming support
 * Optimized for 60fps rendering during streaming
 */

import { useState, useCallback, useRef, useEffect, useTransition } from 'react';
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
  // State management
  const [messages, setMessages] = useState([]);
  const [chatState, setChatState] = useState(CHAT_STATE.IDLE);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState('');
  
  // Isolated streaming state - prevents full re-renders
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  
  // React 19 transition for non-urgent updates
  const [isPending, startTransition] = useTransition();
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const aiProviderRef = useRef(null);
  const initializedRef = useRef(false);
  const lastChunkTimeRef = useRef(0);
  const pendingChunkRef = useRef('');
  const rafIdRef = useRef(null);

  // Initialize AI provider
  useEffect(() => {
    if (!aiProviderRef.current) {
      aiProviderRef.current = getGeminiProvider();
    }
    
    // Cleanup RAF on unmount
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
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

  // Auto-scroll to bottom (throttled during streaming)
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'instant' 
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  // Also scroll during streaming (less frequently)
  useEffect(() => {
    if (streamingContent) {
      scrollToBottom(false);
    }
  }, [streamingContent, scrollToBottom]);

  // Focus input
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Throttled streaming update - batches updates for 60fps
   * Uses requestAnimationFrame for optimal rendering
   */
  const updateStreamingContent = useCallback((content) => {
    pendingChunkRef.current = content;
    
    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(() => {
        setStreamingContent(pendingChunkRef.current);
        rafIdRef.current = null;
      });
    }
  }, []);

  /**
   * Cancel active streaming
   */
  const cancelStreaming = useCallback(() => {
    const provider = aiProviderRef.current || getGeminiProvider();
    provider.cancelStream();
    
    // Finalize current streaming message if exists
    if (streamingMessageId && streamingContent) {
      const finalMessage = createBotMessage(streamingContent);
      finalMessage.id = streamingMessageId;
      setMessages(prev => [...prev, finalMessage]);
    }
    
    setStreamingContent('');
    setStreamingMessageId(null);
    setChatState(CHAT_STATE.IDLE);
  }, [streamingMessageId, streamingContent]);

  /**
   * Send a message with streaming response
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
    const streamingId = `streaming-${Date.now()}`;
    
    // Clear input and add user message (use transition for non-blocking UI)
    startTransition(() => {
      setInputValue('');
      setMessages(prev => [...prev, userMessage]);
    });
    
    // Initialize streaming state
    setStreamingMessageId(streamingId);
    setStreamingContent('');
    setChatState(CHAT_STATE.STREAMING);
    setError(null);

    try {
      const provider = aiProviderRef.current || getGeminiProvider();
      
      await provider.generateStreamingResponse(validation.value, {
        onChunk: (accumulatedText) => {
          // Throttled update for smooth 60fps rendering
          updateStreamingContent(accumulatedText);
        },
        onComplete: (finalText) => {
          // Finalize the message
          const botMessage = createBotMessage(finalText);
          botMessage.id = streamingId;
          
          startTransition(() => {
            setMessages(prev => [...prev, botMessage]);
            setStreamingContent('');
            setStreamingMessageId(null);
            setChatState(CHAT_STATE.SUCCESS);
          });
        },
        onError: (err) => {
          console.error('Streaming error:', err);
          
          const errorMessage = createErrorMessage(err);
          setMessages(prev => [...prev, errorMessage]);
          setStreamingContent('');
          setStreamingMessageId(null);
          setError(err.message);
          setChatState(CHAT_STATE.ERROR);
        },
      });
    } catch (err) {
      console.error('Chat error:', err);
      
      const errorMessage = createErrorMessage(err);
      setMessages(prev => [...prev, errorMessage]);
      setStreamingContent('');
      setStreamingMessageId(null);
      setError(err.message);
      setChatState(CHAT_STATE.ERROR);
    }
  }, [inputValue, updateStreamingContent, startTransition]);

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
    cancelStreaming();
    setMessages([]);
    setError(null);
    setChatState(CHAT_STATE.IDLE);
    initializedRef.current = false;
  }, [cancelStreaming]);

  /**
   * Retry the last failed message
   */
  const retryLastMessage = useCallback(() => {
    if (chatState !== CHAT_STATE.ERROR) return;
    
    const lastUserMessage = [...messages]
      .reverse()
      .find(msg => msg.sender === SENDER.USER);
    
    if (lastUserMessage) {
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
    isLoading: chatState === CHAT_STATE.LOADING || chatState === CHAT_STATE.STREAMING,
    isStreaming: chatState === CHAT_STATE.STREAMING,
    isPending,
    
    // Streaming state (isolated for performance)
    streamingContent,
    streamingMessageId,
    
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
    cancelStreaming,
    
    // Setters (for advanced use cases)
    setInputValue,
    setError,
  };
};

export default useChat;
