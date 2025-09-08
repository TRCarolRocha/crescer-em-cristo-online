import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface SpiritualProgressData {
  user_id: string;
  points_total: number;
  level_current: string;
  level_started_at: string;
  points_diagnostics: number;
  points_tracks: number;
  points_devotionals: number;
  points_groups: number;
  activities_completed: any;
  streak_multiplier: number;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_title: string;
  achievement_description: string;
  points_awarded: number;
  earned_at: string;
  metadata: any;
}

export interface LevelProgression {
  id: string;
  user_id: string;
  from_level: string | null;
  to_level: string;
  promoted_at: string;
  points_at_promotion: number;
  time_in_previous_level_months: number;
}

export const useSpiritualProgress = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<SpiritualProgressData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progressHistory, setProgressHistory] = useState<LevelProgression[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSpiritualProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch user spiritual points
      const { data: progressData, error: progressError } = await supabase
        .from('user_spiritual_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Error fetching spiritual progress:', progressError);
        return;
      }

      // If no progress data exists, create initial record
      if (!progressData) {
        const { data: newProgress, error: createError } = await supabase
          .from('user_spiritual_points')
          .insert({
            user_id: user.id,
            points_total: 0,
            level_current: 'novo',
            level_started_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating spiritual progress:', createError);
          return;
        }

        setProgressData(newProgress);
      } else {
        setProgressData(progressData);
      }

      // Fetch achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
      } else {
        setAchievements(achievementsData || []);
      }

      // Fetch progression history
      const { data: historyData, error: historyError } = await supabase
        .from('level_progression_history')
        .select('*')
        .eq('user_id', user.id)
        .order('promoted_at', { ascending: false });

      if (historyError) {
        console.error('Error fetching progression history:', historyError);
      } else {
        setProgressHistory(historyData || []);
      }

    } catch (error) {
      console.error('Error in fetchSpiritualProgress:', error);
    } finally {
      setLoading(false);
    }
  };

  const awardPoints = async (activityType: string, points: number, activityData: any = {}) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('award_spiritual_points', {
        p_user_id: user.id,
        p_activity_type: activityType,
        p_points: points,
        p_activity_data: activityData
      });

      if (error) {
        console.error('Error awarding points:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao registrar pontos da atividade',
          variant: 'destructive'
        });
        return;
      }

      // Refresh progress data
      await fetchSpiritualProgress();

      toast({
        title: 'Pontos conquistados!',
        description: `+${points} pontos por ${activityType}`,
        variant: 'default'
      });

    } catch (error) {
      console.error('Error in awardPoints:', error);
    }
  };

  const checkLevelEligibility = async (targetLevel: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('check_level_eligibility', {
        p_user_id: user.id,
        p_target_level: targetLevel
      });

      if (error) {
        console.error('Error checking level eligibility:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error in checkLevelEligibility:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchSpiritualProgress();
  }, [user]);

  return {
    progressData,
    achievements,
    progressHistory,
    loading,
    awardPoints,
    checkLevelEligibility,
    refreshProgress: fetchSpiritualProgress
  };
};