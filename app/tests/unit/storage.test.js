import { describe, it, expect, beforeEach } from 'vitest';
import { bewaarSessie, laadSessie, wisSessie, nieuweSessie } from '../../js/storage.js';
import { defaultState } from '../../js/state.js';

beforeEach(() => {
  localStorage.clear();
});

describe('bewaarSessie', () => {
  it('schrijft naar localStorage', () => {
    const state = defaultState();
    bewaarSessie(state);
    expect(localStorage.getItem('stuurkracht.sessie.huidig')).not.toBeNull();
  });

  it('slaat uitdaging op', () => {
    const state = defaultState();
    state.uitdaging = 'Mijn testuitdaging';
    bewaarSessie(state);
    const geladen = JSON.parse(localStorage.getItem('stuurkracht.sessie.huidig'));
    expect(geladen.uitdaging).toBe('Mijn testuitdaging');
  });
});

describe('laadSessie', () => {
  it('retourneert default state als er niets is opgeslagen', () => {
    const state = laadSessie();
    const def = defaultState();
    expect(state.uitdaging).toBe(def.uitdaging);
    expect(state.gekozenRol).toBe(def.gekozenRol);
  });

  it('retourneert opgeslagen object na bewaarSessie', () => {
    const state = defaultState();
    state.uitdaging = 'Persistentie test';
    state.gekozenRol = 'bestuurder';
    bewaarSessie(state);

    const geladen = laadSessie();
    expect(geladen.uitdaging).toBe('Persistentie test');
    expect(geladen.gekozenRol).toBe('bestuurder');
  });

  it('retourneert default state bij corrupte JSON en logt waarschuwing', () => {
    localStorage.setItem('stuurkracht.sessie.huidig', 'GEEN_GELDIGE_JSON{{{');
    const warnings = [];
    const origWarn = console.warn;
    console.warn = (...args) => warnings.push(args.join(' '));

    const state = laadSessie();
    console.warn = origWarn;

    expect(state.uitdaging).toBe('');
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('vult ontbrekende velden aan met defaults (diep samenvoegen)', () => {
    localStorage.setItem('stuurkracht.sessie.huidig', JSON.stringify({ uitdaging: 'test' }));
    const state = laadSessie();
    expect(state.zelfreflectie).toBeDefined();
    expect(state.actie).toBeDefined();
    expect(state.reflectie).toBeDefined();
  });
});

describe('wisSessie', () => {
  it('verwijdert sessie uit localStorage', () => {
    const state = defaultState();
    bewaarSessie(state);
    wisSessie();
    expect(localStorage.getItem('stuurkracht.sessie.huidig')).toBeNull();
  });

  it('laadSessie retourneert default state na wisSessie', () => {
    const state = defaultState();
    state.uitdaging = 'Wis mij';
    bewaarSessie(state);
    wisSessie();
    const geladen = laadSessie();
    expect(geladen.uitdaging).toBe('');
  });
});

describe('nieuweSessie', () => {
  it('retourneert een schone default state', () => {
    const state = nieuweSessie();
    expect(state.uitdaging).toBe('');
    expect(state.gekozenRol).toBeNull();
  });

  it('wist localStorage', () => {
    const state = defaultState();
    state.uitdaging = 'Weg ermee';
    bewaarSessie(state);
    nieuweSessie();
    expect(localStorage.getItem('stuurkracht.sessie.huidig')).toBeNull();
  });

  it('genereert een nieuw sessieId', () => {
    const s1 = nieuweSessie();
    const s2 = nieuweSessie();
    expect(s1.sessieId).not.toBe(s2.sessieId);
  });
});
