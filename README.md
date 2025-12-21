# Domio - Vastgoedbeheer Platform

Een modern vastgoedbeheer platform gebouwd met Next.js 16, React 18, en Tailwind CSS.

## Features

- 🏢 **Portfolio Beheer** - Beheer al je panden op één plek
- 👥 **Huurders Beheer** - Overzicht van huurders en contracten
- 🔧 **Onderhoud** - Track onderhoudstaken en meldingen
- 📊 **Financieel Overzicht** - Inzicht in inkomsten en uitgaven
- 📄 **Documenten** - Centraal documentbeheer
- ⚙️ **Instellingen** - Configureer je voorkeuren

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 18 + Tailwind CSS
- **Components**: Radix UI + Custom Components
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: GSAP

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   │   └── employer/      # Employer dashboard
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # UI components
│   ├── dashboard/        # Dashboard components
│   └── marketing/        # Marketing components
├── lib/                  # Utilities and helpers
└── public/              # Static assets
```

## Demo

Visit the live demo at [https://domio.vercel.app](https://domio.vercel.app)

## License

Private - All rights reserved
