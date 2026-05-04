import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const SESSIE_STATE = {
  sessieId: 'a11y-test', startDatum: '2026-01-01', laatsteWijziging: '',
  huidigeStap: '1', uitdaging: '', gekozenRol: 'bestuurder',
  zelfreflectie: { bestuurder: { sterk: [], ontwikkelen: [] }, denker: { sterk: [], ontwikkelen: [] }, ondernemer: { sterk: [], ontwikkelen: [] }, uitzoeker: { sterk: [], ontwikkelen: [] }, verbinder: { sterk: [], ontwikkelen: [] } },
  actie: { kaartId: 'best-1', kaartTekst: 'Testactie', doelen: {}, concreet: {}, omgeving: {} },
  reflectie: {}
};

const schermen = [
  { naam: 'startscherm', hash: '/' },
  { naam: 'stap 1', hash: '/#/stap/1' },
  { naam: 'stap 2', hash: '/#/stap/2' },
  { naam: 'stap 3', hash: '/#/stap/3' },
  { naam: 'stap 4a', hash: '/#/stap/4a' },
  { naam: 'stap 5', hash: '/#/stap/5' },
  { naam: 'overzicht', hash: '/#/overzicht' },
];

for (const scherm of schermen) {
  test(`geen WCAG-AA critical/serious violations op ${scherm.naam}`, async ({ page }) => {
    await page.addInitScript((state) => {
      localStorage.setItem('stuurkracht.sessie.huidig', JSON.stringify(state));
    }, SESSIE_STATE);
    await page.goto(scherm.hash);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const kritisch = results.violations.filter(v =>
      v.impact === 'critical' || v.impact === 'serious'
    );

    const berichten = kritisch.map(v =>
      `${v.impact}: ${v.id} — ${v.description} (${v.nodes.length} nodes)`
    ).join('\n');
    expect(kritisch, `WCAG violations op ${scherm.naam}:\n${berichten}`).toHaveLength(0);
  });
}

test('volledige flow doorloopbaar met alleen toetsenbord', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const startKnop = page.getByRole('button', { name: /Start sessie/i });
  await startKnop.focus();
  await startKnop.press('Enter');
  await expect(page).toHaveURL(/#\/stap\/1/);

  await page.keyboard.press('Tab');
  await page.getByRole('button', { name: /Volgende/i }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/stap\/2/);
});

test('responsive: geen overflow op 1920x1080', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/#/stap/2');
  await page.waitForLoadState('networkidle');

  const overflow = await page.evaluate(() => {
    return document.body.scrollWidth > window.innerWidth;
  });
  expect(overflow).toBe(false);
});

test('responsive: geen overflow op 768x1024', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/#/stap/1');
  await page.waitForLoadState('networkidle');

  const overflow = await page.evaluate(() => {
    return document.body.scrollWidth > window.innerWidth;
  });
  expect(overflow).toBe(false);
});

test('focus-ring zichtbaar op Volgende-knop', async ({ page }) => {
  await page.goto('/#/stap/1');
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: /Volgende/i }).focus();
  const hasOutline = await page.evaluate(() => {
    const knop = document.querySelector('#knop-volgende') as HTMLElement;
    if (!knop) return false;
    const style = getComputedStyle(knop);
    return style.outlineWidth !== '0px' && style.outlineStyle !== 'none';
  });
  expect(hasOutline).toBe(true);
});
