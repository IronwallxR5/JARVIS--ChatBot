/**
 * useStickyScroll Hook
 * Professional auto-scroll that respects user intent during streaming
 * 
 * Performance characteristics:
 * - Passive scroll listeners (no layout thrashing)
 * - RAF-batched scroll operations
 * - Compatible with streaming updates
 * - Zero re-renders from scroll position tracking
 */

import { useRef, useCallback, useEffect } from 'react';

// Distance from bottom to consider "at bottom" (px)
const SCROLL_THRESHOLD = 50;

// Debounce time for scroll position checks (ms)
const SCROLL_DEBOUNCE = 100;

/**
 * Hook for streaming-aware auto-scroll behavior
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.isStreaming - Whether content is actively streaming
 * @param {string} options.streamingContent - Current streaming content (triggers scroll)
 * @returns {Object} - Container ref and scroll controls
 */
export const useStickyScroll = ({ isStreaming = false, streamingContent = '' } = {}) => {
  // Refs for scroll state (mutable, no re-renders)
  const containerRef = useRef(null);
  const isUserScrolledUpRef = useRef(false);
  const lastScrollTopRef = useRef(0);
  const scrollTimeoutRef = useRef(null);
  const rafIdRef = useRef(null);
  const lastContentLengthRef = useRef(0);

  /**
   * Check if container is scrolled to bottom
   * Uses cached values to avoid forced reflow
   */
  const isAtBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight <= SCROLL_THRESHOLD;
  }, []);

  /**
   * Scroll to bottom with RAF batching
   * Prevents layout thrashing during rapid streaming updates
   */
  const scrollToBottom = useCallback((instant = false) => {
    // Cancel any pending scroll
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;

      // Only scroll if user hasn't manually scrolled up
      if (!isUserScrolledUpRef.current) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: instant ? 'instant' : 'smooth',
        });
      }
      rafIdRef.current = null;
    });
  }, []);

  /**
   * Handle scroll events with debouncing
   * Determines if user has intentionally scrolled away from bottom
   */
  const handleScroll = useCallback((e) => {
    const container = e.target;
    const currentScrollTop = container.scrollTop;
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Debounce the scroll position check
    scrollTimeoutRef.current = setTimeout(() => {
      const scrollingUp = currentScrollTop < lastScrollTopRef.current;
      const atBottom = isAtBottom();

      if (scrollingUp && !atBottom) {
        // User scrolled up - disable auto-scroll
        isUserScrolledUpRef.current = true;
      } else if (atBottom) {
        // User returned to bottom - re-enable auto-scroll
        isUserScrolledUpRef.current = false;
      }

      lastScrollTopRef.current = currentScrollTop;
    }, SCROLL_DEBOUNCE);
  }, [isAtBottom]);

  /**
   * Attach passive scroll listener
   * Passive listeners allow smooth scrolling without blocking
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use passive listener to prevent scroll blocking
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [handleScroll]);

  /**
   * Auto-scroll during streaming when content grows
   * Only triggers when content actually changes (not on every render)
   */
  useEffect(() => {
    if (!isStreaming) {
      // Reset when streaming ends
      lastContentLengthRef.current = 0;
      return;
    }

    const contentLength = streamingContent?.length || 0;
    
    // Only scroll if content actually grew
    if (contentLength > lastContentLengthRef.current) {
      lastContentLengthRef.current = contentLength;
      
      // Use instant scroll during streaming to prevent jumpy behavior
      if (!isUserScrolledUpRef.current) {
        scrollToBottom(true);
      }
    }
  }, [isStreaming, streamingContent, scrollToBottom]);

  /**
   * Force scroll to bottom and reset user scroll state
   * Use when adding new messages or resuming auto-scroll
   */
  const forceScrollToBottom = useCallback(() => {
    isUserScrolledUpRef.current = false;
    scrollToBottom(false);
  }, [scrollToBottom]);

  /**
   * Check if auto-scroll is currently active
   */
  const isAutoScrollActive = useCallback(() => {
    return !isUserScrolledUpRef.current;
  }, []);

  return {
    containerRef,
    scrollToBottom,
    forceScrollToBottom,
    isAutoScrollActive,
    isAtBottom,
  };
};

export default useStickyScroll;
