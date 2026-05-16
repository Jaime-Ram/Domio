CREATE TABLE public.subscriptions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, stripe_customer_id text UNIQUE, stripe_subscription_id text UNIQUE, plan text CHECK (plan IN ('starter', 'pro')), status text NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'paused')), trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'), current_period_end timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_verhuurder_subscription() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN IF NEW.role = 'verhuurder' THEN INSERT INTO public.subscriptions (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING; END IF; RETURN NEW; END; $$;

CREATE TRIGGER on_profile_created_add_subscription AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_new_verhuurder_subscription();

INSERT INTO public.subscriptions (user_id, trial_ends_at) SELECT id, now() + interval '30 days' FROM public.profiles WHERE role = 'verhuurder' ON CONFLICT (user_id) DO NOTHING;
