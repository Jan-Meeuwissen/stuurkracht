# Changeset 02 — Stap 4b: rol-context met kwaliteiten-modal

*Versie 1.0 — Mei 2026*
*Voortgekomen uit gebruikerstest na oplevering van changeset 01.*
*Wijzigt alleen de header van stap 4b. Geen impact op stap 1, 2, 3, 4a, 5, het sessie-overzicht of de PDF-export.*

## 1. Aanleiding

Tijdens het testen van de nieuwe stap 4b-flow bleek dat studenten de hulpkaart-vraag *"Aan welk kenmerk van de gekozen rol ga je werken?"* (uit de hulpkaart "Doelen en gewenste opbrengsten") niet zinvol kunnen beantwoorden zonder terug te gaan naar stap 3. Ze missen de context: welke rol heb ik gekozen, en welke kwaliteiten had ik daarbij aangevinkt als sterk of als ontwikkelpunt?

We voegen daarom een compact **rol-blok** toe aan de header van stap 4b, dat klikbaar is en een modal opent met de eerder vastgelegde kwaliteiten.

## 2. Layout-aanpassing bovenin stap 4b

De header van stap 4b krijgt een twee-koloms-rij boven de bestaande hulpkaart-kolom en invulvak­vlak.

```
┌─────────────────────────────────────────────────────────────┐
│  Stap 4 — Maak de actie concreet                            │
├──────────────────┬──────────────────────────────────────────┤
│                  │                                          │
│  ROL-BLOK        │  ACTIEKAART-BLOK                         │
│  (compact)       │  (groot, onveranderd)                    │
│                  │                                          │
│  [rol-icoon]  ↗  │  "Maak een plan hoe te leren voor de     │
│  De Bestuurder   │   volgende toets en vraag hier feedback  │
│  Bekijk je       │   op."                                   │
│  kwaliteiten     │                                          │
│                  │                                          │
└──────────────────┴──────────────────────────────────────────┘
                            │
                            ▼ (rest van stap 4b ongewijzigd)
┌──────────────────┬──────────────────────────────────────────┐
│  HULPKAARTEN     │   INVULVAKKEN                            │
│  ...             │   ...                                    │
```

**Verhoudingen (richtwaarden, vrij aan ontwikkelaar):**
- Rol-blok: vaste breedte ca. 280–320 px (mag visueel uitgelijnd zijn met de hulpkaart-kolom eronder)
- Actiekaart-blok: flex 1
- Spacing tussen de twee blokken: 24 px
- Spacing onder deze rij voor de hulpkaart/invulvak-rij: 32 px

## 3. Visuele specificatie rol-blok

```
┌──────────────────────────────┐
│                              │
│  [rol-icoon, groot]          │
│                              │
│  De Bestuurder            ↗  │
│  Bekijk je kwaliteiten       │
│                              │
└──────────────────────────────┘
```

- **Achtergrondkleur:** de rolkleur uit `tokens.css` (`--rol-bestuurder`, `--rol-denker`, etc.) — pakt automatisch de juiste kleur op basis van `state.gekozenRol`
- **Tekst- en icoonkleur:** dezelfde "donker"-variant die op de rolkaarten van stap 2 en 3 wordt gebruikt voor goed contrast (vergelijk de bestaande implementatie). Ter referentie de eerder gedefinieerde donkere varianten uit `rollen.json`:
  - bestuurder: `#C9846F`
  - denker: `#C68E5E`
  - ondernemer: `#B89248`
  - uitzoeker: `#5F938B`
  - verbinder: `#7C9BB5`
- **Rol-icoon** (uit `assets/icons/icoon-{rol}.svg`): groot bovenaan, ca. 64×64 px
- **Rolnaam:** als heading, fontweight 600
- **Sublabel:** *"Bekijk je kwaliteiten"* in kleinere font, met een chevron-icoon (↗ of pijl naar rechtsboven) ernaast als affordance dat het klikbaar is
- **Border-radius, padding, schaduw:** identiek aan de hulpkaarten in de linkerkolom voor visuele consistentie
- **Hover-state:** lichte upscale (`transform: scale(1.02)`) en sterkere schaduw, transition 200 ms
- **Focus-ring:** zichtbaar voor toetsenbordnavigatie
- **`role="button"` en `aria-label="Bekijk de kwaliteiten van rol {rolnaam}"`** voor toegankelijkheid

## 4. Modal-gedrag

Hergebruik het modal-systeem dat bij changeset 01 is geïntroduceerd voor de hulpkaarten — consistent voor de gebruiker.

### Modal-inhoud bij volledig ingevulde stap 3

```
┌────────────────────────────────────────────┐
│                                       [×]  │
│        [grote rol-icoon]                   │
│        De Bestuurder                       │
│  ────────────────────────────────────────  │
│                                            │
│   Sterk in                                 │
│     ✓ doelen stellen                       │
│     ✓ plannen                              │
│                                            │
│   Wil ontwikkelen                          │
│     ↑ jezelf motiveren                     │
│     ↑ hulp vragen                          │
│                                            │
└────────────────────────────────────────────┘
```

- Titel: rolnaam, met groot rol-icoon erboven of ernaast (ontwerper­keuze)
- Twee secties onder elkaar: **"Sterk in"** met ✓-iconen en **"Wil ontwikkelen"** met ↑-iconen — gebruik exact dezelfde iconen die op stap 3 ook gebruikt worden
- Een sectie wordt **niet getoond** als er geen kwaliteiten in vallen (dus als "Sterk in" leeg is, hele kop weglaten)
- Volgorde van kwaliteiten binnen een sectie: zoals ze in `rollen.json` staan (de canonieke volgorde)

