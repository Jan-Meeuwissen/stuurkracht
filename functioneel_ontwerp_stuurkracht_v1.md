# Functioneel Ontwerp — STUURkracht Challenge Webapp v1

*Versie 1.0 — Mei 2026*
*Opgesteld voor de digitalisering van de STUURkracht Challenge (HAN, NRO, De Haagse Hogeschool, Noorderpoort, RijnIJssel, ROC Nijmegen).*

---

## 1. Doel en achtergrond

De STUURkracht Challenge is een methodiek waarmee studenten in het mbo en hbo leren regie te nemen op uitdagende momenten in hun opleiding. De methodiek werkt nu met fysieke kaartensets en een PowerPoint, en wordt klassikaal begeleid door een docent of mentor. De zeilbootmetafoor — *doel en route kiezen, kwaliteiten inzetten, je verhouden tot de omgeving* — vormt het inhoudelijke hart.

Dit ontwerp digitaliseert de challenge tot één webapplicatie die docenten klassikaal kunnen gebruiken op een digibord, zonder fysieke materialen en zonder installatie.

## 2. Doelgroep en gebruikssituatie

**Primaire gebruiker (V1):** de docent of mentor die de challenge klassikaal begeleidt op een digibord of via een projector. De docent voert het gesprek, vult de invoer namens de groep in, en navigeert door de stappen.

**Secundaire gebruiker (V2, voorzien maar niet gebouwd in V1):** de student die de challenge individueel of in een klein groepje doorloopt, op een eigen apparaat.

**Gebruikssituaties V1:**
- Klassikale sessie van 30–60 minuten, één lokaal, één scherm.
- Vervolgsessie waarin stap 5 (reflectie) wordt doorlopen, eventueel weken later.

## 3. Scope

**In scope V1:**
- De volledige flow van stap 1 t/m 5
- Alle rolkaarten, actiekaarten, hulpkaarten en de reflectiekaart
- Begeleiderspaneel met didactische notities per stap
- PDF-export van een ingevulde sessie
- Lokale opslag van de huidige sessie in de browser
- Responsive ontwerp voor digibord, desktop, laptop en tablet
- Werkt zonder server, zonder login, zonder data-extern-versturen

**Buiten scope V1, voorzien voor latere versies:**
- Studentvariant (individueel of in groepje)
- Timer voor groepswerk
- QR-code en word cloud voor klasinput
- Geschiedenis van meerdere sessies per docent
- Account- of gebruikersbeheer
- Koppeling met een LMS of studieportfolio

## 4. Technische keuzes

**Stack:**
- Vanilla HTML, CSS en JavaScript (ES modules)
- Geen build-stap, geen frameworks, geen backend
- Externe afhankelijkheden alleen voor PDF-generatie (`html2pdf.js` of `jsPDF`), geladen via CDN of meegeleverd

**Waarom deze stack:**
- Werkt zonder installatie, ook lokaal vanaf USB of een schoolserver
- Lange houdbaarheid: geen frameworkupdates die over twee jaar de app breken
- Eenvoudig over te dragen aan een ander team binnen HAN of een ROC
- Snel genoeg voor digiborden met beperkte hardware

**Hosting:** statische site. Mogelijke opties: een eigen webruimte van HAN of ROC Nijmegen, een eenvoudige statische hostingdienst, of zelfs uitleveren als ZIP-bestand voor lokaal gebruik.

**Browsersupport:** moderne browsers (Chrome, Edge, Firefox, Safari) van de afgelopen drie jaar.

## 5. Bestandsstructuur

```
stuurkracht/
├── index.html              Eén entry-pagina, alle stappen via show/hide
├── css/
│   ├── tokens.css          CSS-variabelen: kleuren, typografie, spacing
│   ├── base.css            Reset + basistypografie
│   ├── components.css      Kaarten, knoppen, formulieren, paneel
│   └── layout.css          Voortgangsbalk, stappen, presentatiemodus
├── js/
│   ├── app.js              Entry: routing, state, init
│   ├── storage.js          localStorage-laag
│   ├── pdf.js              PDF-export
│   ├── data.js             Laden en cachen van JSON-content
│   └── steps/
│       ├── stap1.js
│       ├── stap2.js
│       ├── stap3.js
│       ├── stap4.js
│       └── stap5.js
├── data/
│   ├── rollen.json
│   ├── actiekaarten.json
│   ├── hulpkaarten.json
│   ├── reflectie.json
│   └── begeleider.json
├── assets/
│   ├── icons/              Kompas, roer, zeil als SVG
│   └── images/
└── README.md               Installatie en deployment
```

