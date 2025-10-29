-- Add custom tracks support to discipleship_tracks table
ALTER TABLE discipleship_tracks 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS is_custom boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'private' CHECK (visibility IN ('private', 'shared', 'public'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discipleship_tracks_created_by ON discipleship_tracks(created_by);
CREATE INDEX IF NOT EXISTS idx_discipleship_tracks_visibility ON discipleship_tracks(visibility);
CREATE INDEX IF NOT EXISTS idx_discipleship_tracks_is_custom ON discipleship_tracks(is_custom);

-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Guia users can create custom tracks" ON discipleship_tracks;
DROP POLICY IF EXISTS "Users can view accessible tracks" ON discipleship_tracks;
DROP POLICY IF EXISTS "Users can update own custom tracks" ON discipleship_tracks;
DROP POLICY IF EXISTS "Users can delete own custom tracks" ON discipleship_tracks;

-- RLS Policies for custom tracks

-- Guia users can create custom tracks
CREATE POLICY "Guia users can create custom tracks"
ON discipleship_tracks FOR INSERT
WITH CHECK (
  is_custom = true AND 
  created_by = auth.uid()
);

-- Users can view own custom tracks and public tracks
CREATE POLICY "Users can view accessible tracks"
ON discipleship_tracks FOR SELECT
USING (
  (is_custom = true AND created_by = auth.uid()) OR  -- Own custom tracks
  (visibility = 'public') OR                          -- Public custom tracks
  (is_custom = false OR is_custom IS NULL)           -- Official tracks
);

-- Users can update their own custom tracks
CREATE POLICY "Users can update own custom tracks"
ON discipleship_tracks FOR UPDATE
USING (is_custom = true AND created_by = auth.uid());

-- Users can delete their own custom tracks
CREATE POLICY "Users can delete own custom tracks"
ON discipleship_tracks FOR DELETE
USING (is_custom = true AND created_by = auth.uid());