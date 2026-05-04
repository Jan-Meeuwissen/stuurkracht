import { defaultState } from './state.js';

const SLEUTEL = 'stuurkracht.sessie.huidig';

export function bewaarSessie(state) {
  const opslaan = { ...state, laatsteWijziging: new Date().toISOString() };
  localStorage.setItem(SLEUTEL, JSON.stringify(opslaan));
}

export function laadSessie() {
  const raw = localStorage.getItem(SLEUTEL);
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw);
    return diepSamenvoegen(defaultState(), parsed);
  } catch (e) {
    console.warn('Stuurkracht: sessiedata kon niet worden geladen, standaard geladen.', e);
    return defaultState();
  }
}

export function wisSessie() {
  localStorage.removeItem(SLEUTEL);
}

export function nieuweSessie() {
  wisSessie();
  return defaultState();
}

function diepSamenvoegen(basis, overschrijving) {
  if (typeof basis !== 'object' || basis === null) return overschrijving ?? basis;
  const resultaat = { ...basis };
  for (const sleutel of Object.keys(overschrijving ?? {})) {
    if (typeof basis[sleutel] === 'object' && basis[sleutel] !== null &&
        typeof overschrijving[sleutel] === 'object' && overschrijving[sleutel] !== null &&
        !Array.isArray(basis[sleutel])) {
      resultaat[sleutel] = diepSamenvoegen(basis[sleutel], overschrijving[sleutel]);
    } else {
      resultaat[sleutel] = overschrijving[sleutel];
    }
  }
  return resultaat;
}
