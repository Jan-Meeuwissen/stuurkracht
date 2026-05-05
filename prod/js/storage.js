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
    const samengevoegd = diepSamenvoegen(defaultState(), parsed);
    if (samengevoegd.actie) samengevoegd.actie = migreerActieSchema(samengevoegd.actie);
    return samengevoegd;
  } catch (e) {
    console.warn('Stuurkracht: sessiedata kon niet worden geladen, standaard geladen.', e);
    return defaultState();
  }
}

function migreerActieSchema(actie) {
  const oudSchema = actie.doelen !== undefined || actie.concreet !== undefined || actie.omgeving !== undefined;
  if (!oudSchema) return actie;

  console.info('Sessie gemigreerd naar nieuw stap 4b-schema');

  const VRAGEN = {
    doelen: [
      { id: 'waarom',      tekst: 'Waarom ga je deze actie doen?' },
      { id: 'kenmerk-rol', tekst: 'Aan welk kenmerk van de gekozen rol ga je werken?' },
      { id: 'opbrengst',   tekst: 'Wat denk je dat de actie gaat opleveren?' },
      { id: 'tevreden',    tekst: 'Wanneer ben je tevreden?' },
    ],
    concreet: [
      { id: 'wat',         tekst: 'Wat ga je precies doen?' },
      { id: 'wie',         tekst: 'Wie ga je betrekken bij het uitvoeren van je actie?' },
      { id: 'waar',        tekst: 'Waar ga je deze actie uitvoeren?' },
      { id: 'wanneer',     tekst: 'Wanneer ga je deze actie uitvoeren?' },
      { id: 'hoe',         tekst: 'Hoe ga je deze actie voorbereiden?' },
      { id: 'eerste-stap', tekst: 'Wat is de eerste stap die je wilt gaan zetten?' },
    ],
    omgeving: [
      { id: 'gebruiken',       tekst: 'Wat kun je in jouw omgeving gebruiken om de actie tot een succes te maken?' },
      { id: 'in-de-weg',       tekst: 'Wat zou jouw actie in de weg kunnen staan?' },
      { id: 'omgang-obstakel', tekst: 'Hoe ga je hiermee om?' },
      { id: 'helpers',         tekst: 'Wie kunnen je misschien helpen bij het uitvoeren van de actie?' },
      { id: 'blokkers',        tekst: 'Wie zou jouw actie in de weg kunnen staan?' },
      { id: 'omgang-blokkers', tekst: 'Hoe ga je hiermee om?' },
    ],
  };

  const antwoorden = [];
  let volgorde = 0;

  for (const [hulpkaart, vragen] of Object.entries(VRAGEN)) {
    for (const vraag of vragen) {
      const waarde = actie[hulpkaart]?.[vraag.id] ?? '';
      if (waarde) {
        antwoorden.push({
          id: `vak-migratie-${hulpkaart}-${vraag.id}`,
          hulpkaart,
          vraagId: vraag.id,
          vraag: vraag.tekst,
          antwoord: waarde,
          volgorde: volgorde++,
        });
      }
    }
  }

  return { kaartId: actie.kaartId, kaartTekst: actie.kaartTekst, antwoorden };
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
