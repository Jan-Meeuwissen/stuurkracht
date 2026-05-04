# Docenthandleiding — STUURkracht Challenge Webapp

## Voorbereiding (5 minuten)

1. Open een browser op het digibord en ga naar de webapp.
2. Controleer of het scherm goed zichtbaar is voor de klas.
3. Klik op **Presentatiemodus** (onderbalk) om de voortgangsbalk en het begeleiderspaneel te verbergen. Klik nogmaals om ze terug te tonen.

## Sessie starten

Klik **Start sessie** op het welkomstscherm. De app opent stap 1.

## Navigeren

- Gebruik **Volgende →** en **← Vorige** in de onderbalk.
- Klik op een stap in de voortgangsbalk bovenin om er direct naartoe te springen.
- De sessie wordt automatisch opgeslagen in de browser.

## Per stap

| Stap | Wat doet de docent |
|------|--------------------|
| **1 – Uitdaging** | Verzamel uitdagingen klassikaal; typ ze in het grote tekstveld. Klik een chip om een voorbeeld toe te voegen. |
| **2 – Kwaliteiten** | Klik de rolkaarten open om kwaliteiten te tonen; bespreek welke passen bij de uitdaging. |
| **3 – Zelfreflectie** | Laat studenten aanvinken wat ze al sterk in zijn (✓) en wat ze willen ontwikkelen (↑). Kies daarna een rol voor de actie. |
| **4a – Actiekaart** | Kies een actiekaart die past bij de gekozen rol. De app filtert automatisch. |
| **4b – Actie concreet** | Beantwoord de vragen van de drie hulpkaarten. Lees de gekozen actiekaart hardop voor. |
| **5 – Reflectie** | Beantwoord de vijf reflectievragen na uitvoering van de actie (eventueel weken later). |

## Begeleiderspaneel

Het paneel rechts toont per stap instructies en tips uit de didactische handleiding. Klik **×** om het te verbergen tijdens projectie; gebruik de zijbalk-knop om het terug te halen.

## Sessie afronden

1. Klik na stap 5 op **Sessie afronden** (of navigeer via de balk naar **Overzicht**).
2. Klik **Download als PDF** voor een persoonlijk actieplan als PDF (A4).
3. Voor een nieuwe klas: klik **Nieuwe sessie starten** en bevestig. Dit wist alle ingevulde data.

## Vervolgsessie (stap 5 later)

Sluit de browser na stap 4b. De sessie blijft bewaard in de browser. Open de webapp later opnieuw op hetzelfde apparaat — de data is er nog. Navigeer via de voortgangsbalk naar stap 5.

## Problemen

- **Pagina laadt niet:** controleer of de server draait (`npm run dev`) of open `index.html` rechtstreeks.
- **Data weg na browserupdate:** data staat in `localStorage`; andere browser of incognitomodus geeft een lege sessie.
- **PDF maakt niet aan:** zorg dat `html2pdf.bundle.min.js` aanwezig is in `node_modules/html2pdf.js/dist/`.
