-- Step 1: Remove old unique constraint on devocionais
ALTER TABLE public.devocionais DROP CONSTRAINT IF EXISTS devocionais_data_key;

-- Step 2: Add church_id to devocionais
ALTER TABLE public.devocionais ADD COLUMN IF NOT EXISTS church_id uuid REFERENCES public.churches(id);

-- Step 3: Create partial unique indexes for devocionais
-- One devocional público per date
CREATE UNIQUE INDEX IF NOT EXISTS unique_devocional_public_date
  ON public.devocionais (data)
  WHERE is_public = true;

-- One devocional per church per date
CREATE UNIQUE INDEX IF NOT EXISTS unique_devocional_church_date
  ON public.devocionais (data, church_id)
  WHERE is_public = false AND church_id IS NOT NULL;

-- Step 4: Add church_id to discipleship_tracks
ALTER TABLE public.discipleship_tracks ADD COLUMN IF NOT EXISTS church_id uuid REFERENCES public.churches(id);

-- Step 5: Update RLS policies for devocionais
-- Drop old broad policy
DROP POLICY IF EXISTS "Anyone can view devocionais" ON public.devocionais;
DROP POLICY IF EXISTS "Anyone can view public devotionals" ON public.devocionais;

-- Create new policies
CREATE POLICY "Public devotionals viewable by all"
  ON public.devocionais FOR SELECT
  USING (is_public = true);

CREATE POLICY "Members view church devotionals"
  ON public.devocionais FOR SELECT
  USING (
    is_public = false
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.church_id = devocionais.church_id
    )
  );

CREATE POLICY "Church admins manage church devotionals"
  ON public.devocionais FOR ALL
  USING (public.is_church_admin(church_id))
  WITH CHECK (public.is_church_admin(church_id));

-- Step 6: Update RLS policies for discipleship_tracks
-- Drop old broad policy
DROP POLICY IF EXISTS "Anyone can view tracks" ON public.discipleship_tracks;
DROP POLICY IF EXISTS "Anyone can view public tracks" ON public.discipleship_tracks;

-- Create new policies
CREATE POLICY "Public tracks viewable by all"
  ON public.discipleship_tracks FOR SELECT
  USING (is_public = true);

CREATE POLICY "Members view church tracks"
  ON public.discipleship_tracks FOR SELECT
  USING (
    is_public = false
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.church_id = discipleship_tracks.church_id
    )
  );

CREATE POLICY "Church admins manage church tracks"
  ON public.discipleship_tracks FOR ALL
  USING (public.is_church_admin(church_id))
  WITH CHECK (public.is_church_admin(church_id));