-- Add mfa_method preference to profiles
-- Tracks which 2FA method the user has chosen: none, sms, or totp
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mfa_method text NOT NULL DEFAULT 'none'
  CHECK (mfa_method IN ('none', 'sms', 'totp'));

-- Migrate any existing 'email' values to 'none' (email OTP replaced by SMS)
UPDATE public.profiles SET mfa_method = 'none' WHERE mfa_method = 'email';
