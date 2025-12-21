# Beschikbare UI Componenten

Deze applicatie gebruikt [Untitled UI](https://www.untitledui.com/react/components) componenten gebouwd met Radix UI en Tailwind CSS.

## Basis Componenten

### ✅ Al Geïmplementeerd

- **Button** (`components/ui/button.tsx`)
  - Varianten: default, destructive, outline, secondary, ghost, link
  - Groottes: sm, md, lg, icon

- **Input** (`components/ui/input.tsx`)
  - Standaard input veld met focus states

- **Textarea** (`components/ui/textarea.tsx`)
  - Multi-line tekst input

- **Card** (`components/ui/card.tsx`)
  - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

- **Alert** (`components/ui/alert.tsx`)
  - Alert, AlertTitle, AlertDescription

- **Badge** (`components/ui/badge.tsx`)
  - Varianten: default, secondary, destructive, outline

- **Select** (`components/ui/select.tsx`)
  - Volledige select dropdown met search

- **Dropdown Menu** (`components/ui/dropdown-menu.tsx`)
  - Menu met items, separators, checkboxes, radio items

- **Checkbox** (`components/ui/checkbox.tsx`)
  - Checkbox input

- **Tabs** (`components/ui/tabs.tsx`)
  - Tabs, TabsList, TabsTrigger, TabsContent

- **Avatar** (`components/ui/avatar.tsx`)
  - Avatar, AvatarImage, AvatarFallback

- **Separator** (`components/ui/separator.tsx`)
  - Horizontale en verticale scheidingslijnen

- **Loading** (`components/ui/loading.tsx`)
  - Loading spinner componenten

- **Empty State** (`components/ui/empty-state.tsx`)
  - Lege state component voor wanneer er geen data is

- **Alert Dialog** (`components/ui/alert-dialog.tsx`)
  - Bevestigingsdialogen

## Gebruik Voorbeelden

### Button
```tsx
import { Button } from '@/components/ui/button'

<Button variant="default" size="md">Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
```

### Select
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Tabs
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account content</TabsContent>
  <TabsContent value="settings">Settings content</TabsContent>
</Tabs>
```

### Badge
```tsx
import { Badge } from '@/components/ui/badge'

<Badge variant="default">New</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
```

## Meer Componenten Toevoegen

Voor meer componenten, bezoek [Untitled UI Components](https://www.untitledui.com/react/components) en kopieer de code voor:

- **Tables** - Voor data tabellen
- **Modals** - Voor dialogen
- **Date Pickers** - Voor datum selectie
- **File Uploaders** - Voor bestand uploads
- **Progress Indicators** - Voor voortgang
- **Tooltips** - Voor tooltips
- **Radio Groups** - Voor radio buttons
- **Toggles** - Voor switches
- **Breadcrumbs** - Voor navigatie
- **Pagination** - Voor paginering

## Styling

Alle componenten gebruiken:
- Tailwind CSS voor styling
- Untitled UI design tokens (in `app/globals.css`)
- Dark mode support
- Responsive design

## Dependencies

De componenten gebruiken:
- `@radix-ui/*` - Voor accessibility en functionaliteit
- `class-variance-authority` - Voor variant management
- `tailwind-merge` - Voor class merging
- `lucide-react` - Voor iconen




