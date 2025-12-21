# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   
   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

3. **Get Your Supabase Credentials**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Create a new project or select an existing one
   - Go to Settings > API
   - Copy the Project URL and anon/public key

4. **Get Your Stripe Credentials**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Get your API keys from Developers > API keys
   - For webhooks, go to Developers > Webhooks and create an endpoint pointing to:
     `https://your-domain.com/api/stripe/webhook`
   - Copy the webhook signing secret
   
   **Important for Stripe Connect:**
   - Enable Stripe Connect in your Stripe Dashboard (Settings > Connect)
   - Set up your Connect settings (branding, terms, etc.)
   - The app uses Stripe Express accounts for easy onboarding

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

6. **Open Your Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Mobile App Setup (Future)

The mobile app can be built using React Native (Expo) and will share the same Supabase backend. You can:

1. Create a new Expo project in a separate directory
2. Use the same Supabase credentials
3. Share the same database and authentication system

This allows you to have a unified backend for both web and mobile applications.

