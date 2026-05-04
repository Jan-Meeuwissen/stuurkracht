import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/stap/1');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');
});

test('tekstveld accepteert input en bewaart na 500 ms', async ({ page }) => {
  const textarea = page.locator('#uitdaging-textarea');
  await textarea.fill('Mijn testuitdaging');
  await page.waitForTimeout(600);
  const opgeslagen = await page.evaluate(() => {
    const raw = localStorage.getItem('stuurkracht.sessie.huidig');
    return raw ? JSON.parse(raw).uitdaging : null;
  });
  expect(opgeslagen).toBe('Mijn testuitdaging');
});

test('klik op voorbeeldchip voegt tekst toe aan textarea', async ({ page }) => {
  await expect(page.locator('.chip').first()).toBeVisible({ timeout: 5000 });
  const eersteChip = page.locator('.chip').first();
  const chipTekst = (await eersteChip.textContent())!.trim();
  await eersteChip.click();
  const waarde = await page.locator('#uitdaging-textarea').inputValue();
  expect(waarde).toContain(chipTekst);
});

test('meerdere chips stapelen op nieuwe regels', async ({ page }) => {
  const chips = page.locator('.chip');
  await chips.nth(0).click();
  await chips.nth(1).click();
  const waarde = await page.locator('#uitdaging-textarea').inputValue();
  expect(waarde).toContain('\n');
});

test('reload behoudt eerder ingevulde uitdaging', async ({ page }) => {
  await page.locator('#uitdaging-textarea').fill('Persistentie test');
  await page.waitForTimeout(600);
  await page.reload();
  await page.waitForLoadState('networkidle');
  const waarde = await page.locator('#uitdaging-textarea').inputValue();
  expect(waarde).toBe('Persistentie test');
});

test('Volgende knop is ingeschakeld ook bij lege uitdaging', async ({ page }) => {
  await expect(page.getByRole('button', { name: /Volgende/i })).toBeEnabled();
});

test('chips worden gerenderd vanuit data', async ({ page }) => {
  await expect(page.locator('.chip').first()).toBeVisible();
  const aantalChips = await page.locator('.chip').count();
  expect(aantalChips).toBeGreaterThan(0);
});
