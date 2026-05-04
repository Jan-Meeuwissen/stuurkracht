import { test, expect } from '@playwright/test';

const SESSIE_STATE = {
  sessieId: 'test', startDatum: '2026-01-01', laatsteWijziging: '',
  huidigeStap: '5', uitdaging: 'Uitdaging test', gekozenRol: 'denker',
  zelfreflectie: { bestuurder: { sterk: [], ontwikkelen: [] }, denker: { sterk: [], ontwikkelen: [] }, ondernemer: { sterk: [], ontwikkelen: [] }, uitzoeker: { sterk: [], ontwikkelen: [] }, verbinder: { sterk: [], ontwikkelen: [] } },
  actie: { kaartId: 'denk-01', kaartTekst: 'Testactie tekst', doelen: { waarom: 'Testdoel' }, concreet: {}, omgeving: {} },
  reflectie: { gelukt: '', verklaring: '', 'geleerd-actie': '', 'geleerd-zelf': '', vervolgstap: '' }
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((state) => {
    localStorage.setItem('stuurkracht.sessie.huidig', JSON.stringify(state));
  }, SESSIE_STATE);
  await page.goto('/#/stap/5');
  await page.waitForLoadState('networkidle');
});

test('vijf reflectievragen worden gerenderd', async ({ page }) => {
  await expect(page.locator('#reflectie-formulier textarea')).toHaveCount(5);
});

test('referentie-blok toont de gekozen actie', async ({ page }) => {
  await expect(page.locator('#stap5-referentie')).toContainText('Zoek een effectieve werkvorm');
});

test('reflectie wordt gepersisteerd na invoer', async ({ page }) => {
  const eersteTextarea = page.locator('#reflectie-formulier textarea').first();
  await eersteTextarea.fill('Het is goed gelukt!');
  await page.waitForTimeout(600);

  const opgeslagen = await page.evaluate(() => {
    const raw = localStorage.getItem('stuurkracht.sessie.huidig');
    return raw ? JSON.parse(raw) : null;
  });
  expect(opgeslagen?.reflectie?.gelukt).toBe('Het is goed gelukt!');
});

test('Sessie afronden navigeert naar overzicht', async ({ page }) => {
  await page.getByRole('button', { name: /Sessie afronden|Volgende/i }).first().click();
  await expect(page).toHaveURL(/#\/overzicht/);
});

test('Vervolgactie kiezen navigeert terug naar stap 4', async ({ page }) => {
  await page.getByRole('button', { name: /Vervolgactie/i }).click();
  await expect(page).toHaveURL(/#\/stap\/4a/);
});
