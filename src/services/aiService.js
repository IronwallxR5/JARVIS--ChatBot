/**
 * AI Service Interface
 * Abstract interface for AI providers (enables easy swapping of AI backends)
 */

/**
 * Base AI Provider class
 * All AI providers should implement this interface
 */
export class AIProvider {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Generate a response from the AI
   * @param {string} prompt - User prompt
   * @param {Object} _options - Additional options (used by subclasses)
   * @returns {Promise<string>} - AI response
   */
  // eslint-disable-next-line no-unused-vars
  async generateResponse(prompt, _options = {}) {
    throw new Error('generateResponse must be implemented by subclass');
  }

  /**
   * Check if the provider is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    throw new Error('isConfigured must be implemented by subclass');
  }

  /**
   * Get the provider name
   * @returns {string}
   */
  getName() {
    throw new Error('getName must be implemented by subclass');
  }
}

/**
 * Factory function to create the appropriate AI provider
 * @param {string} providerType - Type of provider ('gemini', 'openai', etc.)
 * @param {Object} config - Provider configuration
 * @returns {AIProvider}
 */
export const createAIProvider = async (providerType, config = {}) => {
  switch (providerType.toLowerCase()) {
    case 'gemini': {
      const { GeminiProvider } = await import('./geminiService');
      return new GeminiProvider(config);
    }
    
    // Future providers can be added here:
    // case 'openai': {
    //   const { OpenAIProvider } = await import('./openaiService');
    //   return new OpenAIProvider(config);
    // }
    // case 'local': {
    //   const { LocalLLMProvider } = await import('./localService');
    //   return new LocalLLMProvider(config);
    // }
    
    default:
      throw new Error(`Unknown AI provider: ${providerType}`);
  }
};

// Default provider type (can be configured via environment)
export const DEFAULT_PROVIDER = 'gemini';
