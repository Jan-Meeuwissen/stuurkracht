let cache = null;

export async function laadAlleContent() {
  if (cache) return cache;

  const [rollen, actiekaarten, hulpkaarten, reflectie, begeleider, voorbeelden] =
    await Promise.all([
      fetch('data/rollen.json').then(r => r.json()),
      fetch('data/actiekaarten.json').then(r => r.json()),
      fetch('data/hulpkaarten.json').then(r => r.json()),
      fetch('data/reflectie.json').then(r => r.json()),
      fetch('data/begeleider.json').then(r => r.json()),
      fetch('data/voorbeelden-uitdagingen.json').then(r => r.json()),
    ]);

  cache = { rollen, actiekaarten, hulpkaarten, reflectie, begeleider, voorbeelden };
  return cache;
}
