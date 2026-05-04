import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { execSync } from 'child_process';

test('index.html laadt zonder console-errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  expect(errors).toHaveLength(0);
});

test('index.html heeft correcte taal en charset', async ({ page }) => {
  await page.goto('/');
  const lang = await page.getAttribute('html', 'lang');
  expect(lang).toBe('nl');
  const charset = await page.getAttribute('meta[charset]', 'charset');
  expect(charset?.toLowerCase()).toBe('utf-8');
});

test('index.html valideert als geldige HTML (html-validate)', () => {
  const result = execSync(
    'node_modules/.bin/html-validate --config .html-validate.json index.html 2>&1 || true',
    { encoding: 'utf-8' }
  );
  const errors = (result.match(/✖ (\d+) problems/)?.[1] ?? '0');
  expect(parseInt(errors, 10)).toBe(0);
});

test('alle CSS-tokens zijn aanwezig', async ({ page }) => {
  await page.goto('/');
  const tokens = [
    '--kleur-primair', '--kleur-secundair', '--kleur-accent',
    '--kleur-achtergrond', '--kleur-tekst',
    '--rol-bestuurder', '--rol-denker', '--rol-ondernemer',
    '--rol-uitzoeker', '--rol-verbinder',
    '--font-basis', '--radius-kaart',
  ];
  for (const token of tokens) {
    const waarde = await page.evaluate(
      (t) => getComputedStyle(document.documentElement).getPropertyValue(t).trim(),
      token
    );
    expect(waarde, `token ${token}`).not.toBe('');
  }
});
