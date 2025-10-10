import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useEmailTemplates = () => {
  const queryClient = useQueryClient();

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_key');
      
      if (error) throw error;
      return data;
    }
  });

  const updateTemplate = useMutation({
    mutationFn: async (data: { id: string; subject: string; html_content: string }) => {
      const { error } = await supabase
        .from('email_templates')
        .update({
          subject: data.subject,
          html_content: data.html_content,
        })
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    }
  });

  return { templates, isLoading, error, updateTemplate: updateTemplate.mutateAsync };
};
