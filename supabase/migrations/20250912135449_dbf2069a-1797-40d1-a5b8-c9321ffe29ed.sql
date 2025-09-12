-- Create diagnostic milestones table
CREATE TABLE public.diagnostic_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  min_points INTEGER NOT NULL DEFAULT 0,
  min_time_months INTEGER NOT NULL DEFAULT 0,
  is_horizontal_branch BOOLEAN NOT NULL DEFAULT false,
  parent_milestone_id UUID REFERENCES public.diagnostic_milestones(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create progression tracks table (internal tracks within milestones)
CREATE TABLE public.progression_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_id UUID NOT NULL REFERENCES public.diagnostic_milestones(id),
  track_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  points_required INTEGER NOT NULL DEFAULT 0,
  activities_required JSONB DEFAULT '[]'::jsonb,
  unlocks_content JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(milestone_id, order_index)
);

-- Create milestone connections table (defines progression paths)
CREATE TABLE public.milestone_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_milestone_id UUID NOT NULL REFERENCES public.diagnostic_milestones(id),
  to_milestone_id UUID NOT NULL REFERENCES public.diagnostic_milestones(id),
  connection_type TEXT NOT NULL DEFAULT 'linear',
  requirements JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user journey state table
CREATE TABLE public.user_journey_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_milestone_id UUID NOT NULL REFERENCES public.diagnostic_milestones(id),
  current_track_id UUID REFERENCES public.progression_tracks(id),
  completed_milestones JSONB DEFAULT '[]'::jsonb,
  completed_tracks JSONB DEFAULT '[]'::jsonb,
  available_branches JSONB DEFAULT '[]'::jsonb,
  journey_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_progression_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.diagnostic_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progression_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journey_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view diagnostic milestones" ON public.diagnostic_milestones FOR SELECT USING (true);
CREATE POLICY "Admins can manage diagnostic milestones" ON public.diagnostic_milestones FOR ALL USING (is_admin());
CREATE POLICY "Anyone can view progression tracks" ON public.progression_tracks FOR SELECT USING (true);
CREATE POLICY "Admins can manage progression tracks" ON public.progression_tracks FOR ALL USING (is_admin());
CREATE POLICY "Anyone can view milestone connections" ON public.milestone_connections FOR SELECT USING (true);
CREATE POLICY "Admins can manage milestone connections" ON public.milestone_connections FOR ALL USING (is_admin());
CREATE POLICY "Users can view their own journey state" ON public.user_journey_state FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journey state" ON public.user_journey_state FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journey state" ON public.user_journey_state FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all journey states" ON public.user_journey_state FOR SELECT USING (is_admin());