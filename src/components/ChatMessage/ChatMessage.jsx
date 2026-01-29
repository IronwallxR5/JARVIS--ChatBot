/**
 * ChatMessage Component
 * Renders individual chat messages with Markdown support and code highlighting
 */

import React, { memo, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { SENDER, MESSAGE_STATUS } from '../../constants';
import { formatTimestamp, copyToClipboard } from '../../utils/helpers';
import './ChatMessage.css';

/**
 * Custom code block with syntax highlighting and copy button
 */
const CodeBlock = memo(({ language, children }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    const success = await copyToClipboard(String(children).replace(/\n$/, ''));
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Custom theme overrides for JARVIS aesthetic
  const customStyle = {
    ...oneDark,
    'pre[class*="language-"]': {
      ...oneDark['pre[class*="language-"]'],
      background: 'var(--code-bg, #0d1117)',
      borderRadius: 'var(--radius-md, 8px)',
      border: '1px solid var(--border-color, rgba(0, 212, 255, 0.2))',
      margin: '0.5rem 0',
      fontSize: '0.875rem',
    },
    'code[class*="language-"]': {
      ...oneDark['code[class*="language-"]'],
      background: 'transparent',
      fontFamily: 'var(--font-mono, "JetBrains Mono", "Fira Code", monospace)',
    },
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-language">{language || 'code'}</span>
        <button
          className={`code-copy-button ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={customStyle}
        customStyle={{
          margin: 0,
          padding: '1rem',
          maxHeight: '400px',
          overflow: 'auto',
        }}
        showLineNumbers={children.split('\n').length > 3}
        wrapLines
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

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
      {isBot ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
          {/* AI Brain/Circuit */}
          <circle cx="12" cy="12" r="9" stroke="currentColor" fill="none"/>
          {/* Central processor */}
          <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor"/>
          {/* Circuit nodes */}
          <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
          <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
          <circle cx="6" cy="18" r="1.5" fill="currentColor"/>
          <circle cx="18" cy="18" r="1.5" fill="currentColor"/>
          {/* Connecting lines */}
          <line x1="7.5" y1="6" x2="9" y2="9" stroke="currentColor" strokeWidth="1"/>
          <line x1="16.5" y1="6" x2="15" y2="9" stroke="currentColor" strokeWidth="1"/>
          <line x1="7.5" y1="18" x2="9" y2="15" stroke="currentColor" strokeWidth="1"/>
          <line x1="16.5" y1="18" x2="15" y2="15" stroke="currentColor" strokeWidth="1"/>
          {/* Eyes */}
          <circle cx="10.5" cy="11" r="0.8" fill="var(--jarvis-primary, #00d4ff)"/>
          <circle cx="13.5" cy="11" r="0.8" fill="var(--jarvis-primary, #00d4ff)"/>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';

/**
 * Markdown renderer components configuration
 */
const createMarkdownComponents = () => ({
  // Code blocks with syntax highlighting
  code: ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    
    if (!inline && (match || String(children).includes('\n'))) {
      return (
        <CodeBlock language={language}>
          {children}
        </CodeBlock>
      );
    }
    
    return (
      <code className="inline-code" {...props}>
        {children}
      </code>
    );
  },
  
  // Enhanced links
  a: ({ href, children }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="markdown-link"
    >
      {children}
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  ),
  
  // Tables with JARVIS styling
  table: ({ children }) => (
    <div className="table-wrapper">
      <table className="markdown-table">{children}</table>
    </div>
  ),
  
  // Blockquotes
  blockquote: ({ children }) => (
    <blockquote className="markdown-blockquote">{children}</blockquote>
  ),
  
  // Lists
  ul: ({ children }) => <ul className="markdown-list">{children}</ul>,
  ol: ({ children }) => <ol className="markdown-list ordered">{children}</ol>,
  
  // Paragraphs (prevent extra margin)
  p: ({ children }) => <p className="markdown-paragraph">{children}</p>,
});

/**
 * Message content with Markdown rendering
 */
const MessageContent = memo(({ text, isBot }) => {
  const [copied, setCopied] = useState(false);
  
  // Memoize markdown components to prevent recreation
  const markdownComponents = useMemo(() => createMarkdownComponents(), []);

  const handleCopyAll = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="message-content-wrapper">
      <div className="message-text">
        {isBot ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {text}
          </ReactMarkdown>
        ) : (
          // User messages as plain text
          <p className="markdown-paragraph">{text}</p>
        )}
      </div>
      <button
        className={`copy-button ${copied ? 'copied' : ''}`}
        onClick={handleCopyAll}
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
 * Streaming indicator with JARVIS animation
 */
const StreamingCursor = memo(() => (
  <span className="streaming-cursor" aria-hidden="true">
    <span className="cursor-dot"></span>
    <span className="cursor-dot"></span>
    <span className="cursor-dot"></span>
  </span>
));

StreamingCursor.displayName = 'StreamingCursor';

/**
 * Main ChatMessage component
 */
const ChatMessage = memo(({ message, showTimestamp = true, isStreaming = false }) => {
  const { text, sender, timestamp, status } = message;
  const isBot = sender === SENDER.BOT;
  const isError = status === MESSAGE_STATUS.ERROR;

  return (
    <div 
      className={`chat-message ${isBot ? 'bot' : 'user'} ${isError ? 'error' : ''} ${isStreaming ? 'streaming' : ''}`}
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
            {showTimestamp && timestamp && !isStreaming && (
              <time 
                className="message-timestamp"
                dateTime={new Date(timestamp).toISOString()}
              >
                {formatTimestamp(timestamp)}
              </time>
            )}
            {isStreaming && (
              <span className="streaming-badge">Streaming...</span>
            )}
          </div>
          
          <MessageContent text={text} isBot={isBot} />
          
          {isStreaming && <StreamingCursor />}
          
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
  isStreaming: PropTypes.bool,
};

export default ChatMessage;
