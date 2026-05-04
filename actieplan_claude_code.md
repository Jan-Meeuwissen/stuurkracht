# Actieplan voor Claude Code — STUURkracht Challenge Webapp v1

*Versie 1.0 — Mei 2026*
*Gebaseerd op het functioneel ontwerp v1.0.*

Dit document is bedoeld als directe werkinstructie voor Claude Code. Hij bouwt de applicatie in **elf fasen**. Na elke fase draait een vaste set automatische tests; pas als alle tests groen zijn gaat Claude Code door naar de volgende fase.

---

## 1. Tech stack en testaanpak

**Productiecode**
- Vanilla HTML, CSS en JavaScript (ES modules)
- Geen build-stap, geen frameworks
- `html2pdf.js` voor PDF-export (via npm of local-vendored)
- `localStorage` voor sessieopslag

**Teststack**

| Doel | Tool |
| --- | --- |
| Unit tests van JS-modules (storage, data, helpers) | **Vitest** met `jsdom` |
| End-to-end tests in echte browser (volledige userflow) | **Playwright** (Chromium) |
| Toegankelijkheidstests | **@axe-core/playwright** geïntegreerd in de E2E suite |
| HTML-validatie | **html-validate** (CLI) |

**Werkwijze per fase voor Claude Code:**

1. Lees de fase-omschrijving en acceptatiecriteria volledig door
2. Implementeer de productiecode
3. Schrijf de bijbehorende tests
4. Voer **alle tests** uit (zowel die van deze fase als alle eerdere)
5. Pas alleen na 100% groene tests: commit met de message `Fase X: <titel> — alle tests groen`
6. Ga door naar de volgende fase

Als een test rood is: **niet doorgaan**, eerst herstellen of de testverwachting bijstellen met onderbouwing.

---

## 2. Assets die Claude Code nodig heeft

Verzamel deze in een `_brondocumenten/` map (buiten de uiteindelijke app), zodat Claude Code er gericht uit kan putten.

### 2.1 Functionele input (verplicht)

- **`functioneel_ontwerp_stuurkracht_v1.md`** — het volledige ontwerp, leidend bij elke beslissing
- **`stuurkracht-content.json`** — voorgestructureerde content op basis van het PDF-kaartenmateriaal (zie hieronder; lever ik mee als bijlage)
- **`begeleider-notities.json`** — didactische notities per stap, gebaseerd op de PowerPoint
- **Origineel kaartenmateriaal-PDF** als referentie bij twijfel over teksten
- **Originele PowerPoint** als referentie voor begeleidersnotities

### 2.2 Visuele assets (te leveren of door Claude Code te genereren)

- **Kompas-icoon** als SVG (voor de voortgangsbalk en navigatie)
- **Roer-icoon** als SVG (voor actiekaarten)
- **Zeil-icoon** als SVG (voor kwaliteiten)
- **Zeilboot-illustratie** als SVG voor de welkomstpagina (eenvoudige lijntekening, in stijl van de slidedeck)
- **Vijf rol-iconen** als SVG (Bestuurder, Denker, Ondernemer, Uitzoeker, Verbinder) — abstract en uniform van stijl, niet figuratief

> **Aanwijzing:** Claude Code mag deze SVG's zelf genereren in een consistente, minimalistische lijnstijl. Vermijd door AI gegenereerde rasterafbeeldingen; alles is vector.

### 2.3 Branding (placeholder in V1)

- Logo-strip van de zes partnerorganisaties (HAN, NRO, De Haagse Hogeschool, Noorderpoort, RijnIJssel, ROC Nijmegen) — bij oplevering toe te voegen als PNG of SVG; in V1 kunnen tekstuele placeholders worden gebruikt

### 2.4 Designtokens (in `css/tokens.css` te zetten)

| Token | Waarde |
| --- | --- |
| `--kleur-primair` | `#1E3A5F` (marineblauw) |
| `--kleur-secundair` | `#3B6E91` (oceaanblauw) |
| `--kleur-accent` | `#E8B85F` (zandgeel) |
| `--kleur-achtergrond` | `#FAFAF7` (off-white) |
| `--kleur-tekst` | `#1A1F2C` (dieptegrijs) |
| `--rol-bestuurder` | `#F4B5A8` (zalm-roze) |
| `--rol-denker` | `#F2C49B` (oranje-perzik) |
| `--rol-ondernemer` | `#E8C572` (zandgeel) |
| `--rol-uitzoeker` | `#9DC9C2` (turquoise) |
| `--rol-verbinder` | `#B8CFE0` (lichtblauw) |
| `--font-basis` | `'Inter', system-ui, sans-serif` |
| `--radius-kaart` | `12px` |
| `--schaduw-kaart` | `0 2px 8px rgba(26,31,44,0.08)` |

