import { bewaarSessie } from '../storage.js';
import { navigeerNaar } from '../router.js';

let debounceTimers = {};
let stap4bGeinitialiseerd = false;

const KLEUREN = {
  doelen:   'var(--hulpkaart-doelen)',
  concreet: 'var(--hulpkaart-concreet)',
  omgeving: 'var(--hulpkaart-omgeving)',
};

// ── Stap 4a ──────────────────────────────────────────────────────────────────

export function initialiseerStap4a(state, content) {
  const grid = document.getElementById('actiekaarten-grid');
  const rolNaamEl = document.getElementById('actie-rol-naam');
  const andereRolKnop = document.getElementById('andere-rol-knop');

  if (!grid) return;

  const { rollen } = content.rollen;
  const { actiekaarten } = content.actiekaarten;
  const rol = rollen.find(r => r.id === state.gekozenRol);

  if (rolNaamEl) rolNaamEl.textContent = rol ? rol.naam : '';

  const gefilterd = actiekaarten.filter(k => k.rol === state.gekozenRol);

  grid.innerHTML = gefilterd.map(kaart => `
    <button class="actiekaart"
      type="button"
      data-kaart-id="${kaart.id}"
      data-testid="actiekaart"
      style="background-color: ${rol?.kleur ?? '#eee'}"
      aria-pressed="${state.actie?.kaartId === kaart.id ? 'true' : 'false'}">
      <img class="roer-icoon" src="assets/icons/icoon-roer.svg" alt="" aria-hidden="true">
      <div>${kaart.tekst}</div>
    </button>
  `).join('');

  grid.addEventListener('click', e => {
    const kaart = e.target.closest('.actiekaart');
    if (!kaart) return;

    grid.querySelectorAll('.actiekaart').forEach(k => k.setAttribute('aria-pressed', 'false'));
    kaart.setAttribute('aria-pressed', 'true');

    state.actie.kaartId = kaart.dataset.kaartId;
    state.actie.kaartTekst = kaart.querySelector('div').textContent;
    bewaarSessie(state);

    setTimeout(() => navigeerNaar('4b'), 300);
  });

  if (andereRolKnop) {
    andereRolKnop.addEventListener('click', () => navigeerNaar('3'));
  }
}

// ── Stap 4b ───────────────────────────────────────────────────────────────────

export function initialiseerStap4b(state, content) {
  if (stap4bGeinitialiseerd) return;
  stap4bGeinitialiseerd = true;

  const modal = document.getElementById('hulpkaart-modal');
  const sidebar = document.getElementById('hulpkaarten-sidebar');
  const container = document.getElementById('invulvakken-container');
  const verwijderDialog = document.getElementById('verwijder-dialog');

  if (!sidebar || !container || !modal) return;

  const { hulpkaarten } = content.hulpkaarten;

  // Sidebar: gedelegeerde click + keyboard
  sidebar.addEventListener('click', e => {
    const kaart = e.target.closest('.hulpkaart-kaart');
    if (!kaart || kaart.dataset.uitgeput === 'true') return;
    openModal(kaart.dataset.hulpkaart, state, hulpkaarten, modal);
  });

  sidebar.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const kaart = e.target.closest('.hulpkaart-kaart');
    if (!kaart || kaart.dataset.uitgeput === 'true') return;
    e.preventDefault();
    openModal(kaart.dataset.hulpkaart, state, hulpkaarten, modal);
  });

  // Modal: sluit op backdrop-klik en sluit-knop
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
  modal.querySelector('.modal-sluiten')?.addEventListener('click', () => modal.close());

  // Container: verwijder-knoppen
  container.addEventListener('click', e => {
    const knop = e.target.closest('.invulvak-verwijder');
    if (!knop) return;
    const vakId = knop.dataset.vakId;
    const vak = state.actie.antwoorden.find(a => a.id === vakId);
    if (!vak) return;

    // Lees actuele DOM-waarde (niet debounced state) om te bepalen of bevestiging nodig is
    const textarea = container.querySelector(`textarea[data-vak-id="${vakId}"]`);
    const huidigAntwoord = textarea?.value ?? vak.antwoord;

    if (!huidigAntwoord.trim()) {
      verwijderVak(vakId, state, hulpkaarten, modal);
    } else if (verwijderDialog) {
      verwijderDialog.dataset.vakId = vakId;
      verwijderDialog.showModal();
    }
  });

  // Container: autosave textarea-input
  container.addEventListener('input', e => {
    const textarea = e.target.closest('textarea');
    if (!textarea) return;
    const vakId = textarea.dataset.vakId;
    clearTimeout(debounceTimers[vakId]);
    debounceTimers[vakId] = setTimeout(() => {
      const vak = state.actie.antwoorden.find(a => a.id === vakId);
      if (vak) { vak.antwoord = textarea.value; bewaarSessie(state); }
    }, 500);
  });

  // Verwijder-dialoog knoppen
  if (verwijderDialog) {
    verwijderDialog.querySelector('#verwijder-annuleer')
      ?.addEventListener('click', () => verwijderDialog.close());
    verwijderDialog.querySelector('#verwijder-bevestig')
      ?.addEventListener('click', () => {
        const vakId = verwijderDialog.dataset.vakId;
        verwijderDialog.close();
        verwijderVak(vakId, state, hulpkaarten, modal);
      });
  }
}

