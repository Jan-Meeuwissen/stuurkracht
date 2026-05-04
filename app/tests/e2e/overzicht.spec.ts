import { test, expect } from '@playwright/test';

const VOLLEDIGE_SESSIE = {
  sessieId: 'test-overzicht', startDatum: '2026-01-01', laatsteWijziging: '',
  huidigeStap: 'overzicht',
  uitdaging: 'Samenwerken in een nieuwe groep',
  gekozenRol: 'verbinder',
  zelfreflectie: {
    bestuurder: { sterk: ['plannen'], ontwikkelen: [] },
    denker: { sterk: [], ontwikkelen: ['terugkijken'] },
    ondernemer: { sterk: [], ontwikkelen: [] },
    uitzoeker: { sterk: [], ontwikkelen: [] },
    verbinder: { sterk: ['luisteren', 'helpen'], ontwikkelen: [] },
  },
  actie: {
    kaartId: 'verb-01',
    kaartTekst: 'Testactie verbinder',
    doelen: { waarom: 'Om beter samen te werken', 'kenmerk-rol': 'luisteren', opbrengst: 'Betere samenwerking', tevreden: 'Als iedereen gehoord is' },
    concreet: { wat: 'Luistergesprek voeren', wie: 'Groepsleden', waar: 'Klaslokaal', wanneer: 'Vrijdag', hoe: 'Voorbereiding vragen', 'eerste-stap': 'Afspraak maken' },
    omgeving: { gebruiken: 'Rustige ruimte', 'in-de-weg': 'Tijdgebrek', 'omgang-obstakel': 'Korte agenda', helpers: 'Docent', blokkers: 'Niemand', 'omgang-blokkers': 'nvt' },
  },
  reflectie: { gelukt: 'Grotendeels', verklaring: 'Goede voorbereiding', 'geleerd-actie': 'Luisteren kost tijd', 'geleerd-zelf': 'Ik kan goed faciliteren', vervolgstap: 'Herhalen volgende week' },
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((state) => {
    localStorage.setItem('stuurkracht.sessie.huidig', JSON.stringify(state));
  }, VOLLEDIGE_SESSIE);
  await page.goto('/#/overzicht');
  await page.waitForLoadState('networkidle');
});

test('overzicht toont de uitdaging', async ({ page }) => {
  await expect(page.locator('#overzicht-uitdaging')).toContainText('Samenwerken');
});

test('overzicht toont de gekozen rol', async ({ page }) => {
  await expect(page.locator('#overzicht-rol')).toContainText('Verbinder');
});

test('overzicht toont de gekozen actie', async ({ page }) => {
  await expect(page.locator('#overzicht-actie')).toContainText('Breng een kop koffie');
});

test('overzicht toont doelen', async ({ page }) => {
  await expect(page.locator('#overzicht-doelen')).toContainText('Om beter samen te werken');
});

test('overzicht toont reflectie', async ({ page }) => {
  await expect(page.locator('#overzicht-reflectie-velden')).toContainText('Grotendeels');
});

test('overzicht toont zelfreflectie', async ({ page }) => {
  await expect(page.locator('#overzicht-zelfreflectie')).toContainText('luisteren');
});

test('PDF-download knop is aanwezig en klikbaar', async ({ page }) => {
  const knop = page.getByRole('button', { name: /Download als PDF/i });
  await expect(knop).toBeVisible();
  await expect(knop).toBeEnabled();
});

test('nieuwe sessie starten toont bevestigingsdialoog', async ({ page }) => {
  await page.getByRole('button', { name: /Nieuwe sessie/i }).click();
  await expect(page.locator('#bevestig-dialog')).toBeVisible();
});

test('annuleer sluit dialoog zonder reset', async ({ page }) => {
  await page.getByRole('button', { name: /Nieuwe sessie/i }).click();
  await page.getByRole('button', { name: /Annuleren/i }).click();
  await expect(page.locator('#bevestig-dialog')).not.toBeVisible();
  const raw = await page.evaluate(() => localStorage.getItem('stuurkracht.sessie.huidig'));
  expect(raw).not.toBeNull();
});

test('bevestig reset wist localStorage', async ({ page }) => {
  await page.getByRole('button', { name: /Nieuwe sessie/i }).click();
  await page.getByRole('button', { name: /Ja, wis alles/i }).click();
  await page.waitForURL(/#\/stap\/1/);
  const opgeslagen = await page.evaluate(() => {
    const raw = localStorage.getItem('stuurkracht.sessie.huidig');
    return raw ? JSON.parse(raw) : null;
  });
  expect(opgeslagen?.uitdaging ?? '').toBe('');
  expect(opgeslagen?.gekozenRol ?? null).toBeNull();
});

test('doorgaan met sessie navigeert weg van overzicht', async ({ page }) => {
  await page.getByRole('button', { name: /Doorgaan/i }).click();
  await expect(page).not.toHaveURL(/#\/overzicht/);
});
