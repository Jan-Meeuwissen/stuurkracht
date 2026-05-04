import { test, expect } from '@playwright/test';

const ACTIE_STATE = {
  sessieId: 'test', startDatum: '2026-01-01', laatsteWijziging: '',
  huidigeStap: '4b', uitdaging: '', gekozenRol: 'bestuurder',
  zelfreflectie: { bestuurder: { sterk: [], ontwikkelen: [] }, denker: { sterk: [], ontwikkelen: [] }, ondernemer: { sterk: [], ontwikkelen: [] }, uitzoeker: { sterk: [], ontwikkelen: [] }, verbinder: { sterk: [], ontwikkelen: [] } },
  actie: { kaartId: 'best-01', kaartTekst: 'Maak een plan', doelen: {}, concreet: {}, omgeving: {} },
  reflectie: {}
};

test.beforeEach(async ({ page }) => {
  // Only set initial state if no saved state exists — lets autosave survive reloads
  await page.addInitScript((state) => {
    if (!localStorage.getItem('stuurkracht.sessie.huidig')) {
      localStorage.setItem('stuurkracht.sessie.huidig', JSON.stringify(state));
    }
  }, ACTIE_STATE);
  await page.goto('/#/stap/4b');
  await page.waitForLoadState('networkidle');
});

test('drie hulpkaart-secties worden gerenderd', async ({ page }) => {
  await expect(page.locator('.hulpkaart-sectie')).toHaveCount(3);
});

test('sectie 1 heeft 4 textareas', async ({ page }) => {
  const sectie = page.locator('.hulpkaart-sectie').nth(0);
  await expect(sectie.locator('textarea')).toHaveCount(4);
});

test('sectie 2 heeft 6 textareas', async ({ page }) => {
  const sectie = page.locator('.hulpkaart-sectie').nth(1);
  await expect(sectie.locator('textarea')).toHaveCount(6);
});

test('sectie 3 heeft 6 textareas', async ({ page }) => {
  const sectie = page.locator('.hulpkaart-sectie').nth(2);
  await expect(sectie.locator('textarea')).toHaveCount(6);
});

test('totaal 16 textareas', async ({ page }) => {
  await expect(page.locator('#hulpkaarten-formulier textarea')).toHaveCount(16);
});

test('invoer wordt opgeslagen na 500 ms', async ({ page }) => {
  const eersteTextarea = page.locator('#hulpkaarten-formulier textarea').first();
  await eersteTextarea.fill('Testinvoer doelen');
  await page.waitForTimeout(600);

  const opgeslagen = await page.evaluate(() => {
    const raw = localStorage.getItem('stuurkracht.sessie.huidig');
    return raw ? JSON.parse(raw) : null;
  });
  expect(opgeslagen?.actie?.doelen?.waarom).toBe('Testinvoer doelen');
});

test('reload behoudt alle ingevulde antwoorden', async ({ page }) => {
  await page.locator('#hulpkaarten-formulier textarea').first().fill('Bewaar dit');
  await page.waitForTimeout(600);
  await page.reload();
  await page.waitForLoadState('networkidle');
  const waarde = await page.locator('#hulpkaarten-formulier textarea').first().inputValue();
  expect(waarde).toBe('Bewaar dit');
});

test('referentie-blok toont de gekozen actietekst', async ({ page }) => {
  await expect(page.locator('#stap4b-referentie')).toContainText('Maak een plan', { timeout: 5000 });
});

test('alle textareas hebben labels', async ({ page }) => {
  const textareas = page.locator('#hulpkaarten-formulier textarea');
  const count = await textareas.count();
  for (let i = 0; i < count; i++) {
    const id = await textareas.nth(i).getAttribute('id');
    if (id) {
      const label = page.locator(`label[for="${id}"]`);
      await expect(label, `label voor ${id}`).toBeAttached();
    }
  }
});
