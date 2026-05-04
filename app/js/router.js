const GELDIGE_STAPPEN = ['start', '1', '2', '3', '4a', '4b', '5', 'overzicht'];

let huidigeStap = 'start';
const luisteraars = [];

export function initialiseerRouter(onStapWijziging) {
  luisteraars.push(onStapWijziging);

  window.addEventListener('hashchange', () => {
    const stap = stapUitHash();
    navigeerNaar(stap, false);
  });

  const beginStap = stapUitHash();
  navigeerNaar(beginStap, false);
}

export function navigeerNaar(stap, updateHash = true) {
  if (!GELDIGE_STAPPEN.includes(stap)) stap = 'start';
  huidigeStap = stap;

  if (updateHash) {
    const nieuwHash = stap === 'start' ? '#/start'
      : stap === 'overzicht' ? '#/overzicht'
      : `#/stap/${stap}`;
    if (location.hash !== nieuwHash) {
      history.pushState(null, '', nieuwHash);
    }
  }

  luisteraars.forEach(fn => fn(stap));
}

export function geefHuidigeStap() {
  return huidigeStap;
}

function stapUitHash() {
  const hash = location.hash;
  if (!hash || hash === '#/' || hash === '#/start') return 'start';
  const match = hash.match(/^#\/stap\/(.+)$/);
  if (match && GELDIGE_STAPPEN.includes(match[1])) return match[1];
  if (hash === '#/overzicht') return 'overzicht';
  return 'start';
}
