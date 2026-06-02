-- 20260521_mjop_phase1.sql
-- MJOP Module Phase 1: meerjarenonderhoudsplanning (NEN 2767 / NL-SfB)
-- Tabellen: nen2767_matrix, mjop_element_types, mjop_maintenance_types,
--           mjop_buildings, mjop_elements, mjop_inspections, mjop_defects,
--           mjop_versions, mjop_tasks, mjop_task_years

-- ============================================================
-- REFERENTIETABELLEN (publiek leesbaar, geen RLS write)
-- ============================================================

-- NEN 2767 conditiescorematrix (3×5×3 = 45 rijen)
CREATE TABLE IF NOT EXISTS public.nen2767_matrix (
  ernst         SMALLINT NOT NULL CHECK (ernst BETWEEN 1 AND 3),
  omvang        SMALLINT NOT NULL CHECK (omvang BETWEEN 1 AND 5),
  intensiteit   SMALLINT NOT NULL CHECK (intensiteit BETWEEN 1 AND 3),
  conditiescore SMALLINT NOT NULL CHECK (conditiescore BETWEEN 1 AND 6),
  PRIMARY KEY (ernst, omvang, intensiteit)
);

-- NL-SfB elementtypencatalogus
CREATE TABLE IF NOT EXISTS public.mjop_element_types (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  nlsfb_code    TEXT    NOT NULL,
  nlsfb_group   TEXT    NOT NULL,
  name          TEXT    NOT NULL,
  description   TEXT,
  levensduur    SMALLINT,
  standard_unit TEXT    NOT NULL DEFAULT 'm2',
  sort_order    SMALLINT NOT NULL DEFAULT 0,
  is_active     BOOLEAN  NOT NULL DEFAULT TRUE
);

CREATE UNIQUE INDEX IF NOT EXISTS mjop_element_types_code_name_idx
  ON public.mjop_element_types (nlsfb_code, name);

-- Onderhoudstypes (D/H/I/P1/P2/R/S/V/W/O)
CREATE TABLE IF NOT EXISTS public.mjop_maintenance_types (
  code        TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  description TEXT,
  color       TEXT
);