## 6. Visuele identiteit

**Toon:** clean en professioneel, maar uitnodigend. Geschikt voor mbo én hbo, niet kinderachtig en niet kil-corporate.

**Kleuren — basis (maritiem):**
- Marineblauw `#1E3A5F` als primaire kleur
- Oceaanblauw `#3B6E91` als secundair
- Zandgeel `#E8B85F` als warm accent voor knoppen en hoogtepunten
- Off-white `#FAFAF7` als achtergrond
- Dieptegrijs `#1A1F2C` voor tekst

**Kleuren — rollen** (behouden uit originele kaartenset, licht verfijnd):
- De Bestuurder: zalm-roze
- De Denker: oranje-perzik
- De Ondernemer: zandgeel
- De Uitzoeker: turquoise
- De Verbinder: lichtblauw

**Typografie:**
- Schreefloos lettertype, bijvoorbeeld Inter of Plus Jakarta Sans
- Lichaamstekst circa 18 px met ruime regelhoogte voor leesbaarheid op afstand
- Koppen iets steviger en groter, geen decoratief lettertype

**Iconografie:** drie subtiele SVG-iconen die terugkomen door de hele applicatie:
- Een **kompas** voor de stappen-navigatie (de koers)
- Een **roer** voor de actiekaarten (regie nemen)
- Een **zeil** voor de kwaliteiten (wat je inzet)

**Animatie:** spaarzaam en functioneel. Een zachte fade-overgang tussen stappen, een flip-animatie op de rolkaarten, een subtiele hover-state op de actiekaarten. Alle bewegingen rond 200–300 ms.

**Hoeken en schaduwen:** lichte afronding (8–12 px), subtiele schaduwen op kaarten en knoppen. Strakke uitlijning, ruime witruimte.

## 7. Informatiearchitectuur

De applicatie heeft één HTML-pagina met zes secties die afwisselend zichtbaar zijn:

| Schermnaam | Omschrijving |
| --- | --- |
| Start | Welkomstscherm met uitleg van de zeilbootmetafoor en knop "Start sessie" |
| Stap 1 | Wat is jouw uitdaging? |
| Stap 2 | Welke kwaliteiten heb je nodig? |
| Stap 3 | Waar ben jij al sterk in? Wat wil je ontwikkelen? |
| Stap 4 | Kies een actie en maak deze concreet (sub-schermen 4a en 4b) |
| Stap 5 | Reflectie op de uitgevoerde actie |
| Overzicht | Volledige sessie, met PDF-export en optie nieuwe sessie |

**Vaste UI-elementen** op elk scherm behalve de Startpagina:

- **Voortgangsbalk** ("de koers") bovenin: vijf stappen als klikbare punten met een kompasje als positie­indicator. Toont waar je bent in de sessie en laat je vrij vooruit of terug navigeren.
- **Begeleiderspaneel** rechts (of onderaan op smalle schermen): inklapbaar paneel met didactische notities, voorbeeldvragen en instructies. Kan tijdens een presentatie verborgen worden met één klik.
- **Hoofdvlak**: de inhoud van de huidige stap, optimaal voor digibordprojectie.
- **Onderbalk**: knoppen "Vorige stap" en "Volgende stap", plus "Sla op en sluit".

## 8. Detailontwerp per stap

### Stap 1 — Wat is jouw uitdaging?

**Doel:** uitdagende momenten verzamelen en zichtbaar maken voor de groep.

