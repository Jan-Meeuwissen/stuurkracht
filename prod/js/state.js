export function defaultState() {
  return {
    sessieId: crypto.randomUUID(),
    startDatum: new Date().toISOString().slice(0, 10),
    laatsteWijziging: new Date().toISOString(),
    huidigeStap: 'start',
    uitdaging: '',
    zelfreflectie: {
      bestuurder: { sterk: [], ontwikkelen: [] },
      denker:     { sterk: [], ontwikkelen: [] },
      ondernemer: { sterk: [], ontwikkelen: [] },
      uitzoeker:  { sterk: [], ontwikkelen: [] },
      verbinder:  { sterk: [], ontwikkelen: [] },
    },
    gekozenRol: null,
    actie: {
      kaartId: null,
      kaartTekst: null,
      doelen: { 'waarom': '', 'kenmerk-rol': '', 'opbrengst': '', 'tevreden': '' },
      concreet: { 'wat': '', 'wie': '', 'waar': '', 'wanneer': '', 'hoe': '', 'eerste-stap': '' },
      omgeving: { 'gebruiken': '', 'in-de-weg': '', 'omgang-obstakel': '', 'helpers': '', 'blokkers': '', 'omgang-blokkers': '' },
    },
    reflectie: {
      gelukt: '',
      verklaring: '',
      'geleerd-actie': '',
      'geleerd-zelf': '',
      vervolgstap: '',
    },
  };
}
