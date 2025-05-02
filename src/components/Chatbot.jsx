import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import { generateContent } from '../config/production';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check if API key is configured
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setApiKeyError(true);
      setErrorMessage('API key not configured. Please add your Gemini API key to .env.local file');
    } else {
      // Add welcome message
      setMessages([
        { 
          text: "Hello, I am JARVIS, your AI assistant powered by Google's Gemini 2.0 technology. How may I assist you today?", 
          sender: 'bot' 
        },
        {
          text: "I can answer questions, generate content, help with coding, provide information, or just chat. What would you like to know?",
          sender: 'bot'
        }
      ]);
    }
  }, []);

  // Auto scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || apiKeyError || isLoading) return;

    // Add user message
    const userMessage = inputMessage.trim();
    const newMessages = [...messages, { text: userMessage, sender: 'user' }];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Get response from Gemini API
      const response = await generateContent(userMessage);
      
      // Add bot response
      setMessages([...newMessages, { text: response, sender: 'bot' }]);
    } catch (error) {
      console.error('Chatbot Error:', error);
      const errorText = error.message || "I'm sorry, I encountered an error. Please try again later.";
      setErrorMessage(`Error: ${errorText}`);
      setMessages([...newMessages, { 
        text: "I apologize, but I've encountered an error processing your request. Please try again with a different query.",
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Group messages by sender for ChatGPT-like UI
  const groupedMessages = [];
  let currentGroup = null;

  messages.forEach((message) => {
    if (!currentGroup || currentGroup.sender !== message.sender) {
      currentGroup = { sender: message.sender, messages: [message.text] };
      groupedMessages.push(currentGroup);
    } else {
      currentGroup.messages.push(message.text);
    }
  });

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <h2>JARVIS AI Assistant</h2>
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
      </div>
      <div className="chat-messages">
        {groupedMessages.map((group, groupIndex) => (
          <div 
            key={groupIndex} 
            className={`message-group ${group.sender}`}
          >
            {group.messages.map((text, messageIndex) => (
              <div 
                key={`${groupIndex}-${messageIndex}`} 
                className={`message ${group.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-content">
                  {group.sender === 'bot' && <div className="jarvis-accent"></div>}
                  {text}
                </div>
              </div>
            ))}
          </div>
        ))}
        {isLoading && (
          <div className="message-group bot">
            <div className="message bot-message">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="chat-input-form">
        <div className="chat-input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={apiKeyError ? "API key not configured" : "Message JARVIS..."}
            className="chat-input"
            disabled={isLoading || apiKeyError}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={isLoading || apiKeyError || !inputMessage.trim()}
            aria-label="Send message"
          />
        </div>
      </form>
    </div>
  );
};

export default Chatbot; 