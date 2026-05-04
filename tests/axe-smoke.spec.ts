import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('playwright + axe-core smoke test', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);

  const results = await new AxeBuilder({ page }).analyze();
  console.log(`Violations found: ${results.violations.length}`);
  console.log(`Passes: ${results.passes.length}`);

  // Just verify axe ran and returned results — not asserting zero violations
  expect(results.violations).toBeDefined();
  expect(results.passes.length).toBeGreaterThan(0);
});
