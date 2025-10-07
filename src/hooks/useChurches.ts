import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Church {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
}

export const useChurches = () => {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchChurches = async () => {
      try {
        const { data, error } = await supabase
          .from('churches')
          .select('id, slug, name, logo_url, is_active')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) throw error;

        setChurches(data || []);
      } catch (err) {
        console.error('Error fetching churches:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchChurches();

    // Realtime subscription for church changes
    const subscription = supabase
      .channel('churches_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'churches' }, 
        () => {
          fetchChurches();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { churches, loading, error };
};