---

## 3. Fasering

### Fase 0 — Project setup en testinfrastructuur

**Te bouwen:**
- Initialiseer Git-repo, schrijf `.gitignore`
- `package.json` met scripts: `test`, `test:e2e`, `test:a11y`, `validate:html`
- Installeer dev-dependencies: `vitest`, `jsdom`, `@playwright/test`, `@axe-core/playwright`, `html-validate`
- Mappenstructuur conform sectie 5 van het functioneel ontwerp
- Lege `index.html` met `<head>` (titel, viewport, charset) en lege `<main>`
- `css/tokens.css`, `css/base.css` (reset + body-styling)
- README skeleton met installatie-instructies
- Playwright-config met baseURL `http://localhost:8080`, één browser (Chromium)
- Eenvoudige local server: `npx http-server -p 8080` of `python3 -m http.server 8080` als devscript

**Tests fase 0:**

| Test | Type | Verwachting |
| --- | --- | --- |
| `index.html` valideert volgens HTML5 | html-validate | 0 errors |
| `index.html` laadt zonder console-errors | Playwright | `expect(consoleErrors).toHaveLength(0)` |
| CSS-tokens zijn allemaal aanwezig | Vitest (parse CSS) | alle 12 tokens uit sectie 2.4 |
| `npm test` draait zonder fouten | CI | exit code 0 |

**Acceptatiecriterium:** lege site opent in browser, geen errors, testpipeline werkt.

---

### Fase 1 — Datalaag en opslaglaag

**Te bouwen:**
- `data/rollen.json`, `data/actiekaarten.json`, `data/hulpkaarten.json`, `data/reflectie.json`, `data/begeleider.json` — gevuld met alle content uit het kaartenmateriaal
- `js/data.js` — module met `laadAlleContent()` die Promise teruggeeft van alle JSON
- `js/storage.js` — module met `bewaarSessie(state)`, `laadSessie()`, `wisSessie()`, `nieuweSessie()`, met JSON-validatie van het schema
- Sessie-schema in `js/state.js` als één plek met de canonieke datastructuur en defaults

**Tests fase 1:**

| Test | Type | Verwachting |
| --- | --- | --- |
| Alle JSON-bestanden valideren als geldige JSON | Vitest | parsed zonder error |
| `rollen.json` bevat exact 5 rollen, elk met 6 kwaliteiten | Vitest | structuur klopt |
| `actiekaarten.json` bevat alle kaarten, gekoppeld aan een geldige rol-id | Vitest | elke `rol`-waarde komt voor in rollen.json |
| `hulpkaarten.json` bevat exact 3 kaarten met titel en vragen-array | Vitest | structuur klopt |
| `reflectie.json` bevat exact 5 vragen | Vitest | structuur klopt |
| `storage.bewaarSessie()` schrijft naar localStorage | Vitest met jsdom | `localStorage.getItem('stuurkracht.sessie.huidig')` is gevuld |
| `storage.laadSessie()` retourneert opgeslagen object | Vitest | object identiek na bewaren+laden |
| `storage.wisSessie()` verwijdert sessie | Vitest | `laadSessie()` retourneert default state |
| `storage` faalt netjes bij corrupte JSON in localStorage | Vitest | retourneert default state, logt waarschuwing |

**Acceptatiecriterium:** content is geladen en valide, opslaglaag werkt voorspelbaar.

---

### Fase 2 — Layoutshell en navigatie

**Te bouwen:**
- Voortgangsbalk bovenin met vijf klikbare stappen, kompas-icoon als positie­indicator
- Mainvlak waarin secties getoond/verborgen worden via een `data-active-step` attribuut op `<main>`
- Onderbalk met "Vorige" en "Volgende" knoppen
- Begeleiderspaneel rechts (op desktop) — collapsible, met toggle-knop "Verbergen tijdens presentatie"
- `js/app.js` — entry-point dat content laadt, sessie laadt, en de navigatie aansluit
- `js/router.js` — eenvoudige hash-router (`#/stap/1`, `#/stap/2`, ...) die secties toont en URL-state synchroniseert
- Welkomstscherm met uitleg metafoor en "Start sessie" knop

