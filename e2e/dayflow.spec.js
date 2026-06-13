import { expect, test } from '@playwright/test';

test.describe('dayflow e2e-through-UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#dashboard-heading')).toBeVisible();
  });

  test('plain-text quick-add creates a daily task (AC-01)', async ({ page }) => {
    const input = page.getByLabel('Quick add task');
    await input.fill('Buy milk');
    await input.press('Enter');

    await expect(page.getByLabel('Mark Buy milk complete')).toBeVisible();
    await expect(input).toBeFocused();
  });

  test('reads and writes tasks while offline without reload (AC-13)', async ({ page, context }) => {
    const input = page.getByLabel('Quick add task');
    await input.fill('Offline task');
    await input.press('Enter');
    await expect(page.getByLabel('Mark Offline task complete')).toBeVisible();

    await context.setOffline(true);
    await expect(page.locator('#dashboard-heading')).toBeVisible();
    await expect(page.getByLabel('Mark Offline task complete')).toBeVisible();

    await input.fill('Offline add');
    await input.press('Enter');
    await expect(page.getByLabel('Mark Offline add complete')).toBeVisible();

    await context.setOffline(false);
  });

  test('navigates to long-term section (AC-18)', async ({ page }) => {
    await page.getByLabel('Quick add task').fill('!Launch side project');
    await page.getByLabel('Quick add task').press('Enter');

    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Long-term' }).click();
    await expect(page.getByRole('heading', { name: 'Long-term' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Launch side project' })).toBeVisible();
    await expect(page.getByText('0 of 0 steps')).toBeVisible();
  });
});
