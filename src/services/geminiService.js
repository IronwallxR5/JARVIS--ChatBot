/**
 * Gemini AI Service
 * Implementation of the AI Provider interface for Google's Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './aiService';
import { API_CONFIG, ERROR_TYPES } from '../constants';
import { SYSTEM_PROMPT, buildContextualPrompt } from '../constants/prompts';

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
      this.model = this.genAI.getGenerativeModel({ 
        model: this.config.model || API_CONFIG.MODEL,
        systemInstruction: SYSTEM_PROMPT,
      });
    } catch (error) {
      console.error('Failed to initialize Gemini:', error);
    }
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
   * Generate a response using Gemini
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
      // Build contextual prompt with history if needed
      const contextualPrompt = buildContextualPrompt(prompt, conversationHistory);
      
      // Generate content
      const result = await this.model.generateContent(contextualPrompt);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      // Handle specific error types
      const enhancedError = this._handleError(error);
      
      // Retry logic for transient errors
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

export default {
  GeminiProvider,
  getGeminiProvider,
  generateContent,
};
