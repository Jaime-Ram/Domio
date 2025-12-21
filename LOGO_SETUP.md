# Logo en Icoon Setup

## Waar bestanden plaatsen

### 1. Favicon/Icoon (browsertabblad icoon)

Plaats je favicon in de `app/` directory met een van deze namen:
- `app/icon.png` (aanbevolen: 512x512 pixels)
- `app/icon.svg` (vector formaat, schaalbaar)
- `app/favicon.ico` (traditioneel formaat)

**Next.js detecteert deze automatisch!**

Voorbeelden:
```
app/icon.png
app/icon.svg
app/favicon.ico
```

### 2. Logo (voor in de applicatie)

Plaats je logo bestanden in de `public/` directory:

```
public/
  images/
    logo.png          # Hoofdlogo
    logo.svg          # Vector logo (aanbevolen)
    logo-dark.png     # Logo voor dark mode (optioneel)
    logo-light.png    # Logo voor light mode (optioneel)
```

### 3. Gebruik in je applicatie

#### Logo component maken:

Maak een `components/Logo.tsx` bestand:

```tsx
import Image from 'next/image'
import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="/images/logo.svg"
        alt="ServeSync Logo"
        width={120}
        height={40}
        priority
      />
    </Link>
  )
}
```

#### Logo gebruiken in layout of navigatie:

```tsx
import { Logo } from '@/components/Logo'

// In je component:
<Logo />
```

### 4. Metadata in layout.tsx

Het favicon wordt automatisch gedetecteerd, maar je kunt ook handmatig metadata toevoegen:

```tsx
export const metadata: Metadata = {
  title: "ServeSync",
  description: "Modern web application",
  icons: {
    icon: '/icon.png', // of '/favicon.ico'
    apple: '/apple-icon.png', // voor iOS (optioneel)
  },
};
```

## Bestandsformaten

- **PNG**: Voor logo's met transparantie (gebruik voor logo's)
- **SVG**: Beste keuze voor logo's (schaalbaar, klein bestand)
- **ICO**: Voor favicons (ouder formaat)
- **JPG**: Alleen als je geen transparantie nodig hebt

## Aanbevolen afmetingen

- **Favicon**: 32x32 of 512x512 pixels
- **Logo**: 200-400 pixels breed (SVG is schaalbaar)
- **Apple Touch Icon**: 180x180 pixels (voor iOS)

## Voorbeeld structuur

```
ServeSync2/
├── app/
│   ├── icon.png          ← Favicon hier
│   └── layout.tsx
├── public/
│   └── images/
│       ├── logo.svg      ← Logo hier
│       └── logo.png      ← Backup logo
└── components/
    └── Logo.tsx          ← Logo component
```




