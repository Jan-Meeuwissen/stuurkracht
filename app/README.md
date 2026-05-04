# STUURkracht Challenge — Webapp v1

Digitale webapp voor de STUURkracht Challenge: een methodiek waarmee studenten leren regie nemen op uitdagende momenten in hun opleiding.

## Installatie en lokaal openen

**Vereisten:** Python 3 (voor de lokale server) en Node.js (voor tests).

```bash
cd app/
npm install          # installeer dev-dependencies en test-tools
npm run dev          # start lokale server op http://localhost:8080
```

Open daarna http://localhost:8080 in Chrome, Edge, Firefox of Safari.

De app werkt ook zonder server: open `index.html` direct in een browser. Let op: browsers blokkeren dan soms JSON-fetches (`file://`-protocol). Gebruik bij voorkeur de lokale server.

## Hosten als statische site

De map `app/` bevat alles wat nodig is. Upload de volledige inhoud naar een willekeurige statische hostingdienst:

- **HAN/ROC-webserver:** kopieer de map naar de gewenste locatie.
- **USB-gebruik:** open `index.html` rechtstreeks in een browser (zie opmerking hierboven).
- **GitHub Pages, Netlify, Vercel:** verbind de repository en wijs de `app/`-map aan als rootmap.

Geen buildstap, geen server-side logica, geen externe afhankelijkheden nodig.

## Content aanpassen

Alle inhoud staat in JSON-bestanden in `app/data/`. Een teksteditor is voldoende.

| Bestand | Wat staat erin |
|---------|---------------|
| `rollen.json` | Vijf stuurkrachtrollen met kwaliteiten, taglines en kleuren |
| `actiekaarten.json` | Alle actiekaarten, gekoppeld aan een rol-id |
| `hulpkaarten.json` | Drie hulpkaarten met vragen voor stap 4b |
| `reflectie.json` | Vijf reflectievragen voor stap 5 |
| `begeleider.json` | Didactische notities per stap voor het begeleiderspaneel |
| `voorbeelden-uitdagingen.json` | Voorbeeld-chips voor stap 1 |

Na een wijziging: sla op en ververs de browser.

## Testen

```bash
npm run test           # Vitest unit tests (data, storage, CSS-tokens)
npm run validate:html  # HTML5-validatie van index.html
npm run test:e2e       # Playwright E2E + axe-core toegankelijkheidstests
npm run test:all       # alles in één keer
```

Voor de E2E-tests moet de lokale server draaien (`npm run dev`), of de Playwright-config start er automatisch één.

## Deployment checklist

- [ ] `node_modules/html2pdf.js/dist/html2pdf.bundle.min.js` aanwezig
- [ ] Alle bestanden in `app/data/` aanwezig
- [ ] Alle SVG-iconen in `app/assets/icons/` en `app/assets/images/` aanwezig
- [ ] `npm run test:all` groen

## FAQ

**Worden er gegevens naar de server gestuurd?**
Nee. Alle data blijft in de browser (`localStorage`). De PDF wordt lokaal gegenereerd.

**Werkt het op een digibord?**
Ja, de app is geoptimaliseerd voor 1920×1080 (digibord) en 768×1024 (tablet).

**Kan ik meerdere sessies opslaan?**
V1 slaat één sessie op. Download een PDF voor archivering; begin daarna een nieuwe sessie.

**Welke browsers worden ondersteund?**
Moderne browsers: Chrome, Edge, Firefox, Safari (afgelopen drie jaar).