-- ============================================================
-- GEBOUWEN
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mjop_buildings (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id         UUID        REFERENCES public.properties(id) ON DELETE SET NULL,
  name                TEXT        NOT NULL,
  address             TEXT,
  bag_id              TEXT,
  bouwjaar            SMALLINT,
  gebruiksoppervlak   NUMERIC(10,2),
  bruto_inhoud        NUMERIC(10,2),
  herbouwwaarde       NUMERIC(12,2),
  herbouwwaarde_jaar  SMALLINT,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mjop_buildings_owner_id_idx ON public.mjop_buildings (owner_id);
CREATE INDEX IF NOT EXISTS mjop_buildings_property_id_idx ON public.mjop_buildings (property_id);

-- ============================================================
-- ELEMENTEN (instanties van NL-SfB types op een gebouw)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mjop_elements (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id          UUID        NOT NULL REFERENCES public.mjop_buildings(id) ON DELETE CASCADE,
  element_type_id      UUID        REFERENCES public.mjop_element_types(id) ON DELETE SET NULL,
  owner_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  naam                 TEXT        NOT NULL,
  locatie              TEXT,
  hoeveelheid          NUMERIC(10,2),
  eenheid              TEXT        DEFAULT 'm2',
  bouwjaar             SMALLINT,
  levensduur_override  SMALLINT,
  conditiescore_huidig SMALLINT    CHECK (conditiescore_huidig BETWEEN 1 AND 6),
  notes                TEXT,
  foto_url             TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mjop_elements_building_id_idx ON public.mjop_elements (building_id);
CREATE INDEX IF NOT EXISTS mjop_elements_owner_id_idx ON public.mjop_elements (owner_id);

-- ============================================================
-- INSPECTIES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mjop_inspections (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID        NOT NULL REFERENCES public.mjop_buildings(id) ON DELETE CASCADE,
  owner_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inspecteur  TEXT,
  datum       DATE        NOT NULL DEFAULT CURRENT_DATE,
  status      TEXT        NOT NULL DEFAULT 'concept'
                CHECK (status IN ('concept','afgerond')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mjop_inspections_building_id_idx ON public.mjop_inspections (building_id);
CREATE INDEX IF NOT EXISTS mjop_inspections_owner_id_idx ON public.mjop_inspections (owner_id);

-- ============================================================
-- GEBREKEN (NEN 2767 parameters → conditiescore via trigger)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mjop_defects (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  element_id    UUID        NOT NULL REFERENCES public.mjop_elements(id) ON DELETE CASCADE,
  inspection_id UUID        REFERENCES public.mjop_inspections(id) ON DELETE SET NULL,
  owner_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gebrektype    TEXT,
  beschrijving  TEXT,
  ernst         SMALLINT    NOT NULL CHECK (ernst BETWEEN 1 AND 3),
  omvang        SMALLINT    NOT NULL CHECK (omvang BETWEEN 1 AND 5),
  intensiteit   SMALLINT    NOT NULL CHECK (intensiteit BETWEEN 1 AND 3),
  conditiescore SMALLINT    CHECK (conditiescore BETWEEN 1 AND 6),
  foto_url      TEXT,
  actiejaar     SMALLINT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mjop_defects_element_id_idx    ON public.mjop_defects (element_id);
CREATE INDEX IF NOT EXISTS mjop_defects_inspection_id_idx ON public.mjop_defects (inspection_id);
CREATE INDEX IF NOT EXISTS mjop_defects_owner_id_idx      ON public.mjop_defects (owner_id);

-- Trigger: conditiescore automatisch berekenen uit NEN 2767 matrix
CREATE OR REPLACE FUNCTION public.mjop_compute_conditiescore()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  SELECT nm.conditiescore INTO NEW.conditiescore
  FROM public.nen2767_matrix nm
  WHERE nm.ernst = NEW.ernst
    AND nm.omvang = NEW.omvang
    AND nm.intensiteit = NEW.intensiteit;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mjop_defects_conditiescore ON public.mjop_defects;
CREATE TRIGGER trg_mjop_defects_conditiescore
  BEFORE INSERT OR UPDATE OF ernst, omvang, intensiteit
  ON public.mjop_defects
  FOR EACH ROW EXECUTE FUNCTION public.mjop_compute_conditiescore();

-- ============================================================
-- MJOP VERSIES (planversies; na vaststelling immutable)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mjop_versions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id      UUID        NOT NULL REFERENCES public.mjop_buildings(id) ON DELETE CASCADE,
  owner_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  naam             TEXT        NOT NULL DEFAULT 'MJOP',
  horizon_start    SMALLINT    NOT NULL,
  horizon_end      SMALLINT    NOT NULL,
  status           TEXT        NOT NULL DEFAULT 'concept'
                    CHECK (status IN ('concept','vastgesteld')),
  herbouwwaarde    NUMERIC(12,2),
  reserve_toets    BOOLEAN     NOT NULL DEFAULT TRUE,
  reserve_percent  NUMERIC(4,2) NOT NULL DEFAULT 0.5,
  vastgesteld_at   TIMESTAMPTZ,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mjop_versions_building_id_idx ON public.mjop_versions (building_id);
CREATE INDEX IF NOT EXISTS mjop_versions_owner_id_idx    ON public.mjop_versions (owner_id);

-- ============================================================
-- MJOP TAKEN (onderhoudstaken per element, in een versie)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mjop_tasks (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id            UUID        NOT NULL REFERENCES public.mjop_versions(id) ON DELETE CASCADE,
  element_id            UUID        REFERENCES public.mjop_elements(id) ON DELETE SET NULL,
  owner_id              UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nlsfb_code            TEXT,
  omschrijving          TEXT        NOT NULL,
  maintenance_type_code TEXT        REFERENCES public.mjop_maintenance_types(code),
  conditiescore_trigger SMALLINT    CHECK (conditiescore_trigger BETWEEN 1 AND 6),
  startjaar             SMALLINT    NOT NULL,
  cyclus                SMALLINT,
  stopjaar              SMALLINT,
  hoeveelheid           NUMERIC(10,2),
  eenheid               TEXT        DEFAULT 'm2',
  prijs_per_eenheid     NUMERIC(10,2),
  btw_percent           NUMERIC(4,1) NOT NULL DEFAULT 21.0,
  indexering_percent    NUMERIC(4,2) NOT NULL DEFAULT 0.0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mjop_tasks_version_id_idx ON public.mjop_tasks (version_id);
CREATE INDEX IF NOT EXISTS mjop_tasks_element_id_idx ON public.mjop_tasks (element_id);
CREATE INDEX IF NOT EXISTS mjop_tasks_owner_id_idx   ON public.mjop_tasks (owner_id);

-- ============================================================
-- MJOP TAAKYEARS (gegenereerde jaarlijkse kosten per taak)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mjop_task_years (
  id      UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID     NOT NULL REFERENCES public.mjop_tasks(id) ON DELETE CASCADE,
  jaar    SMALLINT NOT NULL,
  bedrag  NUMERIC(12,2) NOT NULL DEFAULT 0,
  UNIQUE (task_id, jaar)
);

CREATE INDEX IF NOT EXISTS mjop_task_years_task_id_idx ON public.mjop_task_years (task_id);

-- ============================================================
-- FUNCTIE: regenereer taakyears (wordt vanuit app aangeroepen)
-- ============================================================

CREATE OR REPLACE FUNCTION public.mjop_refresh_task_years(p_task_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  t             RECORD;
  yr            SMALLINT;
  base_cost     NUMERIC(12,2);
  year_cost     NUMERIC(12,2);
  years_elapsed INTEGER;
BEGIN
  SELECT * INTO t FROM public.mjop_tasks WHERE id = p_task_id;
  IF NOT FOUND THEN RETURN; END IF;

  base_cost := COALESCE(t.hoeveelheid, 1) * COALESCE(t.prijs_per_eenheid, 0);

  DELETE FROM public.mjop_task_years WHERE task_id = p_task_id;

  yr := t.startjaar;
  LOOP
    EXIT WHEN yr > COALESCE(t.stopjaar, t.startjaar + 50);
    years_elapsed := yr - t.startjaar;
    year_cost := base_cost * POWER(1 + t.indexering_percent / 100.0, years_elapsed);
    INSERT INTO public.mjop_task_years (task_id, jaar, bedrag)
    VALUES (p_task_id, yr, ROUND(year_cost, 2))
    ON CONFLICT (task_id, jaar) DO UPDATE SET bedrag = EXCLUDED.bedrag;
    IF t.cyclus IS NULL OR t.cyclus = 0 THEN EXIT; END IF;
    yr := yr + t.cyclus;
  END LOOP;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- mjop_buildings
ALTER TABLE public.mjop_buildings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Eigenaar beheert eigen gebouwen" ON public.mjop_buildings;
CREATE POLICY "Eigenaar beheert eigen gebouwen"
  ON public.mjop_buildings FOR ALL
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- mjop_elements
ALTER TABLE public.mjop_elements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Eigenaar beheert eigen elementen" ON public.mjop_elements;
CREATE POLICY "Eigenaar beheert eigen elementen"
  ON public.mjop_elements FOR ALL
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- mjop_inspections
ALTER TABLE public.mjop_inspections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Eigenaar beheert eigen inspecties" ON public.mjop_inspections;
CREATE POLICY "Eigenaar beheert eigen inspecties"
  ON public.mjop_inspections FOR ALL
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- mjop_defects
ALTER TABLE public.mjop_defects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Eigenaar beheert eigen gebreken" ON public.mjop_defects;
CREATE POLICY "Eigenaar beheert eigen gebreken"
  ON public.mjop_defects FOR ALL
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- mjop_versions
ALTER TABLE public.mjop_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Eigenaar beheert eigen versies" ON public.mjop_versions;
CREATE POLICY "Eigenaar beheert eigen versies"
  ON public.mjop_versions FOR ALL
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- mjop_tasks
ALTER TABLE public.mjop_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Eigenaar beheert eigen taken" ON public.mjop_tasks;
CREATE POLICY "Eigenaar beheert eigen taken"
  ON public.mjop_tasks FOR ALL
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- mjop_task_years (geen owner_id; policy via taak)
ALTER TABLE public.mjop_task_years ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Eigenaar ziet eigen taakyears" ON public.mjop_task_years;
CREATE POLICY "Eigenaar ziet eigen taakyears"
  ON public.mjop_task_years FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mjop_tasks t
      WHERE t.id = task_id AND t.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mjop_tasks t
      WHERE t.id = task_id AND t.owner_id = auth.uid()
    )
  );

-- Referentietabellen: publiek leesbaar
ALTER TABLE public.nen2767_matrix ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Publiek leesbaar nen2767" ON public.nen2767_matrix;
CREATE POLICY "Publiek leesbaar nen2767"
  ON public.nen2767_matrix FOR SELECT USING (TRUE);

ALTER TABLE public.mjop_element_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Publiek leesbaar elementtypen" ON public.mjop_element_types;
CREATE POLICY "Publiek leesbaar elementtypen"
  ON public.mjop_element_types FOR SELECT USING (TRUE);

ALTER TABLE public.mjop_maintenance_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Publiek leesbaar onderhoudstypes" ON public.mjop_maintenance_types;
CREATE POLICY "Publiek leesbaar onderhoudstypes"
  ON public.mjop_maintenance_types FOR SELECT USING (TRUE);

-- ============================================================
-- SEED: NEN 2767 Matrix (45 rijen: ernst 1-3 × omvang 1-5 × intensiteit 1-3)
-- ============================================================

INSERT INTO public.nen2767_matrix (ernst, omvang, intensiteit, conditiescore) VALUES
-- Ernst 1: gering verval
(1,1,1,1),(1,1,2,1),(1,1,3,2),
(1,2,1,1),(1,2,2,2),(1,2,3,2),
(1,3,1,2),(1,3,2,2),(1,3,3,3),
(1,4,1,2),(1,4,2,3),(1,4,3,3),
(1,5,1,3),(1,5,2,3),(1,5,3,3),
-- Ernst 2: serieus verval
(2,1,1,2),(2,1,2,2),(2,1,3,3),
(2,2,1,2),(2,2,2,3),(2,2,3,3),
(2,3,1,3),(2,3,2,3),(2,3,3,4),
(2,4,1,3),(2,4,2,4),(2,4,3,4),
(2,5,1,4),(2,5,2,4),(2,5,3,5),
-- Ernst 3: ernstig verval
(3,1,1,3),(3,1,2,3),(3,1,3,4),
(3,2,1,3),(3,2,2,4),(3,2,3,4),
(3,3,1,4),(3,3,2,4),(3,3,3,5),
(3,4,1,4),(3,4,2,5),(3,4,3,5),
(3,5,1,5),(3,5,2,5),(3,5,3,6)
ON CONFLICT (ernst, omvang, intensiteit) DO NOTHING;

-- ============================================================
-- SEED: Onderhoudstypes
-- ============================================================

INSERT INTO public.mjop_maintenance_types (code, label, description, color) VALUES
('D',  'Deelvervanging',      'Gedeeltelijk vervangen van een element',              '#F59E0B'),
('H',  'Herstellen',          'Repareren van schade of gebreken',                    '#EF4444'),
('I',  'Inspecteren',         'Periodieke inspectie en conditiemeting',               '#6366F1'),
('P1', 'Preventief groot',    'Grootschalig preventief onderhoud',                   '#163300'),
('P2', 'Preventief klein',    'Kleinschalig preventief onderhoud',                   '#9FE870'),
('R',  'Reinigen',            'Schoonmaken en reiniging',                            '#06B6D4'),
('S',  'Schilderen',          'Schilderwerk en coating',                             '#8B5CF6'),
('V',  'Vervanging',          'Volledig vervangen van een element',                  '#DC2626'),
('W',  'Wettelijk verplicht', 'Wettelijk verplicht onderhoud of keuring',            '#B45309'),
('O',  'Overig',              'Overige onderhoudswerkzaamheden',                     '#6B7280')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- SEED: NL-SfB Elementtypencatalogus
-- ============================================================

INSERT INTO public.mjop_element_types (nlsfb_code, nlsfb_group, name, description, levensduur, standard_unit, sort_order) VALUES
-- Ruwbouw (constructieve bouwdelen)
('21','Ruwbouw',      'Buitenwanden',                   'Dragende en niet-dragende buitenwanden, gevels',           80, 'm2', 10),
('22','Ruwbouw',      'Binnenwanden',                   'Dragende en niet-dragende binnenwanden',                   60, 'm2', 20),
('23','Ruwbouw',      'Vloeren (constructief)',          'Draagvloeren, betonvloeren, systeemvloeren',               80, 'm2', 30),
('24','Ruwbouw',      'Trappen en balustrades',         'Vaste trappen, vluchtroutes, bordesconstructies',          60, 'st', 40),
('27','Ruwbouw',      'Daken (constructief)',            'Dakconstructie, dakplaten, sporenkappen',                  60, 'm2', 50),
-- Afbouw (technische schil)
('31','Afbouw',       'Buitenwandopeningen',            'Kozijnen, ramen, buitendeuren, puien',                     35, 'm2', 60),
('32','Afbouw',       'Binnenwandopeningen',            'Binnendeuren, kozijnen, vaste ramen',                      30, 'st', 70),
('33','Afbouw',       'Vloerbedekkingen',               'Vaste vloerbedekkingen, tegels, parket',                   20, 'm2', 80),
('34','Afbouw',       'Balustrades en leuningen',       'Losstaande balustrades, hekwerken, leuningen',             40, 'ml', 85),
('37','Afbouw',       'Dakopeningen',                   'Dakramen, dakluiken, lichtkoepels',                        25, 'st', 90),
-- Afwerkingen
('41','Afwerkingen',  'Buitenwandafwerkingen',          'Bepleistering, stucwerk buiten, gevelbekleding',           20, 'm2',100),
('42','Afwerkingen',  'Binnenwandafwerkingen',          'Stucwerk binnen, tegelwerk, wandafwerkingen',              20, 'm2',110),
('43','Afwerkingen',  'Vloerafwerkingen',               'Vloercoatings, gietvloeren, afwerklagen',                  15, 'm2',120),
('45','Afwerkingen',  'Plafondafwerkingen',             'Systeemplafonds, stucwerk plafond, plafondplaten',         20, 'm2',130),
-- Installaties WTB
('51','Installaties', 'Buitenriolering',                'Kolken, putten, rioolbuizen op terrein',                   50, 'ml',140),
('52','Installaties', 'Binnenriolering en waterafvoer', 'Afvoerkolommen, hemelwaterafvoer',                         40, 'ml',150),
('53','Installaties', 'Waterinstallaties',              'Koud- en warmwaterleidingen, kranen, boilers',             30, 'st',160),
('54','Installaties', 'Gasinstallaties',                'Gasleiding, aansluitingen, meters',                        40, 'st',170),
('56','Installaties', 'Verwarmingsinstallaties',        'CV-ketels, radiatoren, leidingen, warmtepompen',           20, 'st',180),
('57','Installaties', 'Koelinstallaties',               'Airconditioning, koelunits, WKO',                          20, 'st',190),
('58','Installaties', 'Ventilatie',                     'Ventilatiesystemen, kanalen, roosters, WTW-units',         20, 'st',200),
-- Installaties ET
('61','Installaties', 'Elektrotechnische installaties', 'Hoofdverdelers, groepen, bekabeling',                      35, 'st',210),
('62','Installaties', 'Communicatieinstallaties',       'Intercom, netwerk, CAI, domotica',                         20, 'st',220),
('63','Installaties', 'Brandveiligheidsinstallaties',   'Brandmelders, sprinklers, noodverlichting',                15, 'st',230),
('66','Installaties', 'Transportinstallaties (lift)',   'Liften, roltrappen, periodieke keuring',                   25, 'st',240),
-- Terrein
('73','Terrein',      'Verhardingen',                   'Bestrating, parkeervakken, opritten, paden',               25, 'm2',250),
('74','Terrein',      'Groen en terreininrichting',     'Beplanting, bomen, hekwerken, straatmeubilair',            15, 'm2',260)
ON CONFLICT (nlsfb_code, name) DO NOTHING;
