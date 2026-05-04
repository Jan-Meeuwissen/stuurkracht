import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function laadJson(bestand) {
  const pad = resolve(process.cwd(), 'data', bestand);
  return JSON.parse(readFileSync(pad, 'utf-8'));
}

describe('rollen.json', () => {
  const data = laadJson('rollen.json');

  it('bevat exact 5 rollen', () => {
    expect(data.rollen).toHaveLength(5);
  });

  it('elke rol heeft exact 6 kwaliteiten', () => {
    data.rollen.forEach(rol => {
      expect(rol.kwaliteiten, `${rol.id} kwaliteiten`).toHaveLength(6);
    });
  });

  it('elke rol heeft vereiste velden', () => {
    const vereist = ['id', 'naam', 'tagline', 'kleur', 'icoon', 'kwaliteiten'];
    data.rollen.forEach(rol => {
      vereist.forEach(veld => {
        expect(rol, `${rol.id}.${veld}`).toHaveProperty(veld);
      });
    });
  });

  it('rol-ids zijn uniek', () => {
    const ids = data.rollen.map(r => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('actiekaarten.json', () => {
  const data = laadJson('actiekaarten.json');
  const rollenData = laadJson('rollen.json');
  const geldigeRolIds = rollenData.rollen.map(r => r.id);

  it('bevat kaarten', () => {
    expect(data.actiekaarten.length).toBeGreaterThan(0);
  });

  it('elke kaart heeft id, rol en tekst', () => {
    data.actiekaarten.forEach(kaart => {
      expect(kaart).toHaveProperty('id');
      expect(kaart).toHaveProperty('rol');
      expect(kaart).toHaveProperty('tekst');
    });
  });

  it('elke kaart verwijst naar een geldige rol-id', () => {
    data.actiekaarten.forEach(kaart => {
      expect(geldigeRolIds, `kaart ${kaart.id} rol ${kaart.rol}`).toContain(kaart.rol);
    });
  });

  it('bevat kaarten voor alle 5 rollen', () => {
    const aanwezigeRollen = new Set(data.actiekaarten.map(k => k.rol));
    geldigeRolIds.forEach(rolId => {
      expect(aanwezigeRollen, `rol ${rolId} heeft kaarten`).toContain(rolId);
    });
  });

  it('kaart-ids zijn uniek', () => {
    const ids = data.actiekaarten.map(k => k.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('hulpkaarten.json', () => {
  const data = laadJson('hulpkaarten.json');

  it('bevat exact 3 hulpkaarten', () => {
    expect(data.hulpkaarten).toHaveLength(3);
  });

  it('elke hulpkaart heeft titel en vragen-array', () => {
    data.hulpkaarten.forEach(kaart => {
      expect(kaart).toHaveProperty('titel');
      expect(Array.isArray(kaart.vragen)).toBe(true);
      expect(kaart.vragen.length).toBeGreaterThan(0);
    });
  });

  it('eerste kaart heeft 4 vragen', () => {
    expect(data.hulpkaarten[0].vragen).toHaveLength(4);
  });

  it('tweede kaart heeft 6 vragen', () => {
    expect(data.hulpkaarten[1].vragen).toHaveLength(6);
  });

  it('derde kaart heeft 6 vragen', () => {
    expect(data.hulpkaarten[2].vragen).toHaveLength(6);
  });
});

describe('reflectie.json', () => {
  const data = laadJson('reflectie.json');

  it('bevat exact 5 reflectievragen', () => {
    expect(data.reflectiekaart.vragen).toHaveLength(5);
  });

  it('elke vraag heeft id en tekst', () => {
    data.reflectiekaart.vragen.forEach(vraag => {
      expect(vraag).toHaveProperty('id');
      expect(vraag).toHaveProperty('tekst');
    });
  });
});

describe('begeleider.json', () => {
  const data = laadJson('begeleider.json');

  it('bevat begeleider-object', () => {
    expect(data).toHaveProperty('begeleider');
  });

  it('bevat instructies voor stap1 t/m stap5', () => {
    ['stap1', 'stap2', 'stap3', 'stap4a', 'stap4b', 'stap5'].forEach(stap => {
      expect(data.begeleider, stap).toHaveProperty(stap);
    });
  });
});

describe('voorbeelden-uitdagingen.json', () => {
  const data = laadJson('voorbeelden-uitdagingen.json');

  it('bevat voorbeelden-array', () => {
    expect(Array.isArray(data.voorbeelden)).toBe(true);
    expect(data.voorbeelden.length).toBeGreaterThan(0);
  });
});
