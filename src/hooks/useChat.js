/**
 * useChat Hook
 * Centralized chat state management with high-performance streaming
 * 
 * Performance Strategy:
 * =====================
 * 1. BUFFER STRATEGY: Tokens accumulate in a mutable ref (no React state per token)
 * 2. RAF BATCHING: State flushes happen on requestAnimationFrame (~16ms intervals)
 * 3. ISOLATED STATE: Streaming content is separate from message list (no full re-renders)
 * 4. DEFERRED FINALIZATION: Message list only updates when stream completes
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

// Buffer flush interval (ms) - 60fps = ~16ms, we use slightly longer for stability
const BUFFER_FLUSH_INTERVAL = 50;

/**
 * Custom hook for managing chat state and operations
 * Optimized for 60fps streaming performance
 */
export const useChat = () => {
  // ============================================
  // STABLE STATE (changes trigger re-renders)
  // ============================================
  const [messages, setMessages] = useState([]);
  const [chatState, setChatState] = useState(CHAT_STATE.IDLE);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState('');
  
  // Isolated streaming state - ONLY StreamingMessage component subscribes to this
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  
  // React 19 transition for non-blocking UI updates
  const [isPending, startTransition] = useTransition();
  
  // ============================================
  // MUTABLE REFS (no re-renders, 60fps safe)
  // ============================================
  const inputRef = useRef(null);
  const aiProviderRef = useRef(null);
  const initializedRef = useRef(false);
  
  // Streaming buffer system
  const streamBufferRef = useRef('');
  const lastFlushTimeRef = useRef(0);
  const rafIdRef = useRef(null);
  const flushScheduledRef = useRef(false);
  const streamActiveRef = useRef(false);
  
  // ============================================
  // INITIALIZATION
  // ============================================
  
  useEffect(() => {
    if (!aiProviderRef.current) {
      aiProviderRef.current = getGeminiProvider();
    }
    
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, []);

  const isConfigured = hasValidApiKey();

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

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // ============================================
  // STREAMING BUFFER SYSTEM
  // ============================================
  
  const flushBuffer = useCallback(() => {
    if (!streamActiveRef.current) return;
    
    const bufferedContent = streamBufferRef.current;
    if (bufferedContent) {
      setStreamingContent(bufferedContent);
    }
    
    flushScheduledRef.current = false;
    rafIdRef.current = null;
  }, []);

  const scheduleFlush = useCallback(() => {
    if (flushScheduledRef.current || !streamActiveRef.current) return;
    
    const now = performance.now();
    const timeSinceLastFlush = now - lastFlushTimeRef.current;
    
    if (timeSinceLastFlush >= BUFFER_FLUSH_INTERVAL) {
      flushScheduledRef.current = true;
      lastFlushTimeRef.current = now;
      rafIdRef.current = requestAnimationFrame(flushBuffer);
    } else {
      const remainingTime = BUFFER_FLUSH_INTERVAL - timeSinceLastFlush;
      flushScheduledRef.current = true;
      
      setTimeout(() => {
        if (streamActiveRef.current) {
          lastFlushTimeRef.current = performance.now();
          rafIdRef.current = requestAnimationFrame(flushBuffer);
        } else {
          flushScheduledRef.current = false;
        }
      }, remainingTime);
    }
  }, [flushBuffer]);

  const accumulateToken = useCallback((accumulatedText) => {
    streamBufferRef.current = accumulatedText;
    scheduleFlush();
  }, [scheduleFlush]);

  const resetStreamingState = useCallback(() => {
    streamActiveRef.current = false;
    streamBufferRef.current = '';
    flushScheduledRef.current = false;
    lastFlushTimeRef.current = 0;
    
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    setStreamingContent('');
    setStreamingMessageId(null);
  }, []);

  // ============================================
  // STREAM CANCELLATION
  // ============================================
  
  const cancelStreaming = useCallback(() => {
    const provider = aiProviderRef.current || getGeminiProvider();
    provider.cancelStream();
    
    const partialContent = streamBufferRef.current;
    const currentStreamingId = streamingMessageId;
    
    if (currentStreamingId && partialContent && partialContent.trim()) {
      const partialMessage = createBotMessage(partialContent);
      partialMessage.id = currentStreamingId;
      setMessages(prev => [...prev, partialMessage]);
    }
    
    resetStreamingState();
    setChatState(CHAT_STATE.IDLE);
  }, [streamingMessageId, resetStreamingState]);

  // ============================================
  // SEND MESSAGE WITH STREAMING
  // ============================================
  
  const sendMessage = useCallback(async (text = inputValue) => {
    const validation = validateMessage(text);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    const userMessage = createUserMessage(validation.value);
    const streamingId = `streaming-${Date.now()}`;
    
    startTransition(() => {
      setInputValue('');
      setMessages(prev => [...prev, userMessage]);
    });
    
    streamActiveRef.current = true;
    streamBufferRef.current = '';
    lastFlushTimeRef.current = performance.now();
    
    setStreamingMessageId(streamingId);
    setStreamingContent('');
    setChatState(CHAT_STATE.STREAMING);
    setError(null);

    try {
      const provider = aiProviderRef.current || getGeminiProvider();
      
      await provider.generateStreamingResponse(validation.value, {
        onChunk: (accumulatedText) => {
          accumulateToken(accumulatedText);
        },
        
        onComplete: (finalText) => {
          const botMessage = createBotMessage(finalText);
          botMessage.id = streamingId;
          
          startTransition(() => {
            setMessages(prev => [...prev, botMessage]);
            resetStreamingState();
            setChatState(CHAT_STATE.SUCCESS);
          });
        },
        
        onError: (err) => {
          console.error('Streaming error:', err);
          
          const partialContent = streamBufferRef.current;
          if (partialContent && partialContent.trim()) {
            const partialMessage = createBotMessage(partialContent + '\n\n[Stream interrupted]');
            partialMessage.id = streamingId;
            setMessages(prev => [...prev, partialMessage]);
          } else {
            const errorMessage = createErrorMessage(err);
            setMessages(prev => [...prev, errorMessage]);
          }
          
          resetStreamingState();
          setError(err.message);
          setChatState(CHAT_STATE.ERROR);
        },
      });
    } catch (err) {
      console.error('Chat error:', err);
      
      const errorMessage = createErrorMessage(err);
      setMessages(prev => [...prev, errorMessage]);
      resetStreamingState();
      setError(err.message);
      setChatState(CHAT_STATE.ERROR);
    }
  }, [inputValue, accumulateToken, resetStreamingState, startTransition]);

  // ============================================
  // INPUT HANDLING
  // ============================================
  
  const handleInputChange = useCallback((value) => {
    setInputValue(value);
    if (error) setError(null);
  }, [error]);

  // ============================================
  // MESSAGE MANAGEMENT
  // ============================================
  
  const clearMessages = useCallback(() => {
    cancelStreaming();
    setMessages([]);
    setError(null);
    setChatState(CHAT_STATE.IDLE);
    initializedRef.current = false;
  }, [cancelStreaming]);

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

  const deleteMessage = useCallback((messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const copyMessage = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }, []);

  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  const isLoading = chatState === CHAT_STATE.LOADING || chatState === CHAT_STATE.STREAMING;
  const isStreaming = chatState === CHAT_STATE.STREAMING;

  // ============================================
  // PUBLIC API
  // ============================================
  
  return {
    messages,
    chatState,
    error,
    inputValue,
    isConfigured,
    isLoading,
    isStreaming,
    isPending,
    streamingContent,
    streamingMessageId,
    inputRef,
    sendMessage,
    handleInputChange,
    clearMessages,
    retryLastMessage,
    deleteMessage,
    copyMessage,
    focusInput,
    cancelStreaming,
    setInputValue,
    setError,
  };
};

export default useChat;