**Tests fase 2:**

| Test | Type | Verwachting |
| --- | --- | --- |
| Welkomstscherm toont bij eerste bezoek | Playwright | `getByRole('heading', { name: /STUURkracht/i })` zichtbaar |
| "Start sessie" navigeert naar stap 1 | Playwright | URL bevat `#/stap/1`, hoofding "Wat is jouw uitdaging?" zichtbaar |
| Voortgangsbalk-knop springt naar juiste stap | Playwright | klik op stap 3 → URL en zichtbaar scherm wijzigen |
| "Volgende" en "Vorige" werken in cyclus 1→2→3→4→5 | Playwright | DOM toont juiste sectie |
| Begeleiderspaneel toggle verbergt en toont paneel | Playwright | `aria-hidden` toggle correct |
| Voortgangsbalk verbergt zich tijdens "presentatie­modus" | Playwright | klassen wijzigen |
| Geen WCAG-AA-violations op welkomstscherm en stap 1 | axe-core | 0 critical/serious violations |

**Acceptatiecriterium:** lege schermen voor alle stappen zijn er, navigatie werkt, paneel werkt.

---

### Fase 3 — Stap 1: Wat is jouw uitdaging?

**Te bouwen:**
- Vraag bovenaan, groot meerregelig tekstveld
- Rij klikbare voorbeeldscenario's als chips (uit `data/voorbeelden-uitdagingen.json`, te leveren)
- Aanklikken voegt scenario als nieuwe regel toe aan tekstveld
- Bij elke wijziging: debounced opslaan in `localStorage` via `storage.bewaarSessie()`

**Tests fase 3:**

| Test | Type | Verwachting |
| --- | --- | --- |
| Tekstveld accepteert input en bewaart na 500 ms | Playwright | `localStorage` bevat de getypte tekst |
| Klik op voorbeeldchip voegt tekst toe aan veld | Playwright | tekst zichtbaar in textarea |
| Reload van pagina behoudt eerder ingevulde uitdaging | Playwright | tekst nog aanwezig |
| Bij lege uitdaging is "Volgende" niet uitgeschakeld (gebruiker mag overslaan) | Playwright | knop is `enabled` |

**Acceptatiecriterium:** stap 1 is volledig functioneel, persistentie werkt.

---

### Fase 4 — Stap 2: Rolkaarten en kwaliteiten

**Te bouwen:**
- Vijf rolkaarten in een grid (responsief: 5 in een rij op desktop, 2-3 op tablet)
- Elke kaart: rolnaam, kleur, icoon, korte tagline
- Klik draait kaart om met flip-animatie en toont de zes kwaliteiten
- Tweede klik draait terug

**Tests fase 4:**

| Test | Type | Verwachting |
| --- | --- | --- |
| Vijf rolkaarten worden gerenderd | Playwright | `getByTestId('rolkaart')` count = 5 |
| Klik op kaart toggelt `data-flipped="true"` | Playwright | attribuut wisselt |
| Na flip zijn de zes kwaliteiten van die rol leesbaar | Playwright | tekst zichtbaar |
| Kaartkleuren komen overeen met designtokens | Vitest (parse computed styles) | `--rol-bestuurder` etc. correct toegepast |
| WCAG-AA op stap 2 | axe-core | 0 critical/serious violations |

**Acceptatiecriterium:** stap 2 toont de rollen interactief, animaties werken vloeiend.

---

### Fase 5 — Stap 3: Zelfreflectie

**Te bouwen:**
- Vijf rolkaarten met kwaliteiten meteen zichtbaar (geen flip)
- Per kwaliteit twee kleine knoppen ✓ "Sterk in" en ↑ "Wil ontwikkelen"; toggle-gedrag, mutually exclusive
- Onderaan keuze: *"Welke rol wil je inzetten voor jouw uitdaging?"* — vijf radiobuttons
- Alle keuzes opslaan in `state.zelfreflectie` en `state.gekozenRol`

**Tests fase 5:**

| Test | Type | Verwachting |
| --- | --- | --- |
| Klikken op "Sterk in" voegt kwaliteit toe aan `state.zelfreflectie[rol].sterk` | Playwright + storage assertion | array bevat de kwaliteit |
| Klikken op "Wil ontwikkelen" verplaatst kwaliteit naar `ontwikkelen` | Playwright + storage assertion | kwaliteit niet meer in `sterk`, wel in `ontwikkelen` |
| Een rol kiezen bewaart `gekozenRol` | Playwright + storage assertion | waarde correct |
| Reload behoudt alle aanvinkingen | Playwright | UI-state correct hersteld |
| Zonder rolkeuze waarschuwt UI bij doorgaan naar stap 4 | Playwright | banner zichtbaar |

