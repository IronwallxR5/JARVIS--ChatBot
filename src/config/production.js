import { GoogleGenerativeAI } from '@google/generative-ai';

// Production configuration for Gemini API
const getGeminiConfig = () => {
  // In production, the API key should be set as an environment variable
  // on your hosting platform (e.g., Vercel, Netlify, etc.)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('Gemini API key is missing. Please check your .env.local file');
    throw new Error('Gemini API key is not configured');
  }

  return {
    apiKey,
    model: "gemini-2.0-flash"
  };
};

// Initialize Gemini with production config
const config = getGeminiConfig();
const genAI = new GoogleGenerativeAI(config.apiKey);
const model = genAI.getGenerativeModel({ model: config.model });

// System prompt to guide the AI's responses
const SYSTEM_PROMPT = `You are Jarvis, a helpful and friendly AI assistant. Your responses should be:
1. Clear and concise
2. Helpful and informative
3. Professional yet friendly
4. Focused on providing accurate information
5. Limited to 2-3 sentences for most responses
6. Include emojis occasionally to make the conversation more engaging

Remember to:
- Be honest if you don't know something
- Ask for clarification when needed
- Keep responses relevant to the user's question
- Maintain a consistent personality throughout the conversation`;

export const generateContent = async (prompt) => {
  try {
    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    console.log('Received response from Gemini API');
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Detailed Gemini API Error:', {
      message: error.message,
      status: error.status,
      details: error.details
    });
    
    // Return a more specific error message based on the error type
    if (error.message.includes('API key')) {
      throw new Error('Invalid or missing API key. Please check your configuration.');
    } else if (error.message.includes('quota')) {
      throw new Error('API quota exceeded. Please check your usage limits.');
    } else {
      throw new Error('Failed to get response from Gemini API. Please try again later.');
    }
  }
};

export default {
  generateContent
}; 