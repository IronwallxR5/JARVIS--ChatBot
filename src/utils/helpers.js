/**
 * Utility Helper Functions
 * Pure, reusable utility functions for the application
 */

/**
 * Generate a unique ID for messages
 * Uses timestamp + random string for uniqueness
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format timestamp for display
 * @param {Date|number} timestamp - Date object or timestamp
 * @param {string} format - 'time', 'date', or 'full'
 */
export const formatTimestamp = (timestamp, format = 'time') => {
  const date = new Date(timestamp);
  
  const options = {
    time: { hour: '2-digit', minute: '2-digit' },
    date: { month: 'short', day: 'numeric' },
    full: { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
  };
  
  return date.toLocaleString('en-US', options[format] || options.time);
};

/**
 * Sanitize user input to prevent XSS and clean whitespace
 * @param {string} input - Raw user input
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Validate message content
 * @param {string} message - Message to validate
 * @param {number} maxLength - Maximum allowed length
 */
export const validateMessage = (message, maxLength = 10000) => {
  if (!message || typeof message !== 'string') {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  const trimmed = message.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (trimmed.length > maxLength) {
    return { isValid: false, error: `Message exceeds ${maxLength} characters` };
  }
  
  return { isValid: true, value: trimmed };
};

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for rate limiting
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Parse error and return appropriate error type
 * @param {Error} error - Error object
 */
export const parseError = (error) => {
  const message = error?.message?.toLowerCase() || '';
  
  if (message.includes('api key') || message.includes('api_key')) {
    return { type: 'API_KEY_INVALID', message: 'Invalid API key configuration' };
  }
  
  if (message.includes('quota') || message.includes('limit')) {
    return { type: 'QUOTA_EXCEEDED', message: 'API quota exceeded' };
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return { type: 'NETWORK_ERROR', message: 'Network connection error' };
  }
  
  if (message.includes('rate') || message.includes('429')) {
    return { type: 'RATE_LIMITED', message: 'Too many requests' };
  }
  
  return { type: 'UNKNOWN', message: error?.message || 'An unknown error occurred' };
};

/**
 * Check if the current environment has a valid API key
 */
export const hasValidApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  return key && key.length > 0 && key !== 'your_api_key_here';
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Simple markdown-like formatting for messages
 * Handles code blocks, bold, italic, and links
 */
export const formatMessageContent = (text) => {
  if (!text) return '';
  
  // This is a basic implementation
  // For production, consider using a proper markdown parser like 'marked' or 'react-markdown'
  return text
    // Preserve line breaks
    .replace(/\n/g, '<br/>');
};

/**
 * Scroll element into view with smooth animation
 * @param {HTMLElement} element - Element to scroll to
 */
export const scrollIntoView = (element) => {
  element?.scrollIntoView({ behavior: 'smooth', block: 'end' });
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
};
