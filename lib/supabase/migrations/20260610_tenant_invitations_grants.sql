-- De service_role miste table-grants op tenant_invitations, waardoor de
-- admin-client (gebruikt in /api/invitations/accept, /summary, /pending) de
-- tabel niet kon lezen. Dat gaf een "permission denied", die in code als
-- "Uitnodiging niet gevonden" naar boven kwam.
--
-- service_role omzeilt RLS, maar heeft nog steeds een table-level GRANT nodig.

GRANT ALL ON public.tenant_invitations TO service_role;
GRANT ALL ON public.tenant_invitations TO authenticated;
GRANT SELECT ON public.tenant_invitations TO anon;