**Acceptatiecriterium:** zelfreflectie en rolkeuze worden volledig gepersisteerd.

---

### Fase 6 — Stap 4a: Actiekaart kiezen

**Te bouwen:**
- Filter `actiekaarten.json` op `state.gekozenRol`
- Render gefilterde kaarten als grid (op desktop 3 kolommen) of carrousel (op tablet)
- Selectie van een kaart: klik markeert kaart en navigeert na 300 ms naar stap 4b
- Knop "Andere rol kiezen" terug naar stap 3

**Tests fase 6:**

| Test | Type | Verwachting |
| --- | --- | --- |
| Aantal getoonde kaarten matcht het aantal in JSON voor de gekozen rol | Playwright | count gelijk aan filtered length |
| Geen kaarten van andere rollen zichtbaar | Playwright | alleen kaarten met juiste `data-rol` |
| Klik op kaart bewaart `state.actie.kaartId` en `kaartTekst` | Playwright + storage | beide correct |
| Klik op kaart navigeert naar stap 4b binnen 1 s | Playwright | URL `#/stap/4b` |

**Acceptatiecriterium:** actiekaart-keuze werkt correct gefilterd en wordt persistent.

---

### Fase 7 — Stap 4b: Actie concreet maken

**Te bouwen:**
- Bovenaan de gekozen actiekaart als referentie­blok
- Drie hulpkaarten als opeenvolgende formuliersecties:
  1. Doelen en gewenste opbrengsten (4 vragen)
  2. Actie concreet maken (6 vragen)
  3. Invloed van omgevingsfactoren (6 vragen)
- Elk veld een `<textarea>` met label, debounced autosave
- Vraagstellingen exact uit `data/hulpkaarten.json`

**Tests fase 7:**

| Test | Type | Verwachting |
| --- | --- | --- |
| Drie secties worden gerenderd met juiste titels | Playwright | "Doelen", "Actie concreet", "Omgeving" zichtbaar |
| Aantal velden per sectie matcht JSON-spec | Playwright | 4, 6, 6 textareas |
| Invoer in elk veld wordt opgeslagen na 500 ms | Playwright + storage | alle velden in `state.actie` correct |
| Reload behoudt alle ingevulde antwoorden | Playwright | textarea-values correct hersteld |
| WCAG-AA: alle inputs hebben labels | axe-core | 0 violations rond labelling |

**Acceptatiecriterium:** actie kan volledig geconcretiseerd en gepersisteerd worden.

---

### Fase 8 — Stap 5: Reflectie

**Te bouwen:**
- Bovenaan: het actieblok uit stap 4 als referentie (kaarttekst + doelen)
- Vijf reflectievragen uit `reflectie.json` als textareas
- Knop "Vervolgactie kiezen" — bewaart huidige reflectie als afgeronde actie en navigeert naar stap 4 voor nieuwe ronde
- Knop "Sessie afronden" — gaat naar overzicht

**Tests fase 8:**

| Test | Type | Verwachting |
| --- | --- | --- |
| Vijf reflectievragen worden gerenderd | Playwright | 5 textareas |
| Gekozen actie staat zichtbaar bovenaan | Playwright | actietekst leesbaar |
| Reflectie wordt gepersisteerd | Playwright + storage | `state.reflectie` gevuld |
| "Sessie afronden" navigeert naar overzicht | Playwright | URL `#/overzicht` |

**Acceptatiecriterium:** reflectie kan worden ingevuld en de sessie afgerond.

---

### Fase 9 — Overzicht en PDF-export

**Te bouwen:**
- Overzichtspagina met alle ingevulde data, gegroepeerd per stap
- Knop "Download als PDF" — genereert via `html2pdf.js` een nette A4-PDF
- Knop "Nieuwe sessie starten" — toont bevestigingsdialoog, dan `storage.nieuweSessie()`
- Knop "Doorgaan met deze sessie" — navigeert naar laatst bezochte stap
- PDF-template (verborgen DOM-element met print-styling) volgens sectie 14 van het ontwerp

**Tests fase 9:**

