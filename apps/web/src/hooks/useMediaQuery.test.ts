import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let listeners: Map<string, ((e: MediaQueryListEvent) => void)[]>;

  beforeEach(() => {
    listeners = new Map();

    matchMediaMock = vi.fn((query: string) => {
      const mediaQueryList = {
        matches: query === '(min-width: 1024px)',
        media: query,
        onchange: null,
        addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
          if (!listeners.has(query)) {
            listeners.set(query, []);
          }
          listeners.get(query)!.push(handler);
        }),
        removeEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
          const queryListeners = listeners.get(query);
          if (queryListeners) {
            const index = queryListeners.indexOf(handler);
            if (index > -1) {
              queryListeners.splice(index, 1);
            }
          }
        }),
        dispatchEvent: vi.fn(),
      };
      return mediaQueryList;
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    listeners.clear();
  });

  it('should return true when media query matches', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(true);
  });

  it('should return false when media query does not match', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('should call matchMedia with the query', () => {
    renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(matchMediaMock).toHaveBeenCalledWith('(min-width: 1024px)');
  });

  it('should add event listener on mount', () => {
    renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(listeners.get('(min-width: 1024px)')?.length).toBeGreaterThan(0);
  });

  it('should remove event listener on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    const initialListenerCount = listeners.get('(min-width: 1024px)')?.length || 0;

    unmount();

    // After unmount, listener should be removed
    const finalListenerCount = listeners.get('(min-width: 1024px)')?.length || 0;
    expect(finalListenerCount).toBeLessThan(initialListenerCount);
  });

  it('should update when media query changes', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));

    // Initial state
    expect(result.current).toBe(true);

    // Simulate media query change
    act(() => {
      const queryListeners = listeners.get('(min-width: 1024px)');
      if (queryListeners) {
        queryListeners.forEach((listener) => {
          listener({ matches: false } as MediaQueryListEvent);
        });
      }
    });

    expect(result.current).toBe(false);
  });

  it('should update query when query prop changes', () => {
    const { result, rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      { initialProps: { query: '(min-width: 1024px)' } }
    );

    expect(result.current).toBe(true);

    rerender({ query: '(min-width: 768px)' });

    expect(matchMediaMock).toHaveBeenCalledWith('(min-width: 768px)');
  });
});
