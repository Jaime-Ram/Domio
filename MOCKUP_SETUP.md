# Mockup Setup Instructies

Om echte iPhone en tablet mockups te gebruiken in de hero sectie, moet je screenshots maken van je dashboard en deze in de juiste mappen plaatsen.

## Stap 1: Screenshots Maken

### Voor Tablet Mockup:
1. Open je dashboard in de browser: `http://localhost:3000/dashboard/employer`
2. Maak een screenshot van het volledige dashboard scherm
3. Resize naar ongeveer 1600x1200 pixels (of 4:3 ratio)
4. Sla op als: `dashboard-tablet.png`

### Voor iPhone Mockup:
1. Open je dashboard in de browser
2. Gebruik browser DevTools (F12) om naar mobile view te gaan (iPhone 14 Pro size)
3. Maak een screenshot van het mobile dashboard
4. Resize naar 390x844 pixels (iPhone 14 Pro resolutie)
5. Sla op als: `dashboard-mobile.png`

## Stap 2: Bestanden Plaatsen

Plaats de screenshots in:
```
public/
  images/
    mockups/
      dashboard-tablet.png
      dashboard-mobile.png
```

## Stap 3: Alternatieve Methoden

### Optie A: Online Mockup Services
Je kunt ook online mockup services gebruiken:
- [Mockup World](https://www.mockupworld.co/)
- [Device Frames](https://deviceframes.com/)
- [Mockup Phone](https://mockuphone.com/)

### Optie B: Screenshot Tools
- **Mac**: Cmd+Shift+4 (select area) of Cmd+Shift+3 (full screen)
- **Windows**: Snipping Tool of Win+Shift+S
- **Browser Extensions**: 
  - Full Page Screen Capture (Chrome)
  - Fireshot (Firefox)

### Optie C: Design Tools
Als je Figma/Sketch gebruikt:
1. Exporteer je dashboard design
2. Plaats in mockup template
3. Exporteer als PNG

## Stap 4: Testen

Na het plaatsen van de screenshots:
1. Herstart je development server: `npm run dev`
2. Check de homepage - de mockups zouden moeten verschijnen
3. Als de images niet laden, check de console voor errors

## Bestandsformaten

- **PNG** (aanbevolen): Voor screenshots met transparantie
- **JPG**: Als je geen transparantie nodig hebt
- **WebP**: Voor betere compressie (Next.js ondersteunt dit automatisch)

## Aanbevolen Afmetingen

- **Tablet**: 1600x1200 pixels (4:3 ratio) of 1920x1080 (16:9)
- **iPhone**: 390x844 pixels (iPhone 14 Pro) of 375x812 (iPhone X)

## Troubleshooting

### Images laden niet:
1. Check of de bestandsnamen exact kloppen
2. Check of de bestanden in `public/images/mockups/` staan
3. Hard refresh: Cmd+Shift+R (Mac) of Ctrl+Shift+R (Windows)

### Images zijn te groot:
- Gebruik een image optimizer zoals [TinyPNG](https://tinypng.com/)
- Of gebruik Next.js Image optimization (automatisch)

### Mockups zien er niet goed uit:
- Zorg dat screenshots de juiste aspect ratio hebben
- Check of de images scherp zijn (niet pixelated)
- Gebruik hoge resolutie screenshots voor betere kwaliteit




