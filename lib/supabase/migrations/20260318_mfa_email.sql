-- 2FA met code per e-mail: voorkeur op profiel + tijdelijke OTP-codes
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mfa_email_enabled boolean NOT NULL DEFAULT false;

-- Tijdelijke codes voor e-mail 2FA (hash van code, verloopt na korte tijd)
CREATE TABLE IF NOT EXISTS public.email_otp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes')
);

CREATE INDEX IF NOT EXISTS idx_email_otp_user_expires ON public.email_otp(user_id, expires_at);

ALTER TABLE public.email_otp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_otp: user own only"
  ON public.email_otp FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

COMMENT ON TABLE public.email_otp IS 'Tijdelijke OTP-codes voor 2FA per e-mail; code_hash is hash van de 6-cijferige code.';