### Modal-inhoud bij niet of half ingevulde stap 3

Wanneer **noch** "Sterk in" **noch** "Wil ontwikkelen" enige kwaliteit bevat, toont de modal alle zes kwaliteiten van de rol als platte referentielijst, zonder vinkjes:

```
┌────────────────────────────────────────────┐
│                                       [×]  │
│        [grote rol-icoon]                   │
│        De Bestuurder                       │
│  ────────────────────────────────────────  │
│                                            │
│   Kwaliteiten van deze rol                 │
│     • doelen stellen                       │
│     • jezelf motiveren                     │
│     • plannen                              │
│     • zelfvertrouwen hebben                │
│     • omgaan met verandering               │
│     • hulp vragen                          │
│                                            │
└────────────────────────────────────────────┘
```

Bij **half** ingevuld (een van beide secties bevat iets, de andere niet) worden alleen de gevulde sectie(s) getoond, volgens het gedrag van de eerste variant.

### Geen "Ga naar stap 3"-knop

Bewust geen navigatieknop in de modal. De voortgangsbalk bovenin het scherm blijft de standaardmanier om naar een andere stap te gaan.

### Sluitgedrag

- Klik op het kruisje rechtsboven
- Klik op de halftransparante backdrop buiten de modal
- Druk op Esc
(identiek aan de hulpkaart-modal)

## 5. Datamodel

**Geen wijziging.** De benodigde data zit al in `state.gekozenRol` en `state.zelfreflectie[rol]` (uit stap 3). De rol-info wordt **niet** in de PDF-export herhaald — die bevat de zelfreflectie al.

## 6. Te wijzigen bestanden (verwacht)

- `index.html` — header van stap 4b uitbreiden met het rol-blok-element
- `css/components.css` — stijlen voor het rol-blok (kan grotendeels hergebruik zijn van de hulpkaart-stijl met andere kleur-binding) en kleine aanvulling voor de "kwaliteiten-modal" wanneer dat een andere visuele structuur heeft dan de vragen-modal
- `css/layout.css` — twee-koloms-rij toevoegen aan de stap 4b-header
- `js/steps/stap4b.js` — render-logica voor het rol-blok, click-handler die de modal opent met de juiste content op basis van `state.zelfreflectie[state.gekozenRol]`
- Geen nieuwe assets nodig — de bestaande `assets/icons/icoon-{rol}.svg` en de ✓/↑-iconen van stap 3 worden hergebruikt

## 7. Tests

| Test | Type | Verwachting |
| --- | --- | --- |
| Rol-blok is zichtbaar bovenaan stap 4b | Playwright | element met juiste data-testid bestaat |
| Rol-blok toont icoon en naam van `state.gekozenRol` | Playwright | rolnaam-tekst klopt, icoon-bestand klopt |
| Rol-blok heeft achtergrondkleur die overeenkomt met `--rol-{gekozenRol}` | Playwright | computed background-color matcht token |
| Klik op rol-blok opent modal | Playwright | modal-element zichtbaar, `aria-modal="true"` |
| Modal toont sectie "Sterk in" met de aangevinkte kwaliteiten | Playwright | aantal items klopt, teksten kloppen |
| Modal toont sectie "Wil ontwikkelen" met de aangevinkte kwaliteiten | Playwright | aantal items klopt, teksten kloppen |
| Modal toont alleen gevulde secties (lege sectie verbergt zich) | Playwright | bij volledig sterk en geen ontwikkel: alleen "Sterk in" zichtbaar |
| Modal toont fallback-lijst bij volledig lege zelfreflectie | Playwright | 6 kwaliteiten zonder vinkjes, kop "Kwaliteiten van deze rol" |
| Volgorde van kwaliteiten in modal volgt `rollen.json` | Playwright | volgorde-check |
| Modal sluit op kruisje, op backdrop-klik en op Esc | Playwright | drie scenario's allen sluiten modal |
| Rol-blok is bedienbaar met toetsenbord (Tab → Enter) | Playwright | scenario zonder muisklik werkt |
| WCAG-AA op stap 4b inclusief geopende kwaliteiten-modal | axe-core | 0 critical/serious violations |
| Geen wijziging in PDF-export | Vitest of visueel | sjabloon ongewijzigd |

## 8. Acceptatiecriteria

- Het rol-blok is zichtbaar bovenaan stap 4b, met rolkleur, icoon, naam en "Bekijk je kwaliteiten"-affordance
- De kwaliteiten-modal opent vloeiend en toont de juiste informatie afhankelijk van de inhoud van `state.zelfreflectie`
- Bij lege zelfreflectie wordt de fallback-lijst van 6 kwaliteiten getoond
- Geen "Ga naar stap 3"-knop in de modal
- Geen wijziging aan het datamodel of de PDF-export
- Alle nieuwe tests groen, alle bestaande tests blijven groen
- Toegankelijk via toetsenbord en voor schermlezers

## 9. Wat NIET verandert

- De rest van stap 4b (hulpkaarten-kolom, invulvakken, modal voor vraag­selectie) blijft ongewijzigd
- Stap 1, 2, 3, 4a, 5 en het sessie-overzicht blijven ongewijzigd
- De PDF-export blijft ongewijzigd — de zelfreflectie staat daar al in
- De data in `rollen.json` en het sessieschema blijven hetzelfde

---

*Einde changeset.*
