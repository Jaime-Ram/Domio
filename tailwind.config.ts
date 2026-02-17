import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      /* Domio brand + Interactive tokens */
      colors: {
        brand: {
          primary: 'var(--color-primary-500)',
          'primary-hover': 'var(--color-primary-400)',
          accent: 'var(--color-accent-400)',
          'accent-hover': 'var(--color-accent-500)',
        },
        interactive: {
          primary: 'var(--color-interactive-primary)',     /* #163300 – neutral interactive, active items */
          accent: 'var(--color-interactive-accent)',       /* #9FE870 – primary buttons */
          secondary: 'var(--color-interactive-secondary)', /* #868685 – input/checkbox borders, clear btn */
          control: 'var(--color-interactive-control)',     /* #163300 – text/icons on Bright Green */
          contrast: 'var(--color-interactive-contrast)',    /* #9FE870 – text/icons on Forest Green */
        },
        primary: {
          '50': 'var(--color-primary-50)',
          '100': 'var(--color-primary-100)',
          '200': 'var(--color-primary-200)',
          '300': 'var(--color-primary-300)',
          '400': 'var(--color-primary-400)',
          '500': 'var(--color-primary-500)',
          '600': 'var(--color-primary-600)',
          '700': 'var(--color-primary-700)',
          '800': 'var(--color-primary-800)',
          '900': 'var(--color-primary-900)',
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          '50': 'var(--color-secondary-50)',
          '100': 'var(--color-secondary-100)',
          '200': 'var(--color-secondary-200)',
          '300': 'var(--color-secondary-300)',
          '400': 'var(--color-secondary-400)',
          '500': 'var(--color-secondary-500)',
          '600': 'var(--color-secondary-600)',
          '700': 'var(--color-secondary-700)',
          '800': 'var(--color-secondary-800)',
          '900': 'var(--color-secondary-900)',
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '4xl': '2rem',
        /* Wise-style: cards en blokken */
        card: 'var(--radius-card)',
        block: 'var(--radius-block)',
        pill: 'var(--radius-pill)',
      },
      spacing: {
        'wise-xs': 'var(--space-x-small)',
        'wise-sm': 'var(--space-small)',
        'wise-md': 'var(--space-medium)',
        'wise-lg': 'var(--space-large)',
      },
      boxShadow: {
        /* Schaduw boven + onder voor zwevende kaarten op groene achtergrond */
        'card-elevated': '0 -6px 20px -5px rgba(0,0,0,0.08), 0 20px 50px -8px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.08)',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

