import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSubscriptionAccess } from './useSubscriptionAccess';

export interface SmallGroup {
  id: string;
  name: string;
  description: string | null;
  leader_id: string;
  max_members: number;
  invite_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  members_count?: number;
  leader?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export interface SmallGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'member' | 'co-leader';
  joined_at: string;
  profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export interface SmallGroupTrack {
  id: string;
  group_id: string;
  track_id: string;
  assigned_at: string;
  due_date: string | null;
  track?: {
    title: string;
    description: string | null;
    level: string;
  };
}

export const useSmallGroup = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { access } = useSubscriptionAccess();

  // Buscar grupo do líder (usuário atual)
  const { data: myGroup, isLoading: myGroupLoading, refetch: refetchMyGroup } = useQuery({
    queryKey: ['my-small-group', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('small_groups')
        .select('*')
        .eq('leader_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data as SmallGroup | null;
    },
    enabled: !!user,
  });

  // Buscar grupos em que o usuário é membro
  const { data: memberGroups, isLoading: memberGroupsLoading } = useQuery({
    queryKey: ['member-small-groups', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('small_group_members')
        .select(`
          *,
          small_groups (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data?.map(m => m.small_groups) as SmallGroup[] || [];
    },
    enabled: !!user,
  });

  // Buscar membros do grupo
  const { data: members, isLoading: membersLoading, refetch: refetchMembers } = useQuery({
    queryKey: ['small-group-members', myGroup?.id],
    queryFn: async () => {
      if (!myGroup) return [];

      const { data, error } = await supabase
        .from('small_group_members')
        .select('*')
        .eq('group_id', myGroup.id)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      // Buscar perfis dos membros
      const membersWithProfiles = await Promise.all(
        (data || []).map(async (member) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', member.user_id)
            .single();

          return { ...member, profile } as SmallGroupMember;
        })
      );

      return membersWithProfiles;
    },
    enabled: !!myGroup?.id,
  });

  // Buscar trilhas do grupo
  const { data: tracks, isLoading: tracksLoading, refetch: refetchTracks } = useQuery({
    queryKey: ['small-group-tracks', myGroup?.id],
    queryFn: async () => {
      if (!myGroup) return [];

      const { data, error } = await supabase
        .from('small_group_tracks')
        .select(`
          *,
          discipleship_tracks (title, description, level)
        `)
        .eq('group_id', myGroup.id)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data?.map(t => ({
        ...t,
        track: t.discipleship_tracks
      })) as SmallGroupTrack[] || [];
    },
    enabled: !!myGroup?.id,
  });

  // Criar grupo
  const createGroup = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      if (!user) throw new Error('Usuário não autenticado');
      if (!access.canCreateSmallGroup) throw new Error('Seu plano não permite criar grupos');

      const { data, error } = await supabase
        .from('small_groups')
        .insert({
          name,
          description,
          leader_id: user.id,
          max_members: access.smallGroupMemberLimit || 10
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Grupo criado!",
        description: "Seu grupo foi criado com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ['my-small-group'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o grupo.",
        variant: "destructive"
      });
      console.error('Error creating group:', error);
    }
  });

  // Atualizar grupo
  const updateGroup = useMutation({
    mutationFn: async ({ id, name, description }: { id: string; name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('small_groups')
        .update({ name, description, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Grupo atualizado!",
        description: "As informações do grupo foram atualizadas."
      });
      queryClient.invalidateQueries({ queryKey: ['my-small-group'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o grupo.",
        variant: "destructive"
      });
      console.error('Error updating group:', error);
    }
  });

  // Deletar grupo
  const deleteGroup = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('small_groups')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Grupo excluído",
        description: "O grupo foi excluído com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ['my-small-group'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o grupo.",
        variant: "destructive"
      });
      console.error('Error deleting group:', error);
    }
  });

  // Entrar em grupo via código
  const joinGroup = useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar grupo pelo código
      const { data: group, error: groupError } = await supabase
        .from('small_groups')
        .select('id, max_members')
        .eq('invite_code', inviteCode.toLowerCase())
        .eq('is_active', true)
        .single();

      if (groupError || !group) throw new Error('Código de convite inválido');

      // Verificar se já é membro
      const { data: existing } = await supabase
        .from('small_group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) throw new Error('Você já é membro deste grupo');

      // Adicionar membro
      const { error } = await supabase
        .from('small_group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'member'
        });

      if (error) {
        if (error.message.includes('limite')) {
          throw new Error('O grupo está cheio');
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Você entrou no grupo!",
        description: "Agora você faz parte deste grupo."
      });
      queryClient.invalidateQueries({ queryKey: ['member-small-groups'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível entrar no grupo.",
        variant: "destructive"
      });
    }
  });

  // Remover membro
  const removeMember = useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      const { error } = await supabase
        .from('small_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Membro removido",
        description: "O membro foi removido do grupo."
      });
      queryClient.invalidateQueries({ queryKey: ['small-group-members'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro.",
        variant: "destructive"
      });
      console.error('Error removing member:', error);
    }
  });

  // Atualizar role do membro
  const updateMemberRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: 'member' | 'co-leader' }) => {
      const { error } = await supabase
        .from('small_group_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Função atualizada",
        description: "A função do membro foi atualizada."
      });
      queryClient.invalidateQueries({ queryKey: ['small-group-members'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a função.",
        variant: "destructive"
      });
      console.error('Error updating member role:', error);
    }
  });

  // Atribuir trilha ao grupo
  const assignTrack = useMutation({
    mutationFn: async ({ groupId, trackId, dueDate }: { groupId: string; trackId: string; dueDate?: string }) => {
      const { data, error } = await supabase
        .from('small_group_tracks')
        .insert({
          group_id: groupId,
          track_id: trackId,
          due_date: dueDate || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Trilha atribuída!",
        description: "A trilha foi atribuída ao grupo."
      });
      queryClient.invalidateQueries({ queryKey: ['small-group-tracks'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atribuir a trilha.",
        variant: "destructive"
      });
      console.error('Error assigning track:', error);
    }
  });

  // Remover trilha do grupo
  const removeTrack = useMutation({
    mutationFn: async (trackAssignmentId: string) => {
      const { error } = await supabase
        .from('small_group_tracks')
        .delete()
        .eq('id', trackAssignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Trilha removida",
        description: "A trilha foi removida do grupo."
      });
      queryClient.invalidateQueries({ queryKey: ['small-group-tracks'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível remover a trilha.",
        variant: "destructive"
      });
      console.error('Error removing track:', error);
    }
  });

  return {
    // Group data
    myGroup,
    myGroupLoading,
    refetchMyGroup,
    memberGroups: memberGroups || [],
    memberGroupsLoading,
    
    // Members
    members: members || [],
    membersLoading,
    refetchMembers,
    
    // Tracks
    tracks: tracks || [],
    tracksLoading,
    refetchTracks,
    
    // Mutations
    createGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    removeMember,
    updateMemberRole,
    assignTrack,
    removeTrack,
    
    // Access
    canCreateGroup: access.canCreateSmallGroup,
    memberLimit: access.smallGroupMemberLimit || 10
  };
};
