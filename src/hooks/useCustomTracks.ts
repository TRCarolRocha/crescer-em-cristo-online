import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CustomTrack {
  id: string;
  title: string;
  description: string | null;
  level: string;
  difficulty: string | null;
  duration: string | null;
  is_custom: boolean;
  visibility: 'private' | 'shared' | 'public';
  created_by: string;
  created_at: string;
  lessons?: number;
}

export interface TrackContent {
  id: string;
  trilha_id: string;
  titulo: string;
  descricao: string | null;
  texto: string | null;
  video_url: string | null;
  pdf_url: string | null;
  ordem: number;
}

export const useCustomTracks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tracks, isLoading, error } = useQuery({
    queryKey: ['custom-tracks', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('discipleship_tracks')
        .select('*')
        .eq('is_custom', true)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CustomTrack[];
    },
    enabled: !!user,
  });

  const createTrack = useMutation({
    mutationFn: async (trackData: Partial<CustomTrack>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('discipleship_tracks')
        .insert([{
          title: trackData.title || '',
          description: trackData.description,
          level: trackData.level || 'novo',
          difficulty: trackData.difficulty,
          duration: trackData.duration,
          is_custom: true,
          created_by: user.id,
          visibility: trackData.visibility || 'private',
          lessons: 0,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-tracks'] });
      toast.success('Trilha criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar trilha: ${error.message}`);
    },
  });

  const updateTrack = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustomTrack> & { id: string }) => {
      const { data, error } = await supabase
        .from('discipleship_tracks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-tracks'] });
      toast.success('Trilha atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar trilha: ${error.message}`);
    },
  });

  const deleteTrack = useMutation({
    mutationFn: async (trackId: string) => {
      // First delete all contents
      await supabase.from('conteudos').delete().eq('trilha_id', trackId);

      // Then delete the track
      const { error } = await supabase
        .from('discipleship_tracks')
        .delete()
        .eq('id', trackId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-tracks'] });
      toast.success('Trilha excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir trilha: ${error.message}`);
    },
  });

  return {
    tracks: tracks || [],
    isLoading,
    error,
    createTrack,
    updateTrack,
    deleteTrack,
  };
};
