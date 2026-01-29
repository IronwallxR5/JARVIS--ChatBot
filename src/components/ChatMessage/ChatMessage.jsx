/**
 * ChatMessage Component
 * Renders individual chat messages with proper styling and accessibility
 */

import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { SENDER, MESSAGE_STATUS } from '../../constants';
import { formatTimestamp, copyToClipboard } from '../../utils/helpers';
import './ChatMessage.css';

/**
 * Avatar component for message sender
 */
const Avatar = memo(({ sender }) => {
  const isBot = sender === SENDER.BOT;
  
  return (
    <div 
      className={`message-avatar ${isBot ? 'bot-avatar' : 'user-avatar'}`}
      aria-hidden="true"
    >
      {isBot ? 'J' : 'U'}
    </div>
  );
});

Avatar.displayName = 'Avatar';

/**
 * Message content with optional copy functionality
 */
const MessageContent = memo(({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="message-content-wrapper">
      <div 
        className="message-text"
        // Using dangerouslySetInnerHTML only for our controlled, sanitized content
        // In production, use a proper markdown renderer like react-markdown
      >
        {text}
      </div>
      <button
        className={`copy-button ${copied ? 'copied' : ''}`}
        onClick={handleCopy}
        aria-label={copied ? 'Copied!' : 'Copy message'}
        title={copied ? 'Copied!' : 'Copy to clipboard'}
      >
        {copied ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
});

MessageContent.displayName = 'MessageContent';

/**
 * Main ChatMessage component
 */
const ChatMessage = memo(({ message, showTimestamp = true }) => {
  const { text, sender, timestamp, status } = message;
  const isBot = sender === SENDER.BOT;
  const isError = status === MESSAGE_STATUS.ERROR;

  return (
    <div 
      className={`chat-message ${isBot ? 'bot' : 'user'} ${isError ? 'error' : ''}`}
      role="article"
      aria-label={`${isBot ? 'JARVIS' : 'You'} said`}
    >
      <div className="message-container">
        <Avatar sender={sender} />
        
        <div className="message-body">
          <div className="message-header">
            <span className="message-sender">
              {isBot ? 'JARVIS' : 'You'}
            </span>
            {showTimestamp && timestamp && (
              <time 
                className="message-timestamp"
                dateTime={new Date(timestamp).toISOString()}
              >
                {formatTimestamp(timestamp)}
              </time>
            )}
          </div>
          
          <MessageContent text={text} />
          
          {isError && (
            <div className="message-error-badge" role="alert">
              Failed to send
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

ChatMessage.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    sender: PropTypes.oneOf([SENDER.USER, SENDER.BOT, SENDER.SYSTEM]).isRequired,
    timestamp: PropTypes.number,
    status: PropTypes.oneOf(Object.values(MESSAGE_STATUS)),
  }).isRequired,
  showTimestamp: PropTypes.bool,
};

export default ChatMessage;
