import { laadAlleContent } from './data.js';
import { laadSessie, bewaarSessie, nieuweSessie } from './storage.js';
import { initialiseerRouter, navigeerNaar } from './router.js';
import { exporteerAlsPdf } from './pdf.js';
import { initialiseerStap1, herstelStap1 } from './steps/stap1.js';
import { initialiseerStap2 } from './steps/stap2.js';
import { initialiseerStap3, herstelStap3UI, toonRolkeuzeWaarschuwing } from './steps/stap3.js';
import { initialiseerStap4a, initialiseerStap4b, herstelStap4b } from './steps/stap4.js';
import { initialiseerStap5, herstelStap5 } from './steps/stap5.js';

const STAPVOLGORDE = ['start', '1', '2', '3', '4a', '4b', '5', 'overzicht'];

let state;
let content;

async function init() {
  [content, state] = await Promise.all([laadAlleContent(), Promise.resolve(laadSessie())]);

  initialiseerStap1(state, content);
  initialiseerStap2(content);
  initialiseerStap3(state, content);
  initialiseerNavigatie();
  initialiseerPaneel();
  initialiseerOverzicht();
  vulBegeleidersPaneel(content.begeleider);

  initialiseerRouter(onStapWijziging);
}

function onStapWijziging(stap) {
  document.querySelectorAll('.stap-sectie').forEach(s => s.classList.remove('actief'));

  const actief = document.getElementById(`sectie-${stap}`);
  if (actief) actief.classList.add('actief');

  state.huidigeStap = stap;
  bewaarSessie(state);

  updateVoortgangsbalk(stap);
  updateNavKnoppen(stap);
  updateBegeleidersPaneel(stap);

  if (stap === '4a') initialiseerStap4a(state, content);
  if (stap === '4b') {
    initialiseerStap4b(state, content);
    herstelStap4b(state, content);
  }
  if (stap === '5') {
    initialiseerStap5(state, content);
    herstelStap5(state);
  }
  if (stap === 'overzicht') vulOverzicht(state, content);
  if (stap === '3') herstelStap3UI(state);
  if (stap === '1') herstelStap1(state);
}

function initialiseerNavigatie() {
  document.getElementById('knop-start')?.addEventListener('click', () => navigeerNaar('1'));
  document.getElementById('knop-volgende')?.addEventListener('click', volgende);
  document.getElementById('knop-vorige')?.addEventListener('click', vorige);
  document.getElementById('knop-vervolgactie')?.addEventListener('click', () => navigeerNaar('4a'));
}

function volgende() {
  const huidig = state.huidigeStap;
  if (huidig === '3' && !state.gekozenRol) {
    toonRolkeuzeWaarschuwing();
    return;
  }
  const idx = STAPVOLGORDE.indexOf(huidig);
  if (idx < STAPVOLGORDE.length - 1) navigeerNaar(STAPVOLGORDE[idx + 1]);
}

function vorige() {
  const huidig = state.huidigeStap;
  const idx = STAPVOLGORDE.indexOf(huidig);
  if (idx > 0) navigeerNaar(STAPVOLGORDE[idx - 1]);
}

function updateVoortgangsbalk(stap) {
  const stapNummers = ['1', '2', '3', '4a', '4b', '5'];
  document.querySelectorAll('.stap-punt').forEach(punt => {
    const stapId = punt.dataset.stap;
    punt.setAttribute('aria-current', stap === stapId ? 'step' : 'false');

    const idx = stapNummers.indexOf(stapId);
    const huidigIdx = stapNummers.indexOf(stap);
    if (idx < huidigIdx) punt.classList.add('bezocht');
    else punt.classList.remove('bezocht');
  });
}

function updateNavKnoppen(stap) {
  const idx = STAPVOLGORDE.indexOf(stap);
  const vorigeKnop = document.getElementById('knop-vorige');
  const volgendeKnop = document.getElementById('knop-volgende');
  const onderbalk = document.getElementById('onderbalk');

  const isStart = stap === 'start';
  if (onderbalk) onderbalk.hidden = isStart;
  if (vorigeKnop) vorigeKnop.disabled = idx <= 1;
  if (volgendeKnop) volgendeKnop.disabled = stap === 'overzicht';
  if (volgendeKnop) volgendeKnop.textContent = stap === '5' ? 'Sessie afronden' : 'Volgende';
}

function initialiseerPaneel() {
  const paneel = document.getElementById('begeleider-paneel');
  const sluitKnop = document.getElementById('paneel-sluiten');
  const tonenKnop = document.getElementById('paneel-tonen');
  const toggleKnop = document.getElementById('toggle-presentatie');

  sluitKnop?.addEventListener('click', () => {
    paneel?.setAttribute('aria-hidden', 'true');
    document.body.classList.add('paneel-verborgen');
  });

  tonenKnop?.addEventListener('click', () => {
    paneel?.setAttribute('aria-hidden', 'false');
    document.body.classList.remove('paneel-verborgen');
  });

  toggleKnop?.addEventListener('click', () => {
    const isPresentatie = document.body.classList.toggle('presentatiemodus');
    toggleKnop.textContent = isPresentatie ? 'Begeleidingsmodus' : 'Presentatiemodus';
    toggleKnop.setAttribute('aria-pressed', String(isPresentatie));
  });
}

function vulBegeleidersPaneel(begeleider) {
  window._begeleiderData = begeleider.begeleider;
}

