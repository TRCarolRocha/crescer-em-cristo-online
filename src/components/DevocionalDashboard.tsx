import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Flame, BookOpen, TrendingUp, CheckCircle, X, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DevocionalStats {
  streak_atual: number;
  melhor_streak: number;
  total_completados: number;
  ultimo_devocional: string | null;
}

interface WeekProgress {
  [key: string]: boolean;
}

const DevocionalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DevocionalStats | null>(null);
  const [weekProgress, setWeekProgress] = useState<WeekProgress>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDevocionalStats();
      fetchWeekProgress();
    }
  }, [user]);

  const fetchDevocionalStats = async () => {
    try {
      const { data, error } = await supabase
        .from('devocional_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const fetchWeekProgress = async () => {
    try {
      const hoje = new Date();
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // Domingo

      const progress: WeekProgress = {};
      const diasSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

      for (let i = 0; i < 7; i++) {
        const data = new Date(inicioSemana);
        data.setDate(inicioSemana.getDate() + i);
        const dataFormatada = data.toLocaleDateString('pt-BR', {
          timeZone: 'America/Sao_Paulo'
        }).split('/').reverse().join('-');

        // Verificar se existe devocional para esta data
        const { data: devocional } = await supabase
          .from('devocionais')
          .select('id')
          .eq('data', dataFormatada)
          .single();

        if (devocional) {
          // Verificar se foi completado
          const { data: historico } = await supabase
            .from('devocional_historico')
            .select('completado')
            .eq('user_id', user.id)
            .eq('devocional_id', devocional.id)
            .single();

          progress[diasSemana[i]] = historico?.completado || false;
        } else {
          progress[diasSemana[i]] = false;
        }
      }

      setWeekProgress(progress);
    } catch (error) {
      console.error('Erro ao buscar progresso da semana:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  const diasSemana = [
    { key: 'dom', label: 'Dom' },
    { key: 'seg', label: 'Seg' },
    { key: 'ter', label: 'Ter' },
    { key: 'qua', label: 'Qua' },
    { key: 'qui', label: 'Qui' },
    { key: 'sex', label: 'Sex' },
    { key: 'sab', label: 'Sáb' }
  ];

  return (
    <div className="space-y-6">
      {/* Header com botão de histórico */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Meu Progresso Devocional</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/historico-devocional')}
          className="flex items-center gap-2"
        >
          <History className="h-4 w-4" />
          Ver Histórico
        </Button>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Streak Atual</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats?.streak_atual || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Melhor Streak</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.melhor_streak || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Completados</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.total_completados || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso da Semana */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Progresso desta Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-2 sm:gap-4">
            {diasSemana.map(({ key, label }) => (
              <div key={key} className="flex flex-col items-center">
                <div className="text-xs text-gray-600 mb-2 font-medium">
                  {label}
                </div>
                <div className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold
                  ${weekProgress[key] 
                    ? 'bg-green-100 border-green-500 text-green-700' 
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                  }
                `}>
                  {weekProgress[key] ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <Badge variant="outline" className="text-xs">
              {Object.values(weekProgress).filter(Boolean).length}/7 dias desta semana
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevocionalDashboard;
