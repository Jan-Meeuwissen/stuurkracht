import { bewaarSessie } from '../storage.js';

let debounceTimers = {};

export function initialiseerStap5(state, content) {
  const referentieEl = document.getElementById('stap5-referentie');
  const formulierEl = document.getElementById('reflectie-formulier');

  if (!formulierEl) return;

  const { rollen } = content.rollen;
  const { actiekaarten } = content.actiekaarten;
  const { reflectiekaart } = content.reflectie;

  const rol = rollen.find(r => r.id === state.gekozenRol);
  const actie = actiekaarten.find(k => k.id === state.actie?.kaartId);

  if (referentieEl) {
    referentieEl.innerHTML = `
      <h3>Jouw actie${rol ? ` — ${rol.naam}` : ''}</h3>
      ${actie ? `<p style="font-weight:600">${actie.tekst}</p>` : '<p>Geen actie geselecteerd</p>'}
      ${state.actie?.antwoorden?.find(a => a.hulpkaart === 'doelen' && a.vraagId === 'waarom')?.antwoord
        ? `<p style="font-size:0.9rem;color:rgba(26,31,44,0.7)"><strong>Doel:</strong> ${state.actie.antwoorden.find(a => a.hulpkaart === 'doelen' && a.vraagId === 'waarom').antwoord}</p>`
        : ''}
    `;
  }

  formulierEl.innerHTML = reflectiekaart.vragen.map(vraag => `
    <div class="vraag-groep">
      <label for="reflectie-${vraag.id}">${vraag.tekst}</label>
      <textarea id="reflectie-${vraag.id}"
        name="${vraag.id}"
        rows="4"
        aria-label="${vraag.tekst}">${state.reflectie?.[vraag.id] ?? ''}</textarea>
    </div>
  `).join('');

  formulierEl.addEventListener('input', e => {
    const textarea = e.target.closest('textarea');
    if (!textarea) return;
    const veld = textarea.name;
    clearTimeout(debounceTimers[veld]);
    debounceTimers[veld] = setTimeout(() => {
      state.reflectie[veld] = textarea.value;
      bewaarSessie(state);
    }, 500);
  });
}

export function herstelStap5(state) {
  document.querySelectorAll('#reflectie-formulier textarea').forEach(el => {
    el.value = state.reflectie?.[el.name] ?? '';
  });
}
