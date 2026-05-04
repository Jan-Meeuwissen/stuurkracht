export function exporteerAlsPdf(state, content) {
  const { rollen, actiekaarten } = content;

  const rolData = rollen.rollen.find(r => r.id === state.gekozenRol);
  const actieData = actiekaarten.actiekaarten.find(k => k.id === state.actie?.kaartId);

  const datum = new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' });
  const bestandsDatum = new Date().toISOString().slice(0, 10);
  const kleur = rolData?.kleur ?? '#1E3A5F';

  const zelfreflectieHtml = Object.entries(state.zelfreflectie ?? {}).map(([rolId, data]) => {
    const rol = rollen.rollen.find(r => r.id === rolId);
    if (!rol) return '';
    const sterk = (data.sterk ?? []).join(', ') || '—';
    const ontwikkelen = (data.ontwikkelen ?? []).join(', ') || '—';
    return `<tr>
      <td style="padding:4px 8px;font-weight:600">${rol.naam}</td>
      <td style="padding:4px 8px">${sterk}</td>
      <td style="padding:4px 8px">${ontwikkelen}</td>
    </tr>`;
  }).join('');

  const hulpVelden = (groep, labels) => Object.entries(groep ?? {}).map(([id, waarde]) => {
    const label = labels[id] ?? id;
    return `<div style="margin-bottom:10px">
      <div style="font-size:10px;color:#666;font-weight:600;text-transform:uppercase;margin-bottom:3px">${label}</div>
      <div style="border:1px solid #ddd;border-radius:4px;padding:6px 8px;min-height:24px;font-size:12px">${waarde || '—'}</div>
    </div>`;
  }).join('');

  const doelenLabels = { 'waarom': 'Waarom doe je deze actie?', 'kenmerk-rol': 'Aan welk kenmerk werk je?', 'opbrengst': 'Wat levert het op?', 'tevreden': 'Wanneer ben je tevreden?' };
  const concreetLabels = { 'wat': 'Wat ga je doen?', 'wie': 'Wie betrek je?', 'waar': 'Waar?', 'wanneer': 'Wanneer?', 'hoe': 'Hoe bereid je voor?', 'eerste-stap': 'Eerste stap' };
  const omgevingLabels = { 'gebruiken': 'Wat kun je gebruiken?', 'in-de-weg': 'Wat staat in de weg?', 'omgang-obstakel': 'Hoe ga je daarmee om?', 'helpers': 'Wie kan helpen?', 'blokkers': 'Wie staat in de weg?', 'omgang-blokkers': 'Hoe ga je daarmee om?' };
  const reflectieLabels = { 'gelukt': 'In hoeverre is het gelukt?', 'verklaring': 'Hoe verklaar je dat?', 'geleerd-actie': 'Wat heb je geleerd van de actie?', 'geleerd-zelf': 'Wat heb je over jezelf geleerd?', 'vervolgstap': 'Welke vervolgstap zet je?' };

  const html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>STUURkracht actieplan — ${bestandsDatum}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1A1F2C; margin: 0; padding: 24px; }
    h1 { font-size: 22px; color: #1E3A5F; margin: 0 0 4px; }
    h2 { font-size: 14px; color: #1E3A5F; border-bottom: 2px solid ${kleur}; padding-bottom: 4px; margin: 20px 0 12px; }
    .voorblad { background: #1E3A5F; color: white; padding: 24px; border-radius: 8px; margin-bottom: 20px; }
    .voorblad h1 { color: white; }
    .datum { color: rgba(255,255,255,0.7); font-size: 11px; margin-top: 4px; }
    .tag { display: inline-block; background: ${kleur}; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; color: #1E3A5F; margin-top: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #f5f5f3; padding: 6px 8px; text-align: left; font-weight: 600; border-bottom: 1px solid #ddd; }
    td { border-top: 1px solid #eee; vertical-align: top; }
    .actie-blok { background: ${kleur}20; border-left: 4px solid ${kleur}; padding: 12px; border-radius: 4px; font-weight: 600; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #eee; font-size: 10px; color: #999; text-align: center; }
    @media print {
      body { padding: 0; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body>
  <div class="voorblad">
    <h1>STUURkracht Challenge</h1>
    <div style="font-size:14px;margin-top:4px;color:rgba(255,255,255,0.9)">Persoonlijk actieplan</div>
    <div class="datum">${datum}</div>
    ${rolData ? `<span class="tag">${rolData.naam}</span>` : ''}
  </div>

  <h2>Uitdaging</h2>
  <div style="background:#f9f9f7;border-radius:6px;padding:12px;min-height:40px">${state.uitdaging || '—'}</div>

  <h2>Zelfreflectie</h2>
  <table>
    <thead><tr>
      <th>Rol</th><th>Sterk in</th><th>Wil ontwikkelen</th>
    </tr></thead>
    <tbody>${zelfreflectieHtml}</tbody>
  </table>

  ${actieData ? `
  <h2>Gekozen actie</h2>
  <div class="actie-blok">${actieData.tekst}</div>
  ` : ''}

  ${state.actie?.doelen && Object.keys(state.actie.doelen).length ? `<h2>Doelen en gewenste opbrengsten</h2>${hulpVelden(state.actie.doelen, doelenLabels)}` : ''}
  ${state.actie?.concreet && Object.keys(state.actie.concreet).length ? `<h2>Actie concreet maken</h2>${hulpVelden(state.actie.concreet, concreetLabels)}` : ''}
  ${state.actie?.omgeving && Object.keys(state.actie.omgeving).length ? `<h2>Invloed omgevingsfactoren</h2>${hulpVelden(state.actie.omgeving, omgevingLabels)}` : ''}
  ${state.reflectie?.gelukt ? `<h2>Reflectie</h2>${hulpVelden(state.reflectie, reflectieLabels)}` : ''}

  <div class="footer">
    STUURkracht Challenge — HAN · NRO · De Haagse Hogeschool · Noorderpoort · RijnIJssel · ROC Nijmegen
  </div>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`;

  const venster = window.open('', '_blank');
  if (!venster) {
    alert('Schakel pop-ups in voor deze pagina om de PDF te genereren.');
    return;
  }
  venster.document.write(html);
  venster.document.close();
}
