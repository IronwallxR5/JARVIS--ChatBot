/**
 * useAutoResize Hook
 * Auto-resize textarea based on content
 */

import { useEffect, useCallback } from 'react';

/**
 * Custom hook for auto-resizing textarea
 * @param {React.RefObject} textareaRef - Reference to textarea element
 * @param {string} value - Current textarea value
 * @param {number} maxHeight - Maximum height in pixels
 */
export const useAutoResize = (textareaRef, value, maxHeight = 200) => {
  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to calculate new scrollHeight
    textarea.style.height = 'auto';
    
    // Set new height (capped at maxHeight)
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
    
    // Add scrollbar if content exceeds maxHeight
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [textareaRef, maxHeight]);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return resize;
};

export default useAutoResize;