| Test | Type | Verwachting |
| --- | --- | --- |
| Overzicht toont uitdaging, rol, actie, hulpkaartantwoorden, reflectie | Playwright | alle velden zichtbaar |
| "Download als PDF" triggert downloadgebeurtenis | Playwright | `page.waitForEvent('download')` resolved |
| Gedownloade PDF heeft `.pdf` extensie en bestandsnaam­patroon `stuurkracht-actieplan-*.pdf` | Playwright | filename match |
| "Nieuwe sessie starten" toont bevestigings­dialoog | Playwright | dialoog zichtbaar |
| Bevestigde reset wist localStorage | Playwright + storage | `storage.laadSessie()` retourneert default |

**Acceptatiecriterium:** overzicht is correct, PDF wordt gedownload, reset werkt veilig.

---

### Fase 10 — Polish, toegankelijkheid en responsiveness

**Te bouwen:**
- Volledige axe-core scan op alle stappen, los alle critical/serious violations op
- Responsive breakpoints: 1920 px (digibord), 1280 px (laptop), 1024 px (tablet liggend), 768 px (tablet staand)
- Focus-states verfijnen: zichtbare ring, voldoende contrast
- Toetsenbordnavigatie volledig: Tab door alle interactieve elementen, Enter/Space om te activeren, Esc sluit dialogen en paneel
- Hover- en transition-states voor knoppen en kaarten
- Verfijn copy: kleine teksten controleren, microcopy in dialogen (knoppen, foutmeldingen, lege states)

**Tests fase 10:**

| Test | Type | Verwachting |
| --- | --- | --- |
| axe-core op alle 7 schermen (start, stap 1-5, overzicht) | Playwright + axe-core | 0 critical, 0 serious violations |
| Volledige flow doorloopbaar met alleen toetsenbord | Playwright | scenario zonder muisklikken werkt |
| Responsive test: viewport 1920×1080 en 768×1024 | Playwright | geen overflow, leesbare lay-out |
| Focus-ring zichtbaar op alle interactieve elementen | Playwright + visual snapshot | focus zichtbaar |

**Acceptatiecriterium:** app voldoet aan WCAG 2.1 AA en werkt op de gespecificeerde viewports.

---

### Fase 11 — Documentatie en oplevering

**Te bouwen:**
- `README.md`: installatie, lokaal openen, hosten, content aanpassen, FAQ
- `docent-handleiding.md` (één A4): hoe een sessie te starten, navigeren, en de PDF op te slaan
- Inline JSDoc-commentaar bij `app.js`, `storage.js`, `data.js`, `pdf.js`
- Volledige test-run als laatste check
- Versie taggen in Git: `v1.0.0`

**Tests fase 11:**

| Test | Type | Verwachting |
| --- | --- | --- |
| Volledige test-suite (Vitest + Playwright + axe-core) groen | CI | 0 failures |
| `npm run validate:html` op gebouwde applicatie | html-validate | 0 errors |
| README laadt en bevat secties: Installatie, Gebruik, Aanpassen content, Deployment | manueel/grep | aanwezig |

**Acceptatiecriterium:** v1 is opleveringsklaar.

---

## 4. Definition of Done — totale applicatie

De applicatie is klaar voor v1-oplevering wanneer:

- Alle elf fasen afgerond en gecommit
- Volledige test-suite groen (Vitest + Playwright + axe-core + html-validate)
- Werkt op Chromium, Firefox en Safari (laatste twee handmatig gecontroleerd)
- Werkt op viewport 1920×1080 (digibord) en 768×1024 (tablet)
- Geen externe API-calls (verifieerbaar in network tab)
- Geen console-errors of -warnings tijdens een complete sessie
- README en docent-handleiding aanwezig en accuraat
- Versie `v1.0.0` getagd in Git

---

## 5. Bijlagen die ik nog kan leveren als losse bestanden

Op verzoek lever ik direct aanpasklare versies van:

- **`stuurkracht-content.json`** — alle rollen, kwaliteiten, actiekaarten, hulpkaarten en reflectievragen, geëxtraheerd uit het kaartenmateriaal
- **`begeleider-notities.json`** — didactische notities per stap, op basis van de PowerPoint
- **`voorbeelden-uitdagingen.json`** — een initiële set chips voor stap 1
- **SVG-iconen** voor kompas, roer, zeil en de vijf rollen, in consistente lijnstijl

Dit voorkomt dat Claude Code zelf het PDF-materiaal hoeft te parsen en de kans op fouten verkleint.

---

*Einde actieplan.*
