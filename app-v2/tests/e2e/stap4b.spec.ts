import { test, expect } from '@playwright/test';

const KAART_TEKST = 'Maak een plan hoe te leren voor de volgende toets en vraag hier feedback op.';

const ACTIE_STATE = {
  sessieId: 'test', startDatum: '2026-01-01', laatsteWijziging: '',
  huidigeStap: '4b', uitdaging: '', gekozenRol: 'bestuurder',
  zelfreflectie: {
    bestuurder: { sterk: [], ontwikkelen: [] }, denker: { sterk: [], ontwikkelen: [] },
    ondernemer: { sterk: [], ontwikkelen: [] }, uitzoeker: { sterk: [], ontwikkelen: [] },
    verbinder: { sterk: [], ontwikkelen: [] },
  },
  actie: { kaartId: 'best-01', kaartTekst: KAART_TEKST, antwoorden: [] },
  reflectie: {},
};

const STATE_MET_KWALITEITEN = {
  ...ACTIE_STATE,
  zelfreflectie: {
    bestuurder: { sterk: ['doelen-stellen', 'plannen'], ontwikkelen: ['hulp-vragen'] },
    denker: { sterk: [], ontwikkelen: [] },
    ondernemer: { sterk: [], ontwikkelen: [] },
    uitzoeker: { sterk: [], ontwikkelen: [] },
    verbinder: { sterk: [], ontwikkelen: [] },
  },
};

const STATE_ALLEEN_STERK = {
  ...ACTIE_STATE,
  zelfreflectie: {
    bestuurder: { sterk: ['plannen'], ontwikkelen: [] },
    denker: { sterk: [], ontwikkelen: [] },
    ondernemer: { sterk: [], ontwikkelen: [] },
    uitzoeker: { sterk: [], ontwikkelen: [] },
    verbinder: { sterk: [], ontwikkelen: [] },
  },
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((state) => {
    if (!localStorage.getItem('stuurkracht.sessie.huidig')) {
      localStorage.setItem('stuurkracht.sessie.huidig', JSON.stringify(state));
    }
  }, ACTIE_STATE);
  await page.goto('/#/stap/4b');
  await page.waitForLoadState('networkidle');
});

// ── Initiële weergave ────────────────────────────────────────────────────────

test('bij binnenkomst is exact één invulvak zichtbaar', async ({ page }) => {
  await expect(page.locator('.invulvak')).toHaveCount(1);
});

test('het initiële invulvak heeft label "Wat ga je precies doen?"', async ({ page }) => {
  await expect(page.locator('.invulvak-label').first()).toContainText('Wat ga je precies doen?');
});

test('het initiële invulvak is voorgevuld met de actiekaarttekst', async ({ page }) => {
  const textarea = page.locator('.invulvak textarea').first();
  await expect(textarea).toHaveValue(KAART_TEKST);
});

test('drie hulpkaarten staan in de linkerkolom', async ({ page }) => {
  await expect(page.locator('.hulpkaart-kaart')).toHaveCount(3);
});

test('hulpkaarten hebben de juiste achtergrondkleuren', async ({ page }) => {
  const kleuren = await page.locator('.hulpkaart-kaart').evaluateAll(cards =>
    cards.map(c => getComputedStyle(c).backgroundColor)
  );
  // Alle drie moeten uniek zijn en niet de standaard wit/transparant
  expect(new Set(kleuren).size).toBe(3);
});

test('referentie-blok toont de gekozen actietekst', async ({ page }) => {
  await expect(page.locator('#stap4b-referentie')).toContainText(KAART_TEKST, { timeout: 5000 });
});

// ── Modal ────────────────────────────────────────────────────────────────────

test('klik op hulpkaart opent modal', async ({ page }) => {
  await page.locator('.hulpkaart-kaart').first().click();
  const modal = page.locator('#hulpkaart-modal');
  await expect(modal).toBeVisible();
  await expect(modal).toHaveAttribute('aria-modal', 'true');
});

