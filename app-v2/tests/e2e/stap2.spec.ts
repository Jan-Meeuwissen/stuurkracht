import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/stap/2');
  await page.waitForLoadState('networkidle');
});

test('vijf rolkaarten worden gerenderd', async ({ page }) => {
  await expect(page.locator('[data-testid="rolkaart"]')).toHaveCount(5);
});

test('klik op kaart toggelt data-flipped naar true', async ({ page }) => {
  const kaart = page.locator('[data-testid="rolkaart"]').first();
  await expect(kaart).not.toHaveAttribute('data-flipped', 'true');
  await kaart.click();
  await expect(kaart).toHaveAttribute('data-flipped', 'true');
});

test('tweede klik draait kaart terug', async ({ page }) => {
  const kaart = page.locator('[data-testid="rolkaart"]').first();
  await kaart.click();
  await expect(kaart).toHaveAttribute('data-flipped', 'true');
  await kaart.click();
  await expect(kaart).toHaveAttribute('data-flipped', 'false');
});

test('na flip zijn de kwaliteiten leesbaar', async ({ page }) => {
  const kaart = page.locator('[data-testid="rolkaart"]').first();
  await kaart.click();
  const kwaliteiten = kaart.locator('.kwaliteit-item');
  await expect(kwaliteiten).toHaveCount(6);
});

test('toetsenbord Enter flipt de kaart', async ({ page }) => {
  const kaart = page.locator('[data-testid="rolkaart"]').first();
  await kaart.focus();
  await kaart.press('Enter');
  await expect(kaart).toHaveAttribute('data-flipped', 'true');
});

test('alle vijf kaarten hebben een rolnaam', async ({ page }) => {
  const namen = await page.locator('.rolnaam').allTextContents();
  expect(namen).toHaveLength(5);
  namen.forEach(naam => expect(naam.trim().length).toBeGreaterThan(0));
});

test('aria-pressed wordt bijgewerkt bij flip', async ({ page }) => {
  const kaart = page.locator('[data-testid="rolkaart"]').first();
  await expect(kaart).toHaveAttribute('aria-pressed', 'false');
  await kaart.click();
  await expect(kaart).toHaveAttribute('aria-pressed', 'true');
});
