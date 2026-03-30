import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts, SHORTCUT_KEYS } from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should add event listener on mount', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'k', meta: true, handler }],
      })
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );
  });

  it('should remove event listener on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'k', meta: true, handler }],
      })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );
  });

  it('should call handler when shortcut is pressed', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'k', meta: true, handler }],
      })
    );

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    });
    document.dispatchEvent(event);

    expect(handler).toHaveBeenCalled();
  });

  it('should call handler with ctrl key', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'k', ctrl: true, handler }],
      })
    );

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    });
    document.dispatchEvent(event);

    expect(handler).toHaveBeenCalled();
  });

  it('should not call handler when modifier is missing', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'k', meta: true, handler }],
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'k' });
    document.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should not call handler when disabled', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'k', meta: true, handler }],
        enabled: false,
      })
    );

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
    });
    document.dispatchEvent(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle escape key without modifiers', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: 'Escape', handler }],
      })
    );

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    expect(handler).toHaveBeenCalled();
  });
});

describe('SHORTCUT_KEYS', () => {
  it('should have newChat shortcut', () => {
    expect(SHORTCUT_KEYS.newChat).toEqual({ key: 'n', meta: true });
  });

  it('should have search shortcut', () => {
    expect(SHORTCUT_KEYS.search).toEqual({ key: 'k', meta: true });
  });

  it('should have toggleSidebar shortcut', () => {
    expect(SHORTCUT_KEYS.toggleSidebar).toEqual({ key: 'b', meta: true });
  });

  it('should have settings shortcut', () => {
    expect(SHORTCUT_KEYS.settings).toEqual({ key: ',', meta: true });
  });

  it('should have help shortcut', () => {
    expect(SHORTCUT_KEYS.help).toEqual({ key: '/', meta: true });
  });

  it('should have escape shortcut', () => {
    expect(SHORTCUT_KEYS.escape).toEqual({ key: 'Escape' });
  });
});
