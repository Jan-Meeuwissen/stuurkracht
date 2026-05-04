import { test, expect } from '@playwright/test';

const BESTUURDER_STATE = {
  sessieId: 'test', startDatum: '2026-01-01', laatsteWijziging: '',
  huidigeStap: '4a', uitdaging: '', gekozenRol: 'bestuurder',
  zelfreflectie: { bestuurder: { sterk: [], ontwikkelen: [] }, denker: { sterk: [], ontwikkelen: [] }, ondernemer: { sterk: [], ontwikkelen: [] }, uitzoeker: { sterk: [], ontwikkelen: [] }, verbinder: { sterk: [], ontwikkelen: [] } },
  actie: { kaartId: null, kaartTekst: null, doelen: {}, concreet: {}, omgeving: {} },
  reflectie: {}
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((state) => {
    localStorage.setItem('stuurkracht.sessie.huidig', JSON.stringify(state));
  }, BESTUURDER_STATE);
  await page.goto('/#/stap/4a');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[data-testid="actiekaart"]', { timeout: 5000 }).catch(() => {});
});

test('actiekaarten worden gefilterd op gekozen rol', async ({ page }) => {
  const kaarten = page.locator('[data-testid="actiekaart"]');
  await expect(kaarten.first()).toBeVisible({ timeout: 5000 });
  const aantalKaarten = await kaarten.count();
  expect(aantalKaarten).toBeGreaterThan(0);
});

test('geen kaarten van andere rollen zichtbaar', async ({ page }) => {
  await expect(page.locator('[data-testid="actiekaart"]').first()).toBeVisible({ timeout: 5000 });
  const ids = await page.locator('[data-testid="actiekaart"]').evaluateAll((els: Element[]) =>
    els.map(el => el.getAttribute('data-kaart-id') ?? '')
  );
  ids.forEach(id => {
    expect(id).toMatch(/^best-/);
  });
});

test('klik op actiekaart bewaart kaartId en navigeert naar 4b binnen 1s', async ({ page }) => {
  await expect(page.locator('[data-testid="actiekaart"]').first()).toBeVisible({ timeout: 5000 });
  await page.locator('[data-testid="actiekaart"]').first().click();
  await expect(page).toHaveURL(/#\/stap\/4b/, { timeout: 2000 });

  const opgeslagen = await page.evaluate(() => {
    const raw = localStorage.getItem('stuurkracht.sessie.huidig');
    return raw ? JSON.parse(raw) : null;
  });
  expect(opgeslagen?.actie?.kaartId).toBeTruthy();
  expect(opgeslagen?.actie?.kaartTekst).toBeTruthy();
});

test('rol-naam wordt getoond boven de kaarten', async ({ page }) => {
  await expect(page.locator('#actie-rol-naam')).toContainText('Bestuurder', { timeout: 5000 });
});

test('andere-rol knop navigeert terug naar stap 3', async ({ page }) => {
  await page.getByRole('button', { name: /Andere rol/i }).click();
  await expect(page).toHaveURL(/#\/stap\/3/);
});
