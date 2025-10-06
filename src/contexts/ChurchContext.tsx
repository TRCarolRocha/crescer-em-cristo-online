import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Church {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  headline: string | null;
  description: string | null;
  primary_color: string;
  secondary_color: string;
}

interface ChurchContextType {
  church: Church | null;
  loading: boolean;
  isIndividualUser: boolean;
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

export const useChurch = () => {
  const context = useContext(ChurchContext);
  if (context === undefined) {
    throw new Error('useChurch must be used within a ChurchProvider');
  }
  return context;
};

export const ChurchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [church, setChurch] = useState<Church | null>(null);
  const [loading, setLoading] = useState(true);
  const [isIndividualUser, setIsIndividualUser] = useState(false);

  useEffect(() => {
    const fetchUserChurch = async () => {
      if (!user) {
        setChurch(null);
        setIsIndividualUser(false);
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('church_id, churches(id, slug, name, logo_url, headline, description, primary_color, secondary_color)')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile?.churches) {
          setChurch(profile.churches as unknown as Church);
          setIsIndividualUser(false);
        } else {
          setChurch(null);
          setIsIndividualUser(true);
        }
      } catch (error) {
        console.error('Error fetching church:', error);
        setChurch(null);
        setIsIndividualUser(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserChurch();
  }, [user]);

  return (
    <ChurchContext.Provider value={{ church, loading, isIndividualUser }}>
      {children}
    </ChurchContext.Provider>
  );
};
