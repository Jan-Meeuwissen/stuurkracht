import { bewaarSessie } from '../storage.js';

let debounceTimer = null;

export function initialiseerStap1(state, content) {
  const textarea = document.getElementById('uitdaging-textarea');
  const chipsContainer = document.getElementById('chips-container');

  if (!textarea || !chipsContainer) return;

  textarea.value = state.uitdaging ?? '';

  const voorbeelden = content.voorbeelden?.voorbeelden ?? [];
  chipsContainer.innerHTML = '';

  voorbeelden.forEach(tekst => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = tekst;
    chip.type = 'button';
    chip.setAttribute('aria-label', `Voeg toe: ${tekst}`);
    chip.addEventListener('click', () => {
      const huidig = textarea.value.trim();
      textarea.value = huidig ? `${huidig}\n${tekst}` : tekst;
      slaOp();
      textarea.focus();
    });
    chipsContainer.appendChild(chip);
  });

  textarea.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(slaOp, 500);
  });

  function slaOp() {
    state.uitdaging = textarea.value;
    bewaarSessie(state);
  }
}

export function herstelStap1(state) {
  const textarea = document.getElementById('uitdaging-textarea');
  if (textarea) textarea.value = state.uitdaging ?? '';
}
