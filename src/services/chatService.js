/**
 * Chat Service
 * Handles chat-related operations and message management
 */

import { generateId } from '../utils/helpers';
import { SENDER, MESSAGE_STATUS } from '../constants';
import { getGeminiProvider } from './geminiService';

/**
 * Create a new message object
 * @param {string} text - Message content
 * @param {string} sender - Message sender (user/bot/system)
 * @param {Object} options - Additional options
 * @returns {Object} - Message object
 */
export const createMessage = (text, sender = SENDER.USER, options = {}) => {
  return {
    id: options.id || generateId(),
    text,
    sender,
    timestamp: options.timestamp || Date.now(),
    status: options.status || MESSAGE_STATUS.SENT,
    metadata: options.metadata || {},
  };
};

/**
 * Create a user message
 * @param {string} text - Message content
 */
export const createUserMessage = (text) => {
  return createMessage(text, SENDER.USER);
};

/**
 * Create a bot message
 * @param {string} text - Message content
 */
export const createBotMessage = (text) => {
  return createMessage(text, SENDER.BOT);
};

/**
 * Create a system message
 * @param {string} text - Message content
 */
export const createSystemMessage = (text) => {
  return createMessage(text, SENDER.SYSTEM);
};

/**
 * Create an error message from the bot
 * @param {Error} error - Error object
 */
export const createErrorMessage = (error) => {
  const errorText = "I apologize, but I encountered an issue processing your request. Please try again.";
  return createMessage(errorText, SENDER.BOT, { 
    status: MESSAGE_STATUS.ERROR,
    metadata: { 
      errorType: error?.type || 'UNKNOWN',
      errorMessage: error?.message,
    },
  });
};

/**
 * Chat Service class
 * Manages chat state and interactions
 */
export class ChatService {
  constructor(aiProvider = null) {
    this.aiProvider = aiProvider || getGeminiProvider();
    this.conversationHistory = [];
  }

  /**
   * Send a message and get a response
   * @param {string} userMessage - User's message
   * @returns {Promise<Object>} - Bot response message
   */
  async sendMessage(userMessage) {
    // Add user message to history
    const userMsg = createUserMessage(userMessage);
    this.conversationHistory.push(userMsg);

    try {
      // Get AI response
      const responseText = await this.aiProvider.generateResponse(userMessage, {
        conversationHistory: this.conversationHistory,
      });

      // Create bot message
      const botMsg = createBotMessage(responseText);
      this.conversationHistory.push(botMsg);

      return botMsg;
    } catch (error) {
      const errorMsg = createErrorMessage(error);
      return errorMsg;
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   * @returns {Array} - Array of messages
   */
  getHistory() {
    return [...this.conversationHistory];
  }

  /**
   * Check if the service is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    return this.aiProvider?.isConfigured() ?? false;
  }
}

// Singleton instance
let defaultChatService = null;

/**
 * Get the default chat service instance
 * @returns {ChatService}
 */
export const getChatService = () => {
  if (!defaultChatService) {
    defaultChatService = new ChatService();
  }
  return defaultChatService;
};

export default {
  createMessage,
  createUserMessage,
  createBotMessage,
  createSystemMessage,
  createErrorMessage,
  ChatService,
  getChatService,
};
