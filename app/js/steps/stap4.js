import { bewaarSessie } from '../storage.js';
import { navigeerNaar } from '../router.js';

let debounceTimers = {};

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

export function initialiseerStap4b(state, content) {
  const referentieEl = document.getElementById('stap4b-referentie');
  const formulierContainer = document.getElementById('hulpkaarten-formulier');

  if (!formulierContainer) return;

  const { rollen } = content.rollen;
  const { actiekaarten } = content.actiekaarten;
  const { hulpkaarten } = content.hulpkaarten;

  const rol = rollen.find(r => r.id === state.gekozenRol);
  const actie = actiekaarten.find(k => k.id === state.actie?.kaartId);

  if (referentieEl && actie) {
    referentieEl.innerHTML = `
      <h3>Gekozen actie${rol ? ` — ${rol.naam}` : ''}</h3>
      <p style="font-weight:600">${actie.tekst}</p>
    `;
    referentieEl.style.borderLeftColor = rol?.kleur ?? 'var(--kleur-primair)';
  }

  formulierContainer.innerHTML = hulpkaarten.map(kaart => {
    const groepNaam = kaart.id;
    const velden = kaart.vragen.map(vraag => {
      const waarde = state.actie?.[groepNaam]?.[vraag.id] ?? '';
      return `
        <div class="vraag-groep">
          <label for="actie-${groepNaam}-${vraag.id}">${vraag.tekst}</label>
          <textarea id="actie-${groepNaam}-${vraag.id}"
            name="${vraag.id}"
            data-groep="${groepNaam}"
            rows="3"
            aria-label="${vraag.tekst}">${waarde}</textarea>
        </div>
      `;
    }).join('');

    return `
      <div class="hulpkaart-sectie">
        <h3>${kaart.titel}</h3>
        <p class="hulpkaart-intro">${kaart.intro}</p>
        ${velden}
      </div>
    `;
  }).join('');

  formulierContainer.addEventListener('input', e => {
    const textarea = e.target.closest('textarea');
    if (!textarea) return;
    const groep = textarea.dataset.groep;
    const veld = textarea.name;

    clearTimeout(debounceTimers[`${groep}-${veld}`]);
    debounceTimers[`${groep}-${veld}`] = setTimeout(() => {
      if (!state.actie[groep]) state.actie[groep] = {};
      state.actie[groep][veld] = textarea.value;
      bewaarSessie(state);
    }, 500);
  });
}

export function herstelStap4b(state, content) {
  const { hulpkaarten } = content.hulpkaarten;
  hulpkaarten.forEach(kaart => {
    kaart.vragen.forEach(vraag => {
      const el = document.getElementById(`actie-${kaart.id}-${vraag.id}`);
      if (el) el.value = state.actie?.[kaart.id]?.[vraag.id] ?? '';
    });
  });
}
