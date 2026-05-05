# Changeset 01 — Stap 4b: kaart-gestuurd opbouwen van het actieplan

*Versie 1.0 — Mei 2026*
*Wijzigt het gedrag van stap 4b ("Maak de actie concreet") in de live applicatie. Geen impact op stap 1, 2, 3, 4a, 5 of het sessie-overzicht.*

## 1. Aanleiding en doel

In de huidige implementatie ziet de student bij stap 4b alle 16 invulvelden tegelijk. Dat oogt overweldigend en wijkt af van de oorspronkelijke kaartspel-werkvorm, waarin medestudenten één voor één een passende vraag uit de hulpkaarten pakken om de actie te concretiseren.

We brengen stap 4b daarom dichter bij dat kaartspel-idee: de student bouwt zijn actieplan **stuk voor stuk op**, zelf bepalend welke vragen relevant zijn en in welke volgorde. De applicatie wordt op een digibord (landscape) gebruikt, dus de layout krijgt een vaste linkerkolom voor de kaarten en een ruim hoofdvlak rechts voor de invulvakken.

## 2. Layout (landscape, digibord-georiënteerd)

```
┌─────────────────────────────────────────────────────────────┐
│  Stap 4 — Maak de actie concreet                            │
│  [Actiekaart-blok als referentie]                           │
├──────────────────┬──────────────────────────────────────────┤
│                  │                                          │
│  HULPKAARTEN     │   INVULVAKKEN                            │
│  (linkerkolom)   │   (hoofdvlak)                            │
│                  │                                          │
│  ┌────────────┐  │   ┌────────────────────────────────────┐ │
│  │ [illu]     │  │   │ Wat ga je precies doen?       [×] │ │
│  │ Doelen     │  │   │ [voorgevuld met actiekaart-tekst] │ │
│  └────────────┘  │   └────────────────────────────────────┘ │
│  ┌────────────┐  │                                          │
│  │ [illu]     │  │   (vult zich vanzelf op terwijl de      │
│  │ Concreet   │  │    student vragen kiest uit de kaarten) │
│  └────────────┘  │                                          │
│  ┌────────────┐  │                                          │
│  │ [illu]     │  │                                          │
│  │ Omgeving   │  │                                          │
│  └────────────┘  │                                          │
│                  │                                          │
└──────────────────┴──────────────────────────────────────────┘
       [Vorige stap]                       [Volgende stap]
```

**Kolombreedtes (richtwaarden, vrij aan ontwikkelaar om te verfijnen):**
- Linkerkolom met hulpkaarten: vaste breedte ca. 280–320 px
- Rechterkolom met invulvakken: flex 1 (vult de rest)
- Op viewports kleiner dan 1024 px: kolommen onder elkaar met hulpkaarten als horizontale rij bovenin (fallback voor tablets, niet primair geoptimaliseerd in V1)

## 3. Initiële weergave bij binnenkomst stap 4b

Bij de eerste keer binnenkomen op stap 4b vanaf stap 4a zie je, van boven naar onder:

1. **Actiekaart-blok** — de gekozen actiekaart als referentie, ongewijzigd
2. **Hoofdvlak rechts:** één invulvak met label *"Wat ga je precies doen?"*, **vooraf ingevuld met de tekst van de gekozen actiekaart**, vrij bewerkbaar; gekleurde linker-border in de kleur van de hulpkaart "Concreet"; voorzien van een verwijderkruisje
3. **Linkerkolom:** drie hulpkaarten onder elkaar, voorkant zichtbaar, met:
   - groot een illustratie bovenin (ca. 60% van de kaarthoogte)
   - daaronder de titel
   - daaronder de korte intro
4. **Knoppen onderin** — "Vorige stap" en "Volgende stap" (laatste blijft te allen tijde geactiveerd; geen verplichting)

## 4. Interactie-flow

### Een vraag toevoegen aan het actieplan