export function herstelStap4b(state, content) {
  const { rollen } = content.rollen;
  const { actiekaarten } = content.actiekaarten;
  const { hulpkaarten } = content.hulpkaarten;
  const modal = document.getElementById('hulpkaart-modal');

  // Referentie-blok bijwerken
  const referentieEl = document.getElementById('stap4b-referentie');
  const rol = rollen.find(r => r.id === state.gekozenRol);
  const actie = actiekaarten.find(k => k.id === state.actie?.kaartId);

  if (referentieEl && actie) {
    referentieEl.innerHTML = `
      <h3>Gekozen actie${rol ? ` — ${rol.naam}` : ''}</h3>
      <p style="font-weight:600">${actie.tekst}</p>
    `;
    referentieEl.style.borderLeftColor = rol?.kleur ?? 'var(--kleur-primair)';
  }

  // Zorg voor array
  if (!Array.isArray(state.actie.antwoorden)) state.actie.antwoorden = [];

  // Voeg initieel "Wat"-vak toe als er nog niets is
  if (state.actie.antwoorden.length === 0 && actie) {
    const watVraag = hulpkaarten.find(k => k.id === 'concreet')?.vragen.find(v => v.id === 'wat');
    if (watVraag) {
      state.actie.antwoorden.push({
        id: `vak-${Date.now()}`,
        hulpkaart: 'concreet',
        vraagId: 'wat',
        vraag: watVraag.tekst,
        antwoord: actie.tekst,
        volgorde: 0,
      });
      bewaarSessie(state);
    }
  }

  renderSidebar(state, hulpkaarten, modal);
  renderInvulvakken(state, hulpkaarten);
}

// ── Private helpers ───────────────────────────────────────────────────────────

function renderSidebar(state, hulpkaarten, modal) {
  const sidebar = document.getElementById('hulpkaarten-sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = hulpkaarten.map(kaart => {
    const gebruikteIds = state.actie.antwoorden
      .filter(a => a.hulpkaart === kaart.id).map(a => a.vraagId);
    const uitgeput = gebruikteIds.length >= kaart.vragen.length;
    const resterend = kaart.vragen.length - gebruikteIds.length;

    return `
      <div class="hulpkaart-kaart"
           data-hulpkaart="${kaart.id}"
           data-uitgeput="${uitgeput}"
           style="background-color: ${KLEUREN[kaart.id]}"
           role="button"
           tabindex="${uitgeput ? '-1' : '0'}"
           aria-label="${kaart.titel}${uitgeput ? ' — alle vragen toegevoegd' : ' — klik om vragen te zien'}">
        <img src="assets/icons/hulpkaart-${kaart.id}.svg" alt="" aria-hidden="true" class="hulpkaart-illustratie">
        <div class="hulpkaart-kaart-body">
          <h3>${kaart.titel}</h3>
          <p>${uitgeput ? 'Alle vragen toegevoegd' : kaart.intro}</p>
          ${uitgeput ? '' : `<span class="hulpkaart-teller">${resterend} ${resterend === 1 ? 'vraag' : 'vragen'}</span>`}
        </div>
      </div>
    `;
  }).join('');
}