**Schermopbouw:**
- Bovenaan: de vraag *"Wat zijn uitdagende momenten in jullie opleiding?"*
- Centraal: een groot tekstveld waarin de docent meerdere uitdagingen kan typen, één per regel.
- Daaronder: een rij klikbare voorbeeldscenario's (chips). Aanklikken voegt het scenario toe aan het tekstveld. Voorbeelden: *Een nieuw project starten · Samenwerken in een lastige groep · Voorbereiden op een tentamen · Feedback krijgen die binnenkomt · Stage-uitdaging · Presenteren voor de klas*.

**Begeleiderspaneel toont:** instructie uit dia 11 van de PowerPoint, plus de tip *"Zorg dat iedereen een uitdagend moment in zijn hoofd heeft voor je doorgaat."*

**Opslag:** bij elke wijziging direct opgeslagen in `localStorage` als veld `uitdaging`.

### Stap 2 — Welke kwaliteiten heb je nodig?

**Doel:** kennismaken met de vijf rollen en hun kwaliteiten.

**Schermopbouw:**
- Bovenaan: de inleidende vraag *"Welke kwaliteiten zijn nodig om met de uitdagende momenten om te gaan?"*
- Vijf rolkaarten naast elkaar (op smalle schermen onder elkaar). Elke kaart toont de naam van de rol, een sfeerillustratie of icoon, en een korte tagline.
- Klikken op een kaart laat hem omdraaien (flip-animatie) en toont de zes kwaliteiten van die rol.
- Tweede klik draait hem terug.

**Begeleiderspaneel toont:** suggestie om met de klas te bespreken welke kwaliteiten passen bij de uitdaging uit stap 1.

**Geen invoer in deze stap.** Hij dient als kennismaking.

### Stap 3 — Waar ben jij al sterk in?

**Doel:** zelfreflectie en het kiezen van een rol om aan te werken.

**Schermopbouw:**
- Bovenaan de vraag uit dia 15: *"In welke rol herken je jezelf? Welke kwaliteiten beheers je al goed? In welke wil je je nog ontwikkelen?"*
- Vijf rolkaarten met de zes kwaliteiten direct zichtbaar.
- Per kwaliteit twee kleine knoppen: ✓ "Sterk in" en ↑ "Wil ontwikkelen". De docent vinkt aan namens een student of klas.
- Onderaan een gerichte vraag: *"Welke rol wil je inzetten voor jouw uitdaging?"* — keuze uit de vijf rollen.

**Begeleiderspaneel toont:** instructie om dit klassikaal te bespreken of in subgroepjes uit te werken; suggestie om eventueel meerdere rondjes te doen.

**Opslag:** `zelfreflectie` (per rol een lijst sterke kanten en ontwikkelpunten) en `gekozenRol`.

### Stap 4 — Kies een actie en maak deze concreet

Twee subschermen.

**Stap 4a — Actiekaart kiezen.**
- Toont de actiekaarten van de gekozen rol uit stap 3 als een grid of carrousel.
- Elke kaart toont de tekst van de actie, met de kleur van de rol op de achtergrond.
- Klikken op een actiekaart selecteert deze en gaat door naar 4b.
- Optie: "Andere rol kiezen" terug naar stap 3.

**Stap 4b — Actie concreet maken.**
- De gekozen actiekaart staat bovenaan als referentie.
- Daaronder drie hulpkaarten als invulformulieren in volgorde, op basis van de fysieke hulpkaarten:
  1. **Doelen en gewenste opbrengsten**: *Waarom doe je deze actie? · Aan welk kenmerk van de gekozen rol ga je werken? · Wat denk je dat de actie gaat opleveren? · Wanneer ben je tevreden?*
  2. **Actie concreet maken**: *Wat ga je precies doen? · Wie betrek je? · Waar voer je de actie uit? · Wanneer? · Hoe bereid je het voor? · Wat is de eerste stap?*
  3. **Invloed van omgevingsfactoren**: *Wat kun je in jouw omgeving gebruiken? · Wat zou de actie in de weg kunnen staan? · Hoe ga je daarmee om? · Wie kan helpen? · Wie zou het in de weg kunnen staan? · Hoe ga je daarmee om?*