1. Gebruiker tikt/klikt op een hulpkaart in de linkerkolom (bv. "Doelen en gewenste opbrengsten")
2. De hulpkaart **vergroot naar het midden van het scherm in een modal-achtige overlay**, met een halftransparante achtergrond achter het scherm
3. In de modal staat de illustratie en titel van de kaart bovenaan, daaronder een lijst van **nog beschikbare vragen** als grote, klikbare knoppen
4. De modal heeft rechtsboven een sluitkruisje en sluit ook bij klikken buiten de modal of op Esc
5. Gebruiker tikt op een vraag
6. De modal sluit met een korte fade-out (ca. 200 ms)
7. De gekozen vraag **verdwijnt uit de hulpkaart** (is in de modal niet meer beschikbaar)
8. **In het hoofdvlak rechts verschijnt onderaan de bestaande invulvakken een nieuw invulvak** met die vraag als label, leeg, klaar om in te vullen. De linker-border van het nieuwe vak heeft de kleur van de hulpkaart waar de vraag uit kwam.
9. De cyclus kan herhaald worden — andere kaart, andere vraag

### Een ingevoegd invulvak verwijderen

1. Elk invulvak heeft rechtsboven een kruisje
2. Klik op kruisje wanneer veld leeg is: **direct verwijderen, geen dialoog**
3. Klik op kruisje wanneer veld ingevuld is: **bevestigingsdialoog** met tekst *"Weet je het zeker? Het ingevulde antwoord wordt verwijderd."* — knoppen "Annuleren" en "Ja, verwijderen"
4. Bij verwijderen: vak verdwijnt, het antwoord wordt **niet bewaard**
5. De vraag wordt **weer beschikbaar** in de bijbehorende hulpkaart (verschijnt in de modal als die opnieuw geopend wordt)

### Wanneer alle vragen van een hulpkaart op zijn

De hulpkaart wordt visueel "uitgegrijsd" (bv. opacity 0.45) en toont onderin een korte tekst zoals *"Alle vragen toegevoegd"*. De kaart blijft klikbaar, maar bij openen toont de modal de tekst *"Alle vragen van deze hulpkaart zijn al toegevoegd. Je kunt vragen verwijderen rechts in de invulvakken om ze opnieuw te gebruiken."* — geen klikbare opties.

## 5. Visuele specificatie

### Kleur per hulpkaart

Voeg deze toe als CSS-tokens in `css/tokens.css`:

```css
--hulpkaart-doelen: #3B6E91;     /* oceaanblauw — horizon, koers */
--hulpkaart-concreet: #D9924C;   /* warm zand-oranje — de boot, uitvoering */
--hulpkaart-omgeving: #5F938B;   /* zeegroen — wind en golven */
```

Deze kleuren worden gebruikt voor:
- De achtergrondkleur van de hulpkaart zelf (volle vlak, witte tekst)
- De **linker-border** (4 px) van een ingevoegd invulvak — koppelt het vak visueel aan de bron-hulpkaart
- Het kleur-accent op de modal-overlay header

### Illustraties op de hulpkaart

Drie nieuwe SVG-bestanden, in de stijl van `illustratie-zeilboot.svg` op de welkomstpagina (lijntekening met lichte fill voor diepte, `currentColor` voor strokes zodat ze witkleurig worden binnen de kaart). ViewBox 240×140.

| Bestand | Inhoud |
| --- | --- |
| `assets/icons/hulpkaart-doelen.svg` | Kompas en zeekaart met route-stippellijn |
| `assets/icons/hulpkaart-concreet.svg` | Drie figuren samen aan boord, met mast en zeil op achtergrond |
| `assets/icons/hulpkaart-omgeving.svg` | Wolk met windstrepen en golvend water |

Deze worden bij dit changeset meegeleverd.

### Hulpkaart-layout (linkerkolom)

```
┌──────────────────────────┐
│                          │
│   [grote illustratie]    │  ← circa 60% van kaarthoogte
│                          │
├──────────────────────────┤
│ Doelen en gewenste       │  ← titel, fontweight 600
│ opbrengsten              │
│                          │
│ Waarom doe je deze actie │  ← intro, kleinere font
│ en wat hoop je ermee...  │
└──────────────────────────┘
```

Padding rond inhoud: 16 px. Border-radius: 12 px (al in tokens). Schaduw: `--schaduw-kaart`. Hover-state: lichte upscale (transform: scale(1.02)) en sterkere schaduw, transition 200 ms. Focus-ring zichtbaar voor toetsenbordnavigatie.

### Modal voor vraagselectie

- Halftransparante backdrop (`rgba(26,31,44,0.55)`)
- Modal-content gecentreerd, max-width ca. 560 px, max-height 80vh, scrollbaar binnenin
- Bovenaan modal: illustratie (kleiner) + titel + sluitkruisje rechtsboven
- Vragen als grote knoppen onder elkaar, hele breedte van modal, padding 14 px verticaal, hover-state met lichte achtergrondkleur
- Animatie: fade-in/scale-in 180 ms bij openen, fade-out bij sluiten
- Sluit op: kruisje, klik buiten modal, Esc-toets

