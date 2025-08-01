
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, Flame, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface DevocionalStats {
  streak_atual: number;
  total_completados: number;
  melhor_streak: number;
}

const DevocionalNotification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [devocionalFeito, setDevocionalFeito] = useState(false);
  const [stats, setStats] = useState<DevocionalStats | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkDevocionalStatus();
      fetchStats();
    }
  }, [user]);

  const checkDevocionalStatus = async () => {
    try {
      const hoje = new Date().toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo'
      }).split('/').reverse().join('-');

      // Buscar devocional de hoje
      const { data: devocionalData } = await supabase
        .from('devocionais')
        .select('id')
        .eq('data', hoje)
        .single();

      if (devocionalData) {
        // Verificar se já foi feito hoje
        const { data: historicoData } = await supabase
          .from('devocional_historico')
          .select('completado')
          .eq('user_id', user.id)
          .eq('devocional_id', devocionalData.id)
          .single();

        setDevocionalFeito(historicoData?.completado || false);
      }
    } catch (error) {
      console.error('Erro ao verificar status do devocional:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await supabase
        .from('devocional_stats')
        .select('streak_atual, total_completados, melhor_streak')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  if (loading || !user || devocionalFeito || dismissed) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                📖 Devocional de Hoje Disponível!
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Continue sua jornada espiritual. Já são{' '}
                <span className="font-semibold text-blue-600">
                  {stats?.total_completados || 0} devocionais
                </span>{' '}
                completados!
              </p>
              {stats && stats.streak_atual > 0 && (
                <div className="flex items-center gap-2 text-xs text-orange-600">
                  <Flame className="h-4 w-4" />
                  <span className="font-medium">
                    {stats.streak_atual} dias consecutivos
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate('/devocional')}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Fazer Agora
            </Button>
            <Button
              onClick={() => setDismissed(true)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DevocionalNotification;
