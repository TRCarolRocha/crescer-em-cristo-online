-- Add visibility control fields to discipleship_tracks table
ALTER TABLE public.discipleship_tracks 
ADD COLUMN allowed_levels TEXT[] DEFAULT ARRAY['novo', 'crescimento', 'lider'],
ADD COLUMN allowed_groups UUID[] DEFAULT NULL;

-- Create member_groups table for custom user groups
CREATE TABLE public.member_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for member_groups
ALTER TABLE public.member_groups ENABLE ROW LEVEL SECURITY;

-- Create policies for member_groups
CREATE POLICY "Admins can manage member groups" 
ON public.member_groups 
FOR ALL 
USING (is_admin());

CREATE POLICY "Anyone can view member groups" 
ON public.member_groups 
FOR SELECT 
USING (true);

-- Update existing group_members table if needed
ALTER TABLE public.group_members 
ALTER COLUMN group_id SET NOT NULL;

-- Add trigger for automatic timestamp updates on member_groups
CREATE TRIGGER update_member_groups_updated_at
BEFORE UPDATE ON public.member_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some initial data for member_groups
INSERT INTO public.member_groups (name, description, created_by) VALUES
('Novos Convertidos', 'Grupo para pessoas que recém aceitaram Jesus', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
('Líderes de Célula', 'Grupo para líderes de células da igreja', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
('Ministério de Louvor', 'Membros do ministério de música e louvor', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1));