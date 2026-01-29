/**
 * Gemini AI Service
 * Implementation of the AI Provider interface for Google's Gemini API
 * Supports both standard and streaming responses
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './aiService';
import { API_CONFIG, ERROR_TYPES } from '../constants';
import { getSystemPrompt, buildContextualPrompt } from '../constants/prompts';

/**
 * Gemini Provider Implementation
 * Handles all interactions with Google's Gemini API
 */
export class GeminiProvider extends AIProvider {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    this.model = null;
    this.genAI = null;
    this.activeAbortController = null;
    this._initialize();
  }

  /**
   * Initialize the Gemini client
   * @private
   */
  _initialize() {
    if (!this.apiKey) {
      console.warn('Gemini API key not configured');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      // System instruction is fetched dynamically to support runtime changes
      this.model = this.genAI.getGenerativeModel({ 
        model: this.config.model || API_CONFIG.MODEL,
        systemInstruction: getSystemPrompt(),
      });
    } catch (error) {
      console.error('Failed to initialize Gemini:', error);
    }
  }

  /**
   * Refresh model with current system prompt
   * Call this if system prompt changes at runtime
   */
  refreshModel() {
    this._initialize();
  }

  /**
   * Check if Gemini is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    return Boolean(this.apiKey && this.model);
  }

  /**
   * Get provider name
   * @returns {string}
   */
  getName() {
    return 'Google Gemini';
  }

  /**
   * Cancel any active streaming request
   */
  cancelStream() {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
  }

  /**
   * Generate a streaming response using Gemini
   * @param {string} prompt - User prompt
   * @param {Object} options - Additional options
   * @param {Function} options.onChunk - Callback for each chunk (receives accumulated text)
   * @param {Function} options.onComplete - Callback when streaming completes
   * @param {Function} options.onError - Callback on error
   * @returns {Promise<void>}
   */
  async generateStreamingResponse(prompt, options = {}) {
    if (!this.isConfigured()) {
      const error = this._createError(ERROR_TYPES.API_KEY_MISSING, 'Gemini API key not configured');
      options.onError?.(error);
      throw error;
    }

    const { 
      conversationHistory = [], 
      onChunk, 
      onComplete, 
      onError,
    } = options;

    // Cancel any existing stream
    this.cancelStream();
    
    // Create new abort controller for this request
    this.activeAbortController = new AbortController();

    try {
      const contextualPrompt = buildContextualPrompt(prompt, conversationHistory);
      
      // Use streaming API
      const result = await this.model.generateContentStream(contextualPrompt);
      
      let accumulatedText = '';
      
      // Process stream chunks
      for await (const chunk of result.stream) {
        // Check if cancelled
        if (this.activeAbortController?.signal.aborted) {
          break;
        }
        
        const chunkText = chunk.text();
        accumulatedText += chunkText;
        
        // Call chunk callback with accumulated text
        onChunk?.(accumulatedText);
      }
      
      // Stream complete
      this.activeAbortController = null;
      onComplete?.(accumulatedText);
      
      return accumulatedText;
    } catch (error) {
      this.activeAbortController = null;
      
      // Don't treat abort as error
      if (error.name === 'AbortError') {
        return;
      }
      
      const enhancedError = this._handleError(error);
      onError?.(enhancedError);
      throw enhancedError;
    }
  }

  /**
   * Generate a non-streaming response using Gemini (legacy support)
   * @param {string} prompt - User prompt
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - AI response
   */
  async generateResponse(prompt, options = {}) {
    if (!this.isConfigured()) {
      throw this._createError(ERROR_TYPES.API_KEY_MISSING, 'Gemini API key not configured');
    }

    const { conversationHistory = [], retryCount = 0 } = options;

    try {
      const contextualPrompt = buildContextualPrompt(prompt, conversationHistory);
      const result = await this.model.generateContent(contextualPrompt);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      const enhancedError = this._handleError(error);
      
      if (this._isRetryableError(error) && retryCount < API_CONFIG.MAX_RETRIES) {
        await this._delay(API_CONFIG.RETRY_DELAY * (retryCount + 1));
        return this.generateResponse(prompt, { ...options, retryCount: retryCount + 1 });
      }
      
      throw enhancedError;
    }
  }

  /**
   * Create a structured error object
   * @private
   */
  _createError(type, message) {
    const error = new Error(message);
    error.type = type;
    return error;
  }

  /**
   * Handle and categorize API errors
   * @private
   */
  _handleError(error) {
    const message = error?.message?.toLowerCase() || '';
    
    if (message.includes('api key') || message.includes('api_key') || message.includes('invalid')) {
      return this._createError(ERROR_TYPES.API_KEY_INVALID, 'Invalid API key. Please check your configuration.');
    }
    
    if (message.includes('quota') || message.includes('limit exceeded')) {
      return this._createError(ERROR_TYPES.QUOTA_EXCEEDED, 'API quota exceeded. Please try again later.');
    }
    
    if (message.includes('rate') || message.includes('429')) {
      return this._createError(ERROR_TYPES.RATE_LIMITED, 'Rate limit exceeded. Please slow down.');
    }
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return this._createError(ERROR_TYPES.NETWORK_ERROR, 'Network error. Please check your connection.');
    }
    
    return this._createError(ERROR_TYPES.UNKNOWN, error.message || 'An unexpected error occurred.');
  }

  /**
   * Check if error is retryable
   * @private
   */
  _isRetryableError(error) {
    const message = error?.message?.toLowerCase() || '';
    return message.includes('network') || 
           message.includes('timeout') || 
           message.includes('503') ||
           message.includes('429');
  }

  /**
   * Delay utility for retry logic
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance for the default Gemini provider
let defaultInstance = null;

/**
 * Get the default Gemini provider instance
 * @returns {GeminiProvider}
 */
export const getGeminiProvider = () => {
  if (!defaultInstance) {
    defaultInstance = new GeminiProvider();
  }
  return defaultInstance;
};

/**
 * Generate content using the default Gemini provider
 * Convenience function for simple use cases
 * @param {string} prompt - User prompt
 * @returns {Promise<string>} - AI response
 */
export const generateContent = async (prompt) => {
  const provider = getGeminiProvider();
  return provider.generateResponse(prompt);
};

/**
 * Generate streaming content using the default Gemini provider
 * @param {string} prompt - User prompt
 * @param {Object} options - Streaming options
 * @returns {Promise<string>} - Complete AI response
 */
export const generateStreamingContent = async (prompt, options) => {
  const provider = getGeminiProvider();
  return provider.generateStreamingResponse(prompt, options);
};

export default {
  GeminiProvider,
  getGeminiProvider,
  generateContent,
  generateStreamingContent,
};
