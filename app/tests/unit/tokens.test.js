import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('css/tokens.css', () => {
  const css = readFileSync(resolve(process.cwd(), 'css/tokens.css'), 'utf-8');

  const vereistTokens = [
    '--kleur-primair',
    '--kleur-secundair',
    '--kleur-accent',
    '--kleur-achtergrond',
    '--kleur-tekst',
    '--rol-bestuurder',
    '--rol-denker',
    '--rol-ondernemer',
    '--rol-uitzoeker',
    '--rol-verbinder',
    '--font-basis',
    '--radius-kaart',
  ];

  vereistTokens.forEach(token => {
    it(`bevat token ${token}`, () => {
      expect(css).toContain(token);
    });
  });

  it('bevat juiste waarde voor --kleur-primair', () => {
    expect(css).toContain('#1E3A5F');
  });

  it('bevat juiste waarde voor --kleur-accent', () => {
    expect(css).toContain('#E8B85F');
  });

  it('bevat alle 12 vereiste tokens', () => {
    const aanwezig = vereistTokens.filter(t => css.includes(t));
    expect(aanwezig).toHaveLength(12);
  });
});