- Elk veld wordt direct opgeslagen.

**Begeleiderspaneel toont:** de doorlooptip uit dia 18 *"Lees je gekozen actiekaart hardop voor aan je medestudenten. De anderen stellen vragen aan de hand van de hulpkaarten."*

**Opslag:** `actie` met `kaartId`, `kaartTekst`, `doelen`, `concreet` en `omgeving`.

### Stap 5 — Kijk samen terug

**Doel:** reflecteren op de uitgevoerde actie.

**Schermopbouw:**
- Bovenaan: de gekozen actie en de oorspronkelijke doelen ter referentie (uit stap 4).
- De vijf reflectievragen als invulvelden:
  - *In hoeverre is het gelukt om de actie uit te voeren?*
  - *Hoe verklaar je de mate waarin de actie is gelukt?*
  - *Wat heb je van de actie geleerd (kennis, inzicht, anders)?*
  - *Wat heb je geleerd over jezelf?*
  - *Welke vervolgstap zou je nu kunnen zetten?*
- Onderaan: knop *"Vervolgactie kiezen"* (terug naar stap 4 met behoud van vorige sessie als context) en knop *"Sessie afronden"* (gaat naar overzicht).

**Begeleiderspaneel toont:** notitie uit dia 22 over zicht krijgen op ontwikkeling in stuurkracht.

**Opslag:** `reflectie` met de vijf antwoorden.

### Overzicht — Sessie-export

**Doel:** alles in één scherm laten zien en exporteren.

**Schermopbouw:**
- Compact overzicht van alle ingevulde gegevens, gegroepeerd per stap.
- Knop *"Download als PDF"*.
- Knop *"Nieuwe sessie starten"* (vraagt bevestiging, leegt `localStorage`).
- Knop *"Doorgaan met deze sessie"* (terug naar de laatst bezochte stap).

## 9. Datamodel en opslag

De volledige sessie is één JSON-object in `localStorage` onder de sleutel `stuurkracht.sessie.huidig`:

```json
{
  "sessieId": "uuid",
  "startDatum": "2026-05-04",
  "laatsteWijziging": "2026-05-04T14:31:00",
  "uitdaging": "...",
  "zelfreflectie": {
    "bestuurder": { "sterk": ["plannen"], "ontwikkelen": ["hulp vragen"] },
    "denker": { "sterk": [], "ontwikkelen": [] },
    "ondernemer": { "sterk": [], "ontwikkelen": [] },
    "uitzoeker": { "sterk": [], "ontwikkelen": [] },
    "verbinder": { "sterk": [], "ontwikkelen": [] }
  },
  "gekozenRol": "bestuurder",
  "actie": {
    "kaartId": "best-1",
    "kaartTekst": "Maak een plan hoe te leren voor de volgende toets en vraag hier feedback op.",
    "doelen": { "waarom": "...", "kenmerk": "...", "opbrengst": "...", "tevreden": "..." },
    "concreet": { "wat": "...", "wie": "...", "waar": "...", "wanneer": "...", "hoe": "...", "eerstestap": "..." },
    "omgeving": { "gebruiken": "...", "in_de_weg": "...", "omgang": "...", "helpers": "...", "blokkers": "...", "omgang_blokkers": "..." }
  },
  "reflectie": {
    "gelukt": "...",
    "verklaring": "...",
    "geleerd_actie": "...",
    "geleerd_zelf": "...",
    "vervolgstap": "..."
  }
}
```

**Opslagregels:**
- Elke wijziging in een veld wordt direct gepersisteerd (debounced op circa 500 ms).
- Bij het starten van een nieuwe sessie wordt het object overschreven na expliciete bevestiging.
- Geen gegevens verlaten ooit het apparaat van de gebruiker.

## 10. Begeleiderspaneel

Het paneel is rechts (op desktop) of onder (op tablet/mobiel) inklapbaar. Het toont per stap de inhoud die in de huidige PowerPoint in het notitieveld staat, plus aanvullende didactische tips. Het paneel heeft één toggle om het volledig te verbergen tijdens projectie, zodat alleen de leerstof zichtbaar is voor de klas.

