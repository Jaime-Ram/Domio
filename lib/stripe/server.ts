import Stripe from 'stripe';

// Check if Stripe is configured
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('⚠️ STRIPE_SECRET_KEY is not set. Stripe features will not work.');
}

// Initialize Stripe only if key exists
// This prevents crashes during app startup
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16' as any,
      typescript: true,
    })
  : (null as unknown as Stripe); // Type cast to allow imports, but will throw when used

// Helper function to check if Stripe is configured
export function isStripeConfigured(): boolean {
  return !!stripeSecretKey;
}
