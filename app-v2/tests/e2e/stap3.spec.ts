import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/#/stap/3');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');
});

test('vijf reflectie-rolkaarten worden gerenderd', async ({ page }) => {
  await expect(page.locator('.reflectie-rolkaart')).toHaveCount(5);
});

test('klik op sterk-knop zet aria-pressed op true', async ({ page }) => {
  const sterkKnop = page.locator('.knop-sterk').first();
  await expect(sterkKnop).toHaveAttribute('aria-pressed', 'false');
  await sterkKnop.click();
  await expect(sterkKnop).toHaveAttribute('aria-pressed', 'true');
});

test('sterk-klik slaat kwaliteit op in state', async ({ page }) => {
  const sterkKnop = page.locator('.knop-sterk').first();
  const kwaliteitId = await sterkKnop.getAttribute('data-kwaliteit');
  const rolId = await sterkKnop.getAttribute('data-rol');
  await sterkKnop.click();
  await page.waitForTimeout(100);

  const opgeslagen = await page.evaluate(() => {
    const raw = localStorage.getItem('stuurkracht.sessie.huidig');
    return raw ? JSON.parse(raw) : null;
  });
  expect(opgeslagen?.zelfreflectie?.[rolId!]?.sterk).toContain(kwaliteitId);
});

test('ontwikkelen-klik verplaatst kwaliteit weg uit sterk', async ({ page }) => {
  const sterkKnop = page.locator('.knop-sterk').first();
  const ontwikkelenKnop = page.locator('.knop-ontwikkelen').first();
  const kwaliteitId = await sterkKnop.getAttribute('data-kwaliteit');
  const rolId = await sterkKnop.getAttribute('data-rol');

  await sterkKnop.click();
  await ontwikkelenKnop.click();
  await page.waitForTimeout(100);

  const opgeslagen = await page.evaluate(() => {
    const raw = localStorage.getItem('stuurkracht.sessie.huidig');
    return raw ? JSON.parse(raw) : null;
  });
  expect(opgeslagen?.zelfreflectie?.[rolId!]?.sterk).not.toContain(kwaliteitId);
  expect(opgeslagen?.zelfreflectie?.[rolId!]?.ontwikkelen).toContain(kwaliteitId);
});

test('rolkeuze-radio bewaart gekozenRol', async ({ page }) => {
  const radio = page.locator('input[name="gekozen-rol"]').first();
  const rolId = await radio.getAttribute('value');
  await radio.evaluate(el => {
    (el as HTMLInputElement).checked = true;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(100);

  const opgeslagen = await page.evaluate(() => {
    const raw = localStorage.getItem('stuurkracht.sessie.huidig');
    return raw ? JSON.parse(raw).gekozenRol : null;
  });
  expect(opgeslagen).toBe(rolId);
});

test('zonder rolkeuze toont waarschuwing bij Volgende', async ({ page }) => {
  const waarschuwing = page.locator('#rolkeuze-waarschuwing');
  await expect(waarschuwing).toBeHidden();
  await page.getByRole('button', { name: /Volgende/i }).click();
  await expect(waarschuwing).toBeVisible();
});

test('reload behoudt aanvinkingen', async ({ page }) => {
  const sterkKnop = page.locator('.knop-sterk').first();
  await sterkKnop.click();
  await page.waitForTimeout(100);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.knop-sterk').first()).toHaveAttribute('aria-pressed', 'true');
});
