import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
});

test('welkomstscherm toont bij eerste bezoek', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /STUURkracht/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Start sessie/i })).toBeVisible();
});

test('Start sessie navigeert naar stap 1', async ({ page }) => {
  await page.getByRole('button', { name: /Start sessie/i }).click();
  await expect(page).toHaveURL(/#\/stap\/1/);
  await expect(page.getByRole('heading', { name: /Stap 1/i })).toBeVisible();
});

test('voortgangsbalk-knop springt naar stap 3', async ({ page }) => {
  await page.getByRole('button', { name: /Start sessie/i }).click();
  await page.getByRole('button', { name: /Stap 3/i }).click();
  await expect(page).toHaveURL(/#\/stap\/3/);
  await expect(page.getByRole('heading', { name: /Stap 3/i })).toBeVisible();
});

test('Volgende knop navigeert van stap 1 naar stap 2', async ({ page }) => {
  await page.goto('/#/stap/1');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Volgende/i }).click();
  await expect(page).toHaveURL(/#\/stap\/2/);
});

test('Vorige knop navigeert terug', async ({ page }) => {
  await page.goto('/#/stap/2');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Vorige/i }).click();
  await expect(page).toHaveURL(/#\/stap\/1/);
});

test('begeleiderspaneel toggle verbergt het paneel', async ({ page }) => {
  await page.goto('/#/stap/1');
  await page.waitForLoadState('networkidle');

  const paneel = page.locator('#begeleider-paneel');
  await expect(paneel).toHaveAttribute('aria-hidden', 'false');

  await page.getByRole('button', { name: /Paneel verbergen/i }).click();
  await expect(paneel).toHaveAttribute('aria-hidden', 'true');
});

test('presentatiemodus toggle verbergt voortgangsbalk', async ({ page }) => {
  await page.goto('/#/stap/1');
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: /Presentatiemodus/i }).click();
  await expect(page.locator('body')).toHaveClass(/presentatiemodus/);
  await expect(page.locator('#voortgangsbalk')).not.toBeVisible();
});

test('onderbalk is verborgen op startscherm', async ({ page }) => {
  await expect(page.locator('#onderbalk')).toBeHidden();
});

test('onderbalk is zichtbaar na stap 1', async ({ page }) => {
  await page.getByRole('button', { name: /Start sessie/i }).click();
  await expect(page.locator('#onderbalk')).toBeVisible();
});
