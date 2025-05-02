import React, { useState, useEffect } from 'react';
import './Chatbot.css';
import { generateContent } from '../config/production';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check if API key is configured
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setApiKeyError(true);
      setErrorMessage('⚠️ Error: Gemini API key is not configured. Please check your .env.local file');
      setMessages([{
        text: errorMessage,
        sender: 'bot'
      }]);
    }
  }, [errorMessage]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || apiKeyError) return;

    // Add user message
    const newMessages = [...messages, { text: inputMessage, sender: 'user' }];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Get response from Gemini API
      const response = await generateContent(inputMessage);
      
      // Add bot response
      setMessages([...newMessages, { text: response, sender: 'bot' }]);
    } catch (error) {
      console.error('Chatbot Error:', error);
      const errorText = error.message || "I'm sorry, I encountered an error. Please try again later.";
      setErrorMessage(`⚠️ ${errorText}`);
      setMessages([...newMessages, { 
        text: errorText,
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <h2>Jarvis Chatbot</h2>
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
      </div>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            {message.text}
          </div>
        ))}
        {isLoading && (
          <div className="message bot-message">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={apiKeyError ? "API key not configured" : "Type your message..."}
          className="chat-input"
          disabled={isLoading || apiKeyError}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={isLoading || apiKeyError}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Chatbot; 