### Invulvak in hoofdvlak

```
┌─[gekleurde border]──────────────────────────┬──┐
│ Waarom ga je deze actie doen?            [×] │  │
│ ┌──────────────────────────────────────────┐ │  │
│ │ [textarea, 3 regels, autosave]           │ │  │
│ └──────────────────────────────────────────┘ │  │
└─────────────────────────────────────────────────┘
```

Linker-border 4 px in de kleur van de bron-hulpkaart. Label boven de textarea. Kruisje rechtsboven. Padding rond inhoud: 12 px. Verticale spacing tussen invulvakken: 12 px.

## 6. Datamodel — wijziging in localStorage

### Oud schema (te vervangen)

```json
"actie": {
  "kaartId": "best-01",
  "kaartTekst": "...",
  "doelen": { "waarom": "", "kenmerk-rol": "", "opbrengst": "", "tevreden": "" },
  "concreet": { "wat": "", "wie": "", "waar": "", "wanneer": "", "hoe": "", "eerste-stap": "" },
  "omgeving": { "gebruiken": "", "in-de-weg": "", "omgang-obstakel": "", "helpers": "", "blokkers": "", "omgang-blokkers": "" }
}
```

### Nieuw schema

```json
"actie": {
  "kaartId": "best-01",
  "kaartTekst": "Maak een plan hoe te leren voor de volgende toets en vraag hier feedback op.",
  "antwoorden": [
    {
      "id": "vak-1",
      "hulpkaart": "concreet",
      "vraagId": "wat",
      "vraag": "Wat ga je precies doen?",
      "antwoord": "Maak een plan hoe te leren voor de volgende toets...",
      "volgorde": 0
    },
    {
      "id": "vak-2",
      "hulpkaart": "doelen",
      "vraagId": "waarom",
      "vraag": "Waarom ga je deze actie doen?",
      "antwoord": "",
      "volgorde": 1
    }
  ]
}
```

**Belangrijke regels:**
- `antwoorden` is een geordende array; `volgorde` bepaalt de UI-volgorde en wordt onderhouden bij toevoegen/verwijderen
- `id` is uniek per ingevoegd invulvak (bv. timestamp of incrementele teller)
- `hulpkaart` is `"doelen"`, `"concreet"` of `"omgeving"` — bepaalt de bordkleur
- `vraagId` koppelt aan de id in `data/hulpkaarten.json`, zodat we kunnen bepalen welke vragen nog beschikbaar zijn
- Het eerste invulvak (de "Wat ga je precies doen?"-vraag) wordt automatisch toegevoegd met de actiekaarttekst als initiële waarde, en gedraagt zich verder als alle anderen — inclusief verwijderen

### Migratie van bestaande sessies

Bij het laden van een sessie: detecteer of `actie` het oude schema heeft (door te kijken of `actie.doelen`/`actie.concreet`/`actie.omgeving` bestaan en `actie.antwoorden` ontbreekt). Als oud schema:

- Maak een migratiefunctie `migreerActieSchema(actie)` die:
  - Een lege `antwoorden`-array initialiseert
  - Voor elk niet-leeg veld in oud schema een entry toevoegt met `id`, `hulpkaart`, `vraagId`, `vraag` (uit `hulpkaarten.json`), `antwoord` en `volgorde`
  - Het oude veld vervangt met het nieuwe schema
  - Direct opslaat in localStorage
- Indien er nog geen ingevuld antwoord is in het oude schema (alle velden leeg): vervang door fris nieuw schema en voeg automatisch het "Wat"-vak toe (zoals bij eerste binnenkomst)

Logging: `console.info('Sessie gemigreerd naar nieuw stap 4b-schema')`.

## 7. Te wijzigen bestanden (verwacht)

- `index.html` — sectie voor stap 4b herzien, modal-element toevoegen
- `css/components.css` — nieuwe stijlen voor hulpkaart in linkerkolom, modal, invulvak met gekleurde border
- `css/layout.css` — twee-kolommen-grid voor stap 4b
- `css/tokens.css` — drie nieuwe kleur-tokens
- `js/steps/stap4b.js` — nieuwe interactie-flow (vervang grotendeels)
- `js/storage.js` — migratiefunctie toevoegen
- `js/state.js` — sessieschema bijwerken
- `data/hulpkaarten.json` — geen wijziging in vragen, wel controleren dat alle `vraagId`'s correct zijn
- `assets/icons/hulpkaart-doelen.svg` — nieuw bestand
- `assets/icons/hulpkaart-concreet.svg` — nieuw bestand
- `assets/icons/hulpkaart-omgeving.svg` — nieuw bestand

