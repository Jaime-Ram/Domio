-- Taken / task management
CREATE TABLE IF NOT EXISTS public.tasks (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id      uuid REFERENCES public.profiles(id)    ON DELETE CASCADE  NOT NULL,
  property_id   uuid REFERENCES public.properties(id)  ON DELETE SET NULL,
  tenant_id     uuid REFERENCES public.tenants(id)     ON DELETE SET NULL,
  title         text NOT NULL,
  description   text,
  status        text NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open', 'afgerond', 'geannuleerd')),
  priority      text NOT NULL DEFAULT 'normaal'
                  CHECK (priority IN ('laag', 'normaal', 'hoog', 'urgent')),
  category      text NOT NULL DEFAULT 'overig'
                  CHECK (category IN ('administratief', 'onderhoud', 'financieel', 'huurder', 'juridisch', 'overig')),
  due_date      date,
  notification_date date,
  recurring     text NOT NULL DEFAULT 'geen'
                  CHECK (recurring IN ('geen', 'wekelijks', 'maandelijks', 'jaarlijks')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks: select own" ON public.tasks FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Tasks: insert own" ON public.tasks FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Tasks: update own" ON public.tasks FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Tasks: delete own" ON public.tasks FOR DELETE TO authenticated USING (owner_id = auth.uid());
