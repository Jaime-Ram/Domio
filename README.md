# Domio

A modern web application built with Next.js, Tailwind CSS (Untitled UI), Supabase, and Stripe.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS with Untitled UI design system
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account
- Stripe account

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Set up environment variables:

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

3. Configure your environment variables:

- **Supabase**: Get your project URL and anon key from your Supabase dashboard
- **Stripe**: Get your publishable key, secret key, and webhook secret from your Stripe dashboard

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── stripe/       # Stripe integration
│   ├── globals.css        # Global styles with Untitled UI
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   └── ui/               # UI components (Untitled UI style)
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase client configuration
│   ├── stripe/           # Stripe client configuration
│   └── utils.ts          # Utility functions
└── middleware.ts         # Next.js middleware for auth
```

## Features

- ✅ Next.js 15 with App Router
- ✅ Tailwind CSS with Untitled UI design tokens
- ✅ Supabase authentication and database
- ✅ Stripe payment integration
- ✅ TypeScript support
- ✅ Responsive design
- ✅ Dark mode support

## Mobile App

The mobile app can be built separately using React Native (Expo) and will share the same Supabase backend. The mobile app can be set up in a separate directory and will use the same Supabase project for authentication and data.

## Environment Variables

Make sure to set up the following environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `STRIPE_SECRET_KEY`: Your Stripe secret key (server-side only)
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret

## Stripe Webhook Setup

To handle Stripe webhooks, you'll need to:

1. Set up a webhook endpoint in your Stripe dashboard
2. Point it to: `https://your-domain.com/api/stripe/webhook`
3. Add the webhook secret to your `.env.local` file

## License

MIT




