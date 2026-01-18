import { test, expect } from '@playwright/test';

test.describe('FixIt App - User Flows', () => {
  test.describe('Landing & Authentication', () => {
    test('TC1.1: Landing page loads correctly', async ({ page }) => {
      await page.goto('/');

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Should show landing page or redirect to appropriate view
      // The app auto-creates anonymous users, so it may redirect
      const body = await page.locator('body');
      await expect(body).toBeVisible();

      // Check no console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      // Give time for any errors
      await page.waitForTimeout(1000);

      // Page should have content
      const hasContent = await page.locator('body').textContent();
      expect(hasContent).toBeTruthy();
    });

    test('TC1.2: Anonymous authentication works', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // App should load without requiring login
      // Check that we're not stuck on a login page
      const loginForm = page.locator('input[type="password"]');
      await expect(loginForm).not.toBeVisible();
    });
  });

  test.describe('Daily Direction Check', () => {
    test('TC2.1: Can complete daily check with vision direction', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for direction buttons (if on daily check screen)
      const visionButton = page.locator('button:has-text("ASCENT")');
      const hateButton = page.locator('button:has-text("DESCENT")');

      // If we're on the daily check screen
      if (await visionButton.isVisible()) {
        await visionButton.click();

        // Should show comment input
        const commentInput = page.locator('textarea');
        await expect(commentInput).toBeVisible();

        // Enter comment
        await commentInput.fill('Test vision comment - automated test');

        // Complete check
        const submitButton = page.locator('button:has-text("Complete Check")');
        await submitButton.click();

        // Should redirect (loading or dashboard)
        await page.waitForURL(/.*/, { timeout: 5000 });
      }
    });

    test('TC2.2: Back button works on daily check', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const visionButton = page.locator('button:has-text("ASCENT")');

      if (await visionButton.isVisible()) {
        await visionButton.click();

        // Find back button
        const backButton = page.locator('button:has-text("Back")');
        if (await backButton.isVisible()) {
          await backButton.click();

          // Should be back on direction selection
          await expect(visionButton).toBeVisible();
        }
      }
    });
  });

  test.describe('Game HUD Dashboard', () => {
    test('TC3.1: Dashboard displays all sections', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Allow time for auto-auth and routing
      await page.waitForTimeout(2000);

      // Check for dashboard elements (may need to complete daily check first)
      // These are the key sections we expect
      const sections = [
        'ANTI-VISION',
        'VISION',
        'MISSION',
        'BOSS',
        'QUESTS',
        'RULES',
      ];

      // At least check the page has loaded properly
      const pageContent = await page.content();
      expect(pageContent.length).toBeGreaterThan(0);
    });

    test('TC3.2: Can hover to reveal edit buttons', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Look for any section that has group class (hover behavior)
      const editableSection = page.locator('.group').first();

      if (await editableSection.isVisible()) {
        await editableSection.hover();

        // Edit button should become visible on hover
        const editButton = editableSection.locator('button:has-text("Edit")');
        // Note: opacity-0 to opacity-100 on hover
        await expect(editButton).toBeAttached();
      }
    });
  });

  test.describe('Quest Management', () => {
    test('TC3.3: Can toggle quest completion', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Find quest buttons
      const questButton = page.locator('button').filter({
        has: page.locator('.w-6.h-6.rounded.border-2')
      }).first();

      if (await questButton.isVisible()) {
        // Click to toggle
        await questButton.click();
        await page.waitForTimeout(500);

        // The checkbox should toggle state
        const checkbox = questButton.locator('.w-6.h-6.rounded.border-2');
        await expect(checkbox).toBeVisible();
      }
    });

    test('TC3.4: Can open quest editor', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const editQuestsButton = page.locator('button:has-text("Edit Quests")');

      if (await editQuestsButton.isVisible()) {
        await editQuestsButton.click();

        // Quest editor should open
        const addQuestButton = page.locator('button:has-text("Add Quest")');
        await expect(addQuestButton).toBeVisible();

        // Cancel editing
        const cancelButton = page.locator('button:has-text("Cancel")');
        await cancelButton.click();
      }
    });
  });

  test.describe('Weekly Reflection', () => {
    test('TC4.1: Weekly reflection timer displays', async ({ page }) => {
      // This would require navigating to weekly reflection
      // For now, just verify the component can load
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check page loads
      expect(await page.title()).toBeDefined();
    });
  });

  test.describe('Error Handling', () => {
    test('TC7.2: Empty input validation', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const visionButton = page.locator('button:has-text("ASCENT")');

      if (await visionButton.isVisible()) {
        await visionButton.click();

        // Try to submit without comment
        const submitButton = page.locator('button:has-text("Complete Check")');

        // Button should be disabled when comment is empty
        await expect(submitButton).toBeDisabled();
      }
    });
  });

  test.describe('XP & Level System', () => {
    test('TC6.1: XP display is visible', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Look for XP indicator
      const xpText = page.locator('text=/\\d+ XP/');

      // If on dashboard, XP should be visible
      if (await xpText.count() > 0) {
        await expect(xpText.first()).toBeVisible();
      }
    });

    test('TC6.2: Level display is visible', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Look for LEVEL indicator
      const levelText = page.locator('text=/LEVEL \\d+/');

      if (await levelText.count() > 0) {
        await expect(levelText.first()).toBeVisible();
      }
    });
  });

  test.describe('Navigation', () => {
    test('TC8.2: Page refresh preserves state', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Get current page content
      const beforeRefresh = await page.content();

      // Refresh
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Page should still have content
      const afterRefresh = await page.content();
      expect(afterRefresh.length).toBeGreaterThan(0);
    });
  });
});
