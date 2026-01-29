/**
 * Application Entry Point
 * Bootstraps the React application with StrictMode for development warnings
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Get root element
const container = document.getElementById('root');

// Ensure container exists
if (!container) {
  throw new Error('Root element not found. Make sure there is a <div id="root"></div> in your HTML.');
}

// Create root and render
const root = createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
