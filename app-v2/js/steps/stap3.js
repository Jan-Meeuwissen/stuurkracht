import { bewaarSessie } from '../storage.js';

export function initialiseerStap3(state, content) {
  const grid = document.getElementById('rollen-grid-stap3');
  const rolkeuzeGroep = document.getElementById('rolkeuze-groep');
  const waarschuwing = document.getElementById('rolkeuze-waarschuwing');

  if (!grid || !rolkeuzeGroep) return;

  const { rollen } = content.rollen;

  grid.innerHTML = rollen.map(rol => `
    <div class="reflectie-rolkaart" style="border-top: 3px solid ${rol.kleur}">
      <h3>${rol.naam}</h3>
      <ul class="kwaliteiten-lijst" role="list">
        ${rol.kwaliteiten.map(k => `
          <li class="kwaliteit-reflectie">
            <span class="kwaliteit-naam">${k.naam}</span>
            <div class="kwaliteit-knoppen">
              <button type="button"
                class="kwaliteit-knop knop-sterk"
                data-rol="${rol.id}"
                data-kwaliteit="${k.id}"
                data-type="sterk"
                aria-pressed="false"
                aria-label="Sterk in: ${k.naam}">✓</button>
              <button type="button"
                class="kwaliteit-knop knop-ontwikkelen"
                data-rol="${rol.id}"
                data-kwaliteit="${k.id}"
                data-type="ontwikkelen"
                aria-pressed="false"
                aria-label="Wil ontwikkelen: ${k.naam}">↑</button>
            </div>
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('');

  rolkeuzeGroep.innerHTML = rollen.map(rol => `
    <label class="rolkeuze-optie">
      <input type="radio" name="gekozen-rol" value="${rol.id}"
        ${state.gekozenRol === rol.id ? 'checked' : ''}>
      <img class="rolkeuze-foto" src="assets/images/illustratie-${rol.id}.jpg"
           alt="" aria-hidden="true" loading="lazy">
      <span>${rol.naam}</span>
    </label>
  `).join('');

  herstelStap3UI(state);

  grid.addEventListener('click', e => {
    const knop = e.target.closest('.kwaliteit-knop');
    if (!knop) return;

    const { rol, kwaliteit, type } = knop.dataset;
    const andere = type === 'sterk' ? 'ontwikkelen' : 'sterk';

    const rolState = state.zelfreflectie[rol];
    const andereLijst = rolState[andere];
    const index = andereLijst.indexOf(kwaliteit);
    if (index > -1) andereLijst.splice(index, 1);

    const eigenLijst = rolState[type];
    const eigenIndex = eigenLijst.indexOf(kwaliteit);
    if (eigenIndex > -1) {
      eigenLijst.splice(eigenIndex, 1);
      knop.setAttribute('aria-pressed', 'false');
    } else {
      eigenLijst.push(kwaliteit);
      knop.setAttribute('aria-pressed', 'true');
    }

    const anderKnopSelector = `.kwaliteit-knop[data-rol="${rol}"][data-kwaliteit="${kwaliteit}"][data-type="${andere}"]`;
    const anderKnop = grid.querySelector(anderKnopSelector);
    if (anderKnop) anderKnop.setAttribute('aria-pressed', 'false');

    bewaarSessie(state);
  });

  rolkeuzeGroep.addEventListener('change', e => {
    if (e.target.name === 'gekozen-rol') {
      state.gekozenRol = e.target.value;
      bewaarSessie(state);
      if (waarschuwing) waarschuwing.hidden = true;
    }
  });

  return waarschuwing;
}

export function herstelStap3UI(state) {
  document.querySelectorAll('.kwaliteit-knop').forEach(knop => {
    const { rol, kwaliteit, type } = knop.dataset;
    const actief = state.zelfreflectie?.[rol]?.[type]?.includes(kwaliteit) ?? false;
    knop.setAttribute('aria-pressed', String(actief));
  });

  if (state.gekozenRol) {
    const radio = document.querySelector(`input[name="gekozen-rol"][value="${state.gekozenRol}"]`);
    if (radio) radio.checked = true;
  }
}

export function toonRolkeuzeWaarschuwing() {
  const waarschuwing = document.getElementById('rolkeuze-waarschuwing');
  if (waarschuwing) {
    waarschuwing.hidden = false;
    waarschuwing.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
