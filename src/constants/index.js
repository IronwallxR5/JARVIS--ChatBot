/**
 * Application Constants
 * Centralized configuration for the JARVIS chatbot
 */

// Application metadata
export const APP_CONFIG = {
  name: 'JARVIS',
  version: '1.0.0',
  description: 'Advanced AI Assistant powered by Google Gemini 2.0',
  author: {
    name: 'Padam',
    github: 'https://github.com/IronwallxR5/',
  },
};

// Message sender types
export const SENDER = {
  USER: 'user',
  BOT: 'bot',
  SYSTEM: 'system',
};

// Message status types
export const MESSAGE_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  ERROR: 'error',
};

// Chat states
export const CHAT_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  STREAMING: 'streaming',  // New: actively receiving streamed tokens
  ERROR: 'error',
  SUCCESS: 'success',
};

// Error types for better error handling
export const ERROR_TYPES = {
  API_KEY_MISSING: 'API_KEY_MISSING',
  API_KEY_INVALID: 'API_KEY_INVALID',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  UNKNOWN: 'UNKNOWN',
};

// User-friendly error messages
export const ERROR_MESSAGES = {
  [ERROR_TYPES.API_KEY_MISSING]: 'API key not configured. Please add your Gemini API key to .env.local file.',
  [ERROR_TYPES.API_KEY_INVALID]: 'Invalid API key. Please check your configuration.',
  [ERROR_TYPES.QUOTA_EXCEEDED]: 'API quota exceeded. Please try again later.',
  [ERROR_TYPES.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [ERROR_TYPES.RATE_LIMITED]: 'Too many requests. Please slow down.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.',
};

// Welcome messages shown when chat starts
export const WELCOME_MESSAGES = [
  {
    text: "Good to see you. I'm JARVIS — Just A Rather Very Intelligent System. Built to cut through noise and deliver clarity.",
    sender: SENDER.BOT,
  },
];

// Quick action suggestions for the user
export const QUICK_ACTIONS = [
  { label: 'Analyze a problem', prompt: 'Analyze this situation and give me your honest assessment:' },
  { label: 'Debug my code', prompt: 'Review this code and identify issues:' },
  { label: 'Strategic advice', prompt: 'I need strategic advice on:' },
  { label: 'Explain clearly', prompt: 'Explain this concept in simple terms:' },
];

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  SEND_MESSAGE: 'Enter',
  NEW_LINE: 'Shift+Enter',
  CLEAR_INPUT: 'Escape',
};

// Animation durations (in ms)
export const ANIMATIONS = {
  MESSAGE_FADE_IN: 300,
  TYPING_INDICATOR: 1000,
  SCROLL_SMOOTH: 'smooth',
};

// Local storage keys
export const STORAGE_KEYS = {
  CHAT_HISTORY: 'jarvis_chat_history',
  USER_PREFERENCES: 'jarvis_preferences',
  THEME: 'jarvis_theme',
};

// API configuration
export const API_CONFIG = {
  MODEL: 'gemini-2.0-flash',
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 30000,
};

// Input validation
export const INPUT_VALIDATION = {
  MAX_LENGTH: 10000,
  MIN_LENGTH: 1,
};