function renderInvulvakken(state, hulpkaarten) {
  const container = document.getElementById('invulvakken-container');
  if (!container) return;

  const gesorteerd = [...state.actie.antwoorden].sort((a, b) => a.volgorde - b.volgorde);

  if (gesorteerd.length === 0) {
    container.innerHTML = '<p class="invulvakken-hint">Klik een hulpkaart links om een vraag toe te voegen aan je actieplan.</p>';
    return;
  }

  container.innerHTML = gesorteerd.map(vak => `
    <div class="invulvak" data-vak-id="${vak.id}" style="--vak-kleur: ${KLEUREN[vak.hulpkaart] ?? 'var(--kleur-primair)'}">
      <div class="invulvak-header">
        <label class="invulvak-label" for="textarea-${vak.id}">${esc(vak.vraag)}</label>
        <button type="button" class="invulvak-verwijder" data-vak-id="${vak.id}" aria-label="Verwijder dit veld">×</button>
      </div>
      <textarea id="textarea-${vak.id}" data-vak-id="${vak.id}" rows="3">${esc(vak.antwoord)}</textarea>
    </div>
  `).join('');
}

function openModal(hulpkaartId, state, hulpkaarten, modal) {
  const kaart = hulpkaarten.find(k => k.id === hulpkaartId);
  if (!kaart) return;

  // Pas modal-header aan
  const header = modal.querySelector('.modal-header');
  if (header) header.style.backgroundColor = KLEUREN[hulpkaartId];
  const illustratie = modal.querySelector('.modal-illustratie');
  if (illustratie) illustratie.src = `assets/icons/hulpkaart-${hulpkaartId}.svg`;
  const titel = modal.querySelector('#modal-titel');
  if (titel) titel.textContent = kaart.titel;

  // Bepaal beschikbare vragen
  const gebruikteIds = state.actie.antwoorden
    .filter(a => a.hulpkaart === hulpkaartId).map(a => a.vraagId);
  const beschikbaar = kaart.vragen.filter(v => !gebruikteIds.includes(v.id));

  const vragenEl = modal.querySelector('#modal-vragen');
  if (!vragenEl) return;

  if (beschikbaar.length === 0) {
    vragenEl.innerHTML = '<p class="modal-leeg-tekst">Alle vragen van deze hulpkaart zijn al toegevoegd.<br>Je kunt vragen verwijderen rechts om ze opnieuw te gebruiken.</p>';
  } else {
    vragenEl.innerHTML = beschikbaar.map(v => `
      <button type="button" class="modal-vraag-knop"
              data-hulpkaart="${hulpkaartId}"
              data-vraag-id="${v.id}">${esc(v.tekst)}</button>
    `).join('');

    vragenEl.querySelectorAll('.modal-vraag-knop').forEach(knop => {
      knop.addEventListener('click', () => {
        const vraag = kaart.vragen.find(v => v.id === knop.dataset.vraagId);
        if (!vraag) return;

        const nieuwVak = {
          id: `vak-${Date.now()}`,
          hulpkaart: hulpkaartId,
          vraagId: vraag.id,
          vraag: vraag.tekst,
          antwoord: '',
          volgorde: state.actie.antwoorden.length,
        };

        state.actie.antwoorden.push(nieuwVak);
        bewaarSessie(state);

        modal.close();
        renderInvulvakken(state, hulpkaarten);
        renderSidebar(state, hulpkaarten, modal);

        setTimeout(() => document.getElementById(`textarea-${nieuwVak.id}`)?.focus(), 50);
      });
    });
  }

  modal.showModal();
}

function verwijderVak(vakId, state, hulpkaarten, modal) {
  state.actie.antwoorden = state.actie.antwoorden.filter(a => a.id !== vakId);
  state.actie.antwoorden.forEach((a, i) => { a.volgorde = i; });
  bewaarSessie(state);
  renderInvulvakken(state, hulpkaarten);
  renderSidebar(state, hulpkaarten, modal);
}

function esc(str) {
  return (str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
