# Logo Bestanden Plaatsen

## Stap 1: Sla je logo bestanden op

Je hebt twee logo's:

### 1. Volledig Logo (met "ServeSync" tekst)
**Plaats dit bestand hier:**
```
public/images/logo.svg
```
OF
```
public/images/logo.png
```

**Beschrijving:** Logo met de paarse "S" en "ServeSync" tekst (Serve in paars, Sync in blauw-paars)

### 2. Icon/Favicon (alleen de "S")
**Plaats dit bestand hier:**
```
app/icon.png
```
OF
```
app/icon.svg
```

**Beschrijving:** Alleen de paarse "S" (voor browser tabblad)

## Stap 2: Bestandsnamen

Zorg ervoor dat de bestanden exact deze namen hebben:

- **Logo:** `logo.svg` of `logo.png` in `public/images/`
- **Icon:** `icon.png` of `icon.svg` in `app/`

## Stap 3: Bestandsformaten

- **SVG** (aanbevolen): Schaalbaar, klein bestand
- **PNG**: Als je geen SVG hebt, gebruik PNG met transparantie
- Voor favicon: PNG 512x512 pixels of SVG

## Stap 4: Testen

Na het plaatsen van de bestanden:
1. Herstart je development server: `npm run dev`
2. Check de homepage - je logo zou moeten verschijnen
3. Check de browser tab - je favicon zou moeten verschijnen

## Huidige Structuur

```
ServeSync2/
├── app/
│   └── icon.png (of icon.svg)  ← PLAATS HIER JE FAVICON
├── public/
│   └── images/
│       └── logo.svg (of logo.png)  ← PLAATS HIER JE LOGO
└── components/
    └── Logo.tsx  ← Component die het logo gebruikt
```

## Troubleshooting

Als het logo niet verschijnt:
1. Controleer of de bestandsnamen exact kloppen
2. Controleer of de bestanden in de juiste mappen staan
3. Hard refresh in browser: Cmd+Shift+R (Mac) of Ctrl+Shift+R (Windows)
4. Check de browser console voor foutmeldingen