test('modal toont beschikbare vragen als knoppen', async ({ page }) => {
  await page.locator('.hulpkaart-kaart').first().click();
  const knoppen = page.locator('#modal-vragen .modal-vraag-knop');
  await expect(knoppen.first()).toBeVisible();
  expect(await knoppen.count()).toBeGreaterThan(0);
});

test('klik op vraag in modal: modal sluit en nieuw invulvak verschijnt', async ({ page }) => {
  const aantalVoor = await page.locator('.invulvak').count();
  await page.locator('.hulpkaart-kaart').first().click();
  await page.locator('#modal-vragen .modal-vraag-knop').first().click();

  await expect(page.locator('#hulpkaart-modal')).not.toBeVisible();
  await expect(page.locator('.invulvak')).toHaveCount(aantalVoor + 1);
});

test('gekozen vraag verdwijnt uit dezelfde hulpkaart bij heropenen', async ({ page }) => {
  await page.locator('.hulpkaart-kaart').first().click();
  const aantalVoor = await page.locator('#modal-vragen .modal-vraag-knop').count();
  await page.locator('#modal-vragen .modal-vraag-knop').first().click();

  await page.locator('.hulpkaart-kaart').first().click();
  const aantalNa = await page.locator('#modal-vragen .modal-vraag-knop').count();
  expect(aantalNa).toBe(aantalVoor - 1);
});