De inhoud staat in `data/begeleider.json`, zodat HAN of een docent zelf later teksten kan aanpassen zonder code aan te raken.

## 11. Content-data: JSON-specificaties

**`rollen.json`** — array van vijf objecten:
```json
{ "id": "bestuurder", "naam": "De Bestuurder", "tagline": "...", "kleur": "#...", "icoon": "kompas.svg", "kwaliteiten": ["doelen stellen", "jezelf motiveren", "plannen", "zelfvertrouwen hebben", "omgaan met verandering", "hulp vragen"] }
```

**`actiekaarten.json`** — array van actiekaart-objecten:
```json
{ "id": "best-1", "rol": "bestuurder", "tekst": "Maak een plan hoe te leren voor de volgende toets en vraag hier feedback op." }
```

Op basis van het bronmateriaal komen er ongeveer 45 actiekaarten verdeeld over de vijf rollen.

**`hulpkaarten.json`** — drie objecten met titel en lijst vragen.

**`reflectie.json`** — één object met de vijf reflectievragen.

**`begeleider.json`** — object met per stap-id een lijst notities/tips:
```json
{ "stap1": ["Zorg dat iedereen een uitdaging in zijn hoofd heeft.", "..."] }
```

## 12. Toegankelijkheid en responsiveness

- Toetsenbord-navigatie volledig ondersteund (Tab, Enter, Esc).
- Heldere focus-states.
- Kleurcontrast minimaal WCAG AA (4.5:1 voor tekst).
- Knoppen minimaal 44×44 px voor touch-bediening op digibord.
- Layout schaalt vloeiend van 1920 px (digibord) tot 768 px (tablet). Onder 768 px bruikbaar maar niet primair geoptimaliseerd in V1.
- Lettergrootte instelbaar via browser-zoom zonder layout-breuk.

## 13. Privacy

- Geen gebruikersaccounts, geen tracking, geen externe analytics.
- Alle data blijft in de browser via `localStorage` of wordt direct als PDF geëxporteerd.
- Geen externe API-calls behalve het laden van de eigen JSON-content.
- De PDF wordt client-side gegenereerd; het bestand verlaat de browser nooit zonder dat de docent op "Download" klikt.

## 14. PDF-export

De PDF bevat:
- Voorblad met "STUURkracht Challenge — Persoonlijk actieplan", datum.
- De ingevulde uitdaging.
- De gekozen rol met de aangevinkte sterkten en ontwikkelpunten.
- De gekozen actie inclusief de drie hulpkaart-formulieren.
- De reflectie (indien ingevuld).
- Logo-rij van de partnerorganisaties als footer.

Layout: A4, schreefloos lettertype, dezelfde rolkleur als accent op het voorblad. Bestandsnaam: `stuurkracht-actieplan-{datum}.pdf`.

## 15. Op te leveren bij V1

- Werkende statische webapplicatie (`index.html` met bijbehorende mappen).
- README met:
  - Hoe lokaal te openen
  - Hoe te hosten als statische site
  - Hoe content (rollen, actiekaarten, notities) aan te passen
- Alle content-JSON's, gevuld op basis van het bronmateriaal.
- Korte handleiding voor docenten (één A4) over hoe de webapp tijdens een les te gebruiken.

## 16. Roadmap V2 en verder

Het V1-ontwerp houdt in zijn datamodel en componentstructuur al rekening met de volgende uitbreidingen, zonder dat ze nu gebouwd worden:

- **Studentvariant**: een tweede modus waarin een student met een sessiecode of QR de challenge zelf doorloopt. Het datamodel is identiek; alleen de UI is licht aangepast.
- **Timer-component**: een herbruikbare timer die op elke stap kan worden ingebouwd.
- **Klasinput via QR/Word Cloud**: voor stap 1, om uitdagingen anoniem op te halen.
- **Multi-sessie geschiedenis**: meerdere sessies bewaren in `localStorage` en kunnen openen.
- **LMS-koppeling**: PDF rechtstreeks doorzetten naar een studieportfolio.

---

*Einde document.*
