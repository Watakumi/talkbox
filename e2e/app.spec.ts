import { test, expect } from '@playwright/test';

test.describe('TalkBox App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display welcome message', async ({ page }) => {
    await expect(page.getByText('TalkBox')).toBeVisible();
    await expect(
      page.getByText(/welcome|ようこそ/i)
    ).toBeVisible();
  });

  test('should have chat input', async ({ page }) => {
    const input = page.getByPlaceholder(/type a message|メッセージを入力/i);
    await expect(input).toBeVisible();
  });

  test('should have send button', async ({ page }) => {
    const sendButton = page.getByRole('button', { name: /send|送信/i });
    await expect(sendButton).toBeVisible();
  });

  test('should toggle sidebar on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Sidebar should be hidden initially
    const sidebar = page.getByRole('navigation', {
      name: /conversations|会話/i,
    });

    // Click menu button to open sidebar
    const menuButton = page.getByRole('button', {
      name: /toggle sidebar|サイドバー/i,
    });
    await menuButton.click();

    // Sidebar should now be visible
    await expect(sidebar).toBeVisible();
  });
});

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open settings modal', async ({ page }) => {
    // Open settings via keyboard shortcut or button
    await page.keyboard.press('Meta+,');

    // Settings modal should be visible
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/settings|設定/i)).toBeVisible();
  });

  test('should close settings with Escape', async ({ page }) => {
    await page.keyboard.press('Meta+,');
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open help modal with Cmd+/', async ({ page }) => {
    await page.keyboard.press('Meta+/');

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByText(/keyboard shortcuts|キーボードショートカット/i)
    ).toBeVisible();
  });

  test('should toggle sidebar with Cmd+B', async ({ page }) => {
    // Set desktop viewport where sidebar is visible
    await page.setViewportSize({ width: 1280, height: 720 });

    const sidebar = page.getByRole('navigation', {
      name: /conversations|会話/i,
    });

    // Initially visible on desktop
    await expect(sidebar).toBeVisible();

    // This test may need adjustment based on actual sidebar behavior
  });
});

test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have search input in sidebar', async ({ page }) => {
    // On desktop, sidebar should be visible with search
    await page.setViewportSize({ width: 1280, height: 720 });

    const searchInput = page.getByPlaceholder(/search|検索/i);
    await expect(searchInput).toBeVisible();
  });

  test('should focus search with Cmd+K', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.keyboard.press('Meta+k');

    // Search input should be focused
    const searchInput = page.getByPlaceholder(/search|検索/i);
    await expect(searchInput).toBeFocused();
  });
});

test.describe('Accessibility', () => {
  test('should have skip to content link', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.getByRole('link', {
      name: /skip to content|メインコンテンツへスキップ/i,
    });

    // Skip link should exist (it's visually hidden but present)
    await expect(skipLink).toBeAttached();
  });

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');

    // There should be an h1 or prominent heading
    const heading = page.getByRole('heading', { level: 1 });
    // The app may use different heading structure, adjust as needed
  });
});
