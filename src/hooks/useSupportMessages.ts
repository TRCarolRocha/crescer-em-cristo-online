import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SupportMessage {
  id: string;
  remetente_id: string;
  destinatario_id: string | null;
  conteudo: string;
  enviada_em: string;
  lida: boolean;
  message_type: 'church_leadership' | 'super_admin_support';
  parent_message_id: string | null;
  read_at: string | null;
  replied_at: string | null;
  subject: string | null;
  // Joined data
  remetente?: {
    full_name: string;
    avatar_url: string | null;
  };
  replies?: SupportMessage[];
}

export const useSupportMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar mensagens de suporte do usuário
  const { data: userMessages, isLoading: userMessagesLoading, refetch: refetchUserMessages } = useQuery({
    queryKey: ['support-messages-user', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .eq('remetente_id', user.id)
        .eq('message_type', 'super_admin_support')
        .is('parent_message_id', null)
        .order('enviada_em', { ascending: false });

      if (error) throw error;

      // Buscar respostas para cada mensagem
      const messagesWithReplies = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: replies } = await supabase
            .from('mensagens')
            .select('*')
            .eq('parent_message_id', msg.id)
            .order('enviada_em', { ascending: true });

          return { ...msg, replies: replies || [] };
        })
      );

      return messagesWithReplies as SupportMessage[];
    },
    enabled: !!user,
  });

  // Buscar todas as mensagens de suporte (Super Admin)
  const { data: allMessages, isLoading: allMessagesLoading, refetch: refetchAllMessages } = useQuery({
    queryKey: ['support-messages-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .eq('message_type', 'super_admin_support')
        .is('parent_message_id', null)
        .order('enviada_em', { ascending: false });

      if (error) throw error;

      // Buscar perfis dos remetentes e respostas
      const messagesWithDetails = await Promise.all(
        (data || []).map(async (msg) => {
          const [profileResult, repliesResult] = await Promise.all([
            supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', msg.remetente_id)
              .single(),
            supabase
              .from('mensagens')
              .select('*')
              .eq('parent_message_id', msg.id)
              .order('enviada_em', { ascending: true })
          ]);

          return {
            ...msg,
            remetente: profileResult.data || { full_name: 'Usuário', avatar_url: null },
            replies: repliesResult.data || []
          };
        })
      );

      return messagesWithDetails as SupportMessage[];
    },
  });

  // Contar mensagens não lidas (Super Admin)
  const { data: unreadCount } = useQuery({
    queryKey: ['support-messages-unread-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('mensagens')
        .select('*', { count: 'exact', head: true })
        .eq('message_type', 'super_admin_support')
        .is('parent_message_id', null)
        .is('read_at', null);

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  // Enviar nova mensagem de suporte
  const sendMessage = useMutation({
    mutationFn: async ({ subject, content }: { subject: string; content: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('mensagens')
        .insert({
          remetente_id: user.id,
          conteudo: content,
          message_type: 'super_admin_support',
          subject
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Mensagem enviada!",
        description: "Sua mensagem foi enviada para o suporte Hodos."
      });
      queryClient.invalidateQueries({ queryKey: ['support-messages-user'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua mensagem.",
        variant: "destructive"
      });
      console.error('Error sending message:', error);
    }
  });

  // Responder mensagem (Super Admin)
  const replyMessage = useMutation({
    mutationFn: async ({ parentId, content }: { parentId: string; content: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('mensagens')
        .insert({
          remetente_id: user.id,
          conteudo: content,
          message_type: 'super_admin_support',
          parent_message_id: parentId
        })
        .select()
        .single();

      if (error) throw error;

      // Marcar mensagem original como respondida
      await supabase
        .from('mensagens')
        .update({ replied_at: new Date().toISOString() })
        .eq('id', parentId);

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Resposta enviada!",
        description: "Sua resposta foi enviada ao usuário."
      });
      queryClient.invalidateQueries({ queryKey: ['support-messages-all'] });
      queryClient.invalidateQueries({ queryKey: ['support-messages-user'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a resposta.",
        variant: "destructive"
      });
      console.error('Error replying:', error);
    }
  });

  // Marcar como lida (Super Admin)
  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('mensagens')
        .update({ read_at: new Date().toISOString(), lida: true })
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-messages-all'] });
      queryClient.invalidateQueries({ queryKey: ['support-messages-unread-count'] });
    }
  });

  return {
    // User messages
    userMessages: userMessages || [],
    userMessagesLoading,
    refetchUserMessages,
    sendMessage,

    // Admin messages
    allMessages: allMessages || [],
    allMessagesLoading,
    refetchAllMessages,
    replyMessage,
    markAsRead,
    unreadCount: unreadCount || 0
  };
};