test('modal sluit op Esc-toets', async ({ page }) => {
  await page.locator('.hulpkaart-kaart').first().click();
  await expect(page.locator('#hulpkaart-modal')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#hulpkaart-modal')).not.toBeVisible();
});

// ── Invulvak border-kleur ─────────────────────────────────────────────────────

test('eerste invulvak heeft border-kleur van hulpkaart concreet', async ({ page }) => {
  const borderKleur = await page.locator('.invulvak').first().evaluate(el => {
    return getComputedStyle(el).borderLeftColor;
  });
  // Concreet = #D9924C → rgb(217, 146, 76)
  expect(borderKleur).toBe('rgb(217, 146, 76)');
});

// ── Verwijderen ───────────────────────────────────────────────────────────────

test('klik op kruisje bij leeg vak verwijdert direct zonder dialoog', async ({ page }) => {
  // Voeg nieuw leeg vak toe
  await page.locator('.hulpkaart-kaart').first().click();
  await page.locator('#modal-vragen .modal-vraag-knop').first().click();
  const aantalVoor = await page.locator('.invulvak').count();

  // Verwijder het lege vak (het laatste)
  await page.locator('.invulvak-verwijder').last().click();
  await expect(page.locator('#verwijder-dialog')).not.toBeVisible();
  await expect(page.locator('.invulvak')).toHaveCount(aantalVoor - 1);
});

test('klik op kruisje bij ingevuld vak toont bevestigingsdialoog', async ({ page }) => {
  await page.locator('.invulvak textarea').first().fill('Ingevulde tekst');
  await page.locator('.invulvak-verwijder').first().click();
  await expect(page.locator('#verwijder-dialog')).toBeVisible();
});

test('bevestigde verwijdering haalt vak weg en herstelt vraag in hulpkaart', async ({ page }) => {
  // Voeg een vraag toe
  await page.locator('.hulpkaart-kaart').first().click();
  const eersteVraag = await page.locator('#modal-vragen .modal-vraag-knop').first().textContent();
  await page.locator('#modal-vragen .modal-vraag-knop').first().click();
  const aantalVoor = await page.locator('.invulvak').count();

  // Vul in en verwijder
  await page.locator('.invulvak').last().locator('textarea').fill('Tekst');
  await page.locator('.invulvak-verwijder').last().click();
  await page.locator('#verwijder-bevestig').click();

  await expect(page.locator('.invulvak')).toHaveCount(aantalVoor - 1);

  // Vraag terug in modal
  await page.locator('.hulpkaart-kaart').first().click();
  await expect(page.locator('#modal-vragen')).toContainText(eersteVraag!.trim());
});

// ── Uitgeput ──────────────────────────────────────────────────────────────────

test('hulpkaart met alle vragen toegevoegd krijgt data-uitgeput=true', async ({ page }) => {
  // Doelen heeft 4 vragen — voeg ze allemaal toe
  const doelenKaart = page.locator('.hulpkaart-kaart[data-hulpkaart="doelen"]');
  for (let i = 0; i < 4; i++) {
    await doelenKaart.click();
    await page.locator('#modal-vragen .modal-vraag-knop').first().click();
  }
  await expect(doelenKaart).toHaveAttribute('data-uitgeput', 'true');
});

// ── Persistentie ─────────────────────────────────────────────────────────────

test('invulvak-antwoord wordt opgeslagen na 500 ms', async ({ page }) => {
  await page.locator('.invulvak textarea').first().fill('Mijn actie');
  await page.waitForTimeout(600);

  const opgeslagen = await page.evaluate(() => {
    const raw = localStorage.getItem('stuurkracht.sessie.huidig');
    return raw ? JSON.parse(raw) : null;
  });
  expect(opgeslagen?.actie?.antwoorden?.[0]?.antwoord).toBe('Mijn actie');
});

test('reload behoudt alle invulvakken in juiste volgorde', async ({ page }) => {
  // Voeg twee extra vragen toe
  await page.locator('.hulpkaart-kaart').nth(0).click();
  await page.locator('#modal-vragen .modal-vraag-knop').first().click();
  await page.locator('.hulpkaart-kaart').nth(1).click();
  await page.locator('#modal-vragen .modal-vraag-knop').first().click();

  const aantalVoor = await page.locator('.invulvak').count();
  const labelVoor = await page.locator('.invulvak-label').first().textContent();

  await page.reload();
  await page.waitForLoadState('networkidle');

  await expect(page.locator('.invulvak')).toHaveCount(aantalVoor);
  await expect(page.locator('.invulvak-label').first()).toContainText(labelVoor!.trim());
});

// ── Labels ────────────────────────────────────────────────────────────────────

test('alle invulvak-textareas hebben bijbehorende labels', async ({ page }) => {
  const textareas = page.locator('.invulvak textarea');
  const count = await textareas.count();
  for (let i = 0; i < count; i++) {
    const id = await textareas.nth(i).getAttribute('id');
    if (id) {
      await expect(page.locator(`label[for="${id}"]`), `label voor ${id}`).toBeAttached();
    }
  }
});

// ── Rol-blok ──────────────────────────────────────────────────────────────────

test('rol-blok is zichtbaar bovenaan stap 4b', async ({ page }) => {
  await expect(page.locator('[data-testid="rol-blok"]')).toBeVisible();
});

test('rol-blok toont de rolnaam en het icoon van de gekozen rol', async ({ page }) => {
  const blok = page.locator('[data-testid="rol-blok"]');
  await expect(blok).toContainText('De Bestuurder');
  const icoon = blok.locator('img');
  await expect(icoon).toHaveAttribute('src', /icoon-bestuurder/);
});

test('rol-blok heeft achtergrondkleur die overeenkomt met de gekozen rol', async ({ page }) => {
  const bgColor = await page.locator('[data-testid="rol-blok"]').evaluate(el =>
    getComputedStyle(el).backgroundColor
  );
  // Bestuurder = #F4B5A8 → rgb(244, 181, 168)
  expect(bgColor).toBe('rgb(244, 181, 168)');
});

test('klik op rol-blok opent de kwaliteiten-modal', async ({ page }) => {
  await page.locator('[data-testid="rol-blok"]').click();
  const modal = page.locator('#kwaliteiten-modal');
  await expect(modal).toBeVisible();
  await expect(modal).toHaveAttribute('aria-modal', 'true');
});

test('Enter op rol-blok opent de kwaliteiten-modal', async ({ page }) => {
  await page.locator('[data-testid="rol-blok"]').press('Enter');
  await expect(page.locator('#kwaliteiten-modal')).toBeVisible();
});

test('modal toont "Sterk in" en "Wil ontwikkelen" bij gevulde zelfreflectie', async ({ page }) => {
  await page.evaluate((state) => {
    localStorage.setItem('stuurkracht.sessie.huidig', JSON.stringify(state));
  }, STATE_MET_KWALITEITEN);
  await page.reload();
  await page.waitForLoadState('networkidle');

  await page.locator('[data-testid="rol-blok"]').click();
  const modal = page.locator('#kwaliteiten-modal');
  await expect(modal).toContainText('Sterk in');
  await expect(modal).toContainText('Wil ontwikkelen');
  await expect(modal).toContainText('doelen stellen');
  await expect(modal).toContainText('plannen');
  await expect(modal).toContainText('hulp vragen');
});

test('modal verbergt "Wil ontwikkelen" als die sectie leeg is', async ({ page }) => {
  await page.evaluate((state) => {
    localStorage.setItem('stuurkracht.sessie.huidig', JSON.stringify(state));
  }, STATE_ALLEEN_STERK);
  await page.reload();
  await page.waitForLoadState('networkidle');

  await page.locator('[data-testid="rol-blok"]').click();
  const modal = page.locator('#kwaliteiten-modal');
  await expect(modal).toContainText('Sterk in');
  await expect(modal).not.toContainText('Wil ontwikkelen');
});

test('modal toont fallback-lijst bij volledig lege zelfreflectie', async ({ page }) => {
  await page.locator('[data-testid="rol-blok"]').click();
  const modal = page.locator('#kwaliteiten-modal');
  await expect(modal).toContainText('Kwaliteiten van deze rol');
  const items = modal.locator('.kwaliteiten-item');
  await expect(items).toHaveCount(6);
});

test('volgorde kwaliteiten in modal volgt rollen.json', async ({ page }) => {
  await page.evaluate((state) => {
    localStorage.setItem('stuurkracht.sessie.huidig', JSON.stringify(state));
  }, STATE_MET_KWALITEITEN);
  await page.reload();
  await page.waitForLoadState('networkidle');

  await page.locator('[data-testid="rol-blok"]').click();
  const sterkItems = page.locator('#kwaliteiten-modal .kwaliteiten-sectie').first().locator('.kwaliteiten-item');
  // Canonieke volgorde bestuurder: doelen-stellen vóór plannen
  const eersteNaam = await sterkItems.nth(0).textContent();
  const tweedeNaam = await sterkItems.nth(1).textContent();
  expect(eersteNaam).toContain('doelen stellen');
  expect(tweedeNaam).toContain('plannen');
});

test('kwaliteiten-modal sluit op kruisje', async ({ page }) => {
  await page.locator('[data-testid="rol-blok"]').click();
  await expect(page.locator('#kwaliteiten-modal')).toBeVisible();
  await page.locator('#kwaliteiten-modal .kwaliteiten-modal-sluiten').click();
  await expect(page.locator('#kwaliteiten-modal')).not.toBeVisible();
});

test('kwaliteiten-modal sluit op Esc', async ({ page }) => {
  await page.locator('[data-testid="rol-blok"]').click();
  await expect(page.locator('#kwaliteiten-modal')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#kwaliteiten-modal')).not.toBeVisible();
});

test('kwaliteiten-modal sluit op backdrop-klik', async ({ page }) => {
  await page.locator('[data-testid="rol-blok"]').click();
  const modal = page.locator('#kwaliteiten-modal');
  await expect(modal).toBeVisible();
  // Klik buiten de modal-inhoud (op de backdrop)
  await modal.evaluate(el => {
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
    el.dispatchEvent(ev);
  });
  await expect(modal).not.toBeVisible();
});
