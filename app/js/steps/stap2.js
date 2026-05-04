export function initialiseerStap2(content) {
  const grid = document.getElementById('rollen-grid-stap2');
  if (!grid) return;

  const { rollen } = content.rollen;

  grid.innerHTML = rollen.map(rol => `
    <div class="rolkaart-wrapper">
      <div class="rolkaart"
           data-testid="rolkaart"
           data-rol="${rol.id}"
           role="button"
           tabindex="0"
           aria-pressed="false"
           aria-label="${rol.naam} — klik om kwaliteiten te zien">
        <div class="rolkaart-voor" style="background-color: ${rol.kleur}">
          <img class="icoon" src="assets/icons/${rol.icoon}" alt="" aria-hidden="true">
          <div class="rolnaam">${rol.naam}</div>
          <div class="tagline">${rol.tagline}</div>
        </div>
        <div class="rolkaart-achter" style="background-color: ${rol.kleur}">
          <h3>${rol.naam}</h3>
          <ul class="kwaliteiten-lijst" role="list">
            ${rol.kwaliteiten.map(k => `
              <li class="kwaliteit-item">
                <img src="assets/icons/icoon-zeil.svg" width="14" height="14" alt="" aria-hidden="true">
                ${k.naam}
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.rolkaart').forEach(kaart => {
    const flip = () => {
      const geflipped = kaart.getAttribute('data-flipped') === 'true';
      kaart.setAttribute('data-flipped', String(!geflipped));
      kaart.setAttribute('aria-pressed', String(!geflipped));
    };
    kaart.addEventListener('click', flip);
    kaart.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });
  });
}
