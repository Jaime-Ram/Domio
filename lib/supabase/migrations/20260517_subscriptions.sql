-- Subscriptions tabel voor Stripe betalingen
-- Één rij per gebruiker; wordt aangemaakt bij eerste checkout en bijgewerkt via webhook.

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  plan                   TEXT CHECK (plan IN ('starter', 'pro')),
  status                 TEXT NOT NULL DEFAULT 'trialing'
                           CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'paused')),
  trial_ends_at          TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),
  current_period_end     TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: eigenaar mag zijn eigen rij lezen; service_role schrijft via webhook
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gebruiker ziet eigen abonnement"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Index voor webhook-lookup op stripe_customer_id
CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_idx
  ON public.subscriptions (stripe_customer_id);