## 8. Tests die wijzigen

### Te vervangen

In de bestaande Fase 7-tests vervalt:

- ~~"Drie secties worden gerenderd met juiste titels"~~
- ~~"Aantal velden per sectie matcht JSON-spec (4, 6, 6 textareas)"~~

### Nieuwe tests

| Test | Type | Verwachting |
| --- | --- | --- |
| Bij binnenkomst stap 4b is exact één invulvak zichtbaar | Playwright | 1 textarea-element |
| Het initiële invulvak heeft label "Wat ga je precies doen?" | Playwright | label-tekst correct |
| Het initiële invulvak is voorgevuld met de actiekaarttekst | Playwright | textarea-value matcht `state.actie.kaartTekst` |
| Drie hulpkaarten staan in linkerkolom met juiste kleuren | Playwright | computed background-color matcht tokens |
| Klik op hulpkaart opent modal | Playwright | modal-element zichtbaar, `aria-modal="true"` |
| Modal toont alle nog niet gekozen vragen van die hulpkaart | Playwright | aantal knoppen klopt |
| Klik op vraag in modal: modal sluit, nieuw invulvak verschijnt | Playwright | textareas count + 1, modal verdwenen |
| Gekozen vraag verschijnt niet meer in dezelfde hulpkaart-modal | Playwright | aantal knoppen − 1 bij heropenen |
| Invulvak heeft border-kleur van bron-hulpkaart | Playwright | computed border-left-color matcht token |
| Klik op kruisje bij leeg vak verwijdert direct | Playwright | textarea verdwijnt, geen dialog |
| Klik op kruisje bij ingevuld vak toont bevestigingsdialoog | Playwright | dialog zichtbaar |
| Bevestigde verwijdering haalt vak weg en herstelt vraag in hulpkaart | Playwright | textarea − 1, modal toont vraag terug |
| Hulpkaart wordt uitgegrijsd als alle vragen toegevoegd zijn | Playwright | element heeft `data-uitgeput="true"` of vergelijkbare class |
| State wordt persistent opgeslagen na elke wijziging | Playwright + storage | `localStorage` weerspiegelt UI-state |
| Reload herstelt alle ingevoegde invulvakken in juiste volgorde | Playwright | textareas in zelfde volgorde |
| Migratie van oud schema werkt correct | Vitest | migratiefunctie produceert geldig nieuw schema |
| Modal sluit op Esc-toets | Playwright | modal verdwijnt na Esc |
| Modal is toegankelijk voor schermlezers | axe-core | 0 critical/serious violations |
| WCAG-AA op stap 4b en op geopende modal | axe-core | 0 critical/serious violations |

## 9. Acceptatiecriteria

Het changeset is voltooid wanneer:

- Bij binnenkomst stap 4b is exact één voorgevuld invulvak zichtbaar
- De drie hulpkaarten staan in de linkerkolom met de drie nieuwe illustraties
- De modal-interactie werkt vloeiend (open, kies, sluit, vak verschijnt)
- Vragen verdwijnen uit de hulpkaart na keuze en komen terug bij verwijderen
- Invulvakken hebben kleur-borders die naar de juiste hulpkaart verwijzen
- Bestaande sessies in oud schema worden bij eerste laden netjes gemigreerd
- Alle nieuwe tests groen, alle bestaande tests (buiten de twee vervallen) blijven groen
- WCAG 2.1 AA voldaan op zowel het scherm als de geopende modal
- Visuele review op een 1920×1080 digibord-viewport ziet er overzichtelijk uit

## 10. Wat NIET verandert

- Stap 1, 2, 3, 4a, 5 en het sessie-overzicht blijven ongewijzigd
- Het PDF-export-formaat moet wel het nieuwe schema kunnen lezen, maar mag de inhoud blijven groeperen per hulpkaart in de export (mooier rapport voor het portfolio)
- De data in `hulpkaarten.json` blijft hetzelfde
- De rolkeuze en actiekaart-keuze (4a) werken zoals nu

---

*Einde changeset.*