function updateBegeleidersPaneel(stap) {
  const inhoud = document.getElementById('paneel-inhoud');
  if (!inhoud) return;

  const data = window._begeleiderData;
  if (!data) return;

  const stapSleutel = stap === 'start' ? 'start'
    : stap === 'overzicht' ? 'overzicht'
    : stap === '4a' ? 'stap4a'
    : stap === '4b' ? 'stap4b'
    : `stap${stap}`;

  const stapData = data[stapSleutel];
  if (!stapData) { inhoud.innerHTML = ''; return; }

  inhoud.innerHTML = `
    ${stapData.doel ? `<p class="paneel-doel">${stapData.doel}</p>` : ''}
    ${stapData.instructies?.length ? `
      <div class="paneel-sectie">
        <h3>Instructies</h3>
        <ul class="paneel-instructies">
          ${stapData.instructies.map(i => `<li>${i}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
    ${stapData.tips?.length ? `
      <div class="paneel-sectie">
        <h3>Tips</h3>
        <ul class="paneel-instructies paneel-tips">
          ${stapData.tips.map(t => `<li>${t}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
  `;
}

function initialiseerOverzicht() {
  document.getElementById('knop-pdf')?.addEventListener('click', () => {
    exporteerAlsPdf(state, content);
  });

  document.getElementById('knop-nieuwe-sessie')?.addEventListener('click', () => {
    document.getElementById('bevestig-dialog')?.showModal();
  });

  document.getElementById('knop-bevestig-reset')?.addEventListener('click', () => {
    state = nieuweSessie();
    document.getElementById('bevestig-dialog')?.close();
    initialiseerStap1(state, content);
    initialiseerStap2(content);
    initialiseerStap3(state, content);
    navigeerNaar('1');
  });

  document.getElementById('knop-annuleer-reset')?.addEventListener('click', () => {
    document.getElementById('bevestig-dialog')?.close();
  });

  document.getElementById('knop-doorgaan')?.addEventListener('click', () => {
    navigeerNaar(state.huidigeStap === 'overzicht' ? '5' : state.huidigeStap);
  });

  document.querySelectorAll('.stap-punt').forEach(punt => {
    punt.addEventListener('click', () => navigeerNaar(punt.dataset.stap));
  });
}

function vulOverzicht(state, content) {
  const { rollen } = content.rollen;
  const { actiekaarten } = content.actiekaarten;
  const rol = rollen.find(r => r.id === state.gekozenRol);
  const actie = actiekaarten.find(k => k.id === state.actie?.kaartId);

  const zet = (id, waarde) => {
    const el = document.getElementById(id);
    if (el) el.textContent = waarde || '—';
  };

  zet('overzicht-uitdaging', state.uitdaging);
  zet('overzicht-rol', rol?.naam ?? '');
  zet('overzicht-actie', actie?.tekst ?? '');

  const zelfreflectieEl = document.getElementById('overzicht-zelfreflectie');
  if (zelfreflectieEl) {
    zelfreflectieEl.innerHTML = rollen.map(r => {
      const data = state.zelfreflectie?.[r.id];
      const sterk = data?.sterk?.join(', ') || '—';
      const ontwikkelen = data?.ontwikkelen?.join(', ') || '—';
      return `
        <div class="overzicht-veld">
          <div class="overzicht-label">${r.naam}</div>
          <div class="overzicht-waarde">
            ✓ Sterk in: ${sterk}<br>
            ↑ Wil ontwikkelen: ${ontwikkelen}
          </div>
        </div>
      `;
    }).join('');
  }

  const hulpVelden = [
    { groep: 'doelen', labels: { 'waarom': 'Waarom?', 'kenmerk-rol': 'Kenmerk rol', 'opbrengst': 'Opbrengst', 'tevreden': 'Wanneer tevreden?' } },
    { groep: 'concreet', labels: { 'wat': 'Wat?', 'wie': 'Wie?', 'waar': 'Waar?', 'wanneer': 'Wanneer?', 'hoe': 'Hoe?', 'eerste-stap': 'Eerste stap' } },
    { groep: 'omgeving', labels: { 'gebruiken': 'Gebruiken', 'in-de-weg': 'In de weg', 'omgang-obstakel': 'Omgang obstakel', 'helpers': 'Helpers', 'blokkers': 'Blokkers', 'omgang-blokkers': 'Omgang blokkers' } },
  ];

  hulpVelden.forEach(({ groep, labels }) => {
    const container = document.getElementById(`overzicht-${groep}`);
    if (!container) return;
    container.innerHTML = Object.entries(state.actie?.[groep] ?? {}).map(([id, waarde]) => `
      <div class="overzicht-veld">
        <div class="overzicht-label">${labels[id] ?? id}</div>
        <div class="overzicht-waarde">${waarde || '—'}</div>
      </div>
    `).join('');
  });

  const reflectieLabels = { 'gelukt': 'Gelukt?', 'verklaring': 'Verklaring', 'geleerd-actie': 'Geleerd van actie', 'geleerd-zelf': 'Geleerd over jezelf', 'vervolgstap': 'Vervolgstap' };
  const reflectieEl = document.getElementById('overzicht-reflectie-velden');
  if (reflectieEl) {
    reflectieEl.innerHTML = Object.entries(state.reflectie ?? {}).map(([id, waarde]) => `
      <div class="overzicht-veld">
        <div class="overzicht-label">${reflectieLabels[id] ?? id}</div>
        <div class="overzicht-waarde">${waarde || '—'}</div>
      </div>
    `).join('');
  }
}

init().catch(console.error);
