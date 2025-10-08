
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Trophy, Target, BookOpen, History, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import WeeklyDevotionalProgress from './WeeklyDevotionalProgress';
import { getCurrentDateBR } from '@/utils/dateUtils';

interface DevocionalStats {
  streak_atual: number;
  melhor_streak: number;
  total_completados: number;
  ultimo_devocional: string | null;
}

const DevocionalDashboard = () => {
  const [stats, setStats] = useState<DevocionalStats>({
    streak_atual: 0,
    melhor_streak: 0,
    total_completados: 0,
    ultimo_devocional: null
  });
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchStats();
      fetchCompletedDates();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user?.id) return;

    try {
      // Buscar estatísticas reais do usuário
      const { data: statsData, error: statsError } = await supabase
        .from('devocional_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Erro ao buscar stats:', statsError);
        return;
      }

      if (statsData) {
        setStats(statsData);
      } else {
        // Se não há stats, buscar dados do histórico para calcular
        const { data: historicoData, error: historicoError } = await supabase
          .from('devocional_historico')
          .select(`
            id,
            completado,
            created_at,
            devocionais!inner(data)
          `)
          .eq('user_id', user.id)
          .eq('completado', true)
          .order('created_at', { ascending: false });

        if (historicoError) {
          console.error('Erro ao buscar histórico:', historicoError);
          return;
        }

        const completados = historicoData?.length || 0;
        const ultimoDevocional = historicoData && historicoData.length > 0 
          ? historicoData[0].devocionais.data 
          : null;

        // Calcular streak atual (simplificado)
        let streakAtual = 0;
        if (historicoData && historicoData.length > 0) {
          const today = getCurrentDateBR();
          const yesterday = new Date(Date.now() - 86400000);
          const yesterdayStr = getCurrentDateBR();
          
          // Verificar se fez hoje ou ontem
          const temHoje = historicoData.some(h => h.devocionais.data === today);
          const temOntem = historicoData.some(h => h.devocionais.data === yesterdayStr);
          
          if (temHoje || temOntem) {
            streakAtual = 1; // Simplificado - calcular streak completo seria mais complexo
          }
        }

        setStats({
          streak_atual: streakAtual,
          melhor_streak: Math.max(streakAtual, 1),
          total_completados: completados,
          ultimo_devocional: ultimoDevocional
        });
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedDates = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('devocional_historico')
        .select(`
          completado,
          devocionais!inner(data)
        `)
        .eq('user_id', user.id)
        .eq('completado', true);

      if (error) {
        console.error('Erro ao buscar datas completadas:', error);
        return;
      }

      const dates = data?.map(item => item.devocionais.data) || [];
      setCompletedDates(dates);
    } catch (error) {
      console.error('Erro ao buscar datas completadas:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header com título e botão de histórico */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <h2 className="text-lg md:text-2xl font-bold text-gray-900">Seu Progresso Devocional</h2>
        <Button
          variant="outline"
          onClick={() => navigate('/historico-devocional')}
          className="flex items-center gap-2 md:w-auto"
          size="sm"
        >
          <History className="h-4 w-4" />
          Ver Histórico
        </Button>
      </div>

      {/* Cards de estatísticas - Mobile: Scroll horizontal / Desktop: Grid */}
      {/* Mobile */}
      <div className="md:hidden overflow-hidden -mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-3 snap-x snap-mandatory will-change-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 min-w-[120px] flex-shrink-0 snap-start">
            <CardContent className="p-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Target className="h-3.5 w-3.5 text-blue-600" />
                <p className="text-xs font-medium text-blue-800">Sequência</p>
              </div>
              <div className="text-xl font-bold text-blue-900">{loading ? '...' : stats.streak_atual}</div>
              <p className="text-xs text-blue-600">dias</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 min-w-[120px] flex-shrink-0 snap-start">
            <CardContent className="p-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Trophy className="h-3.5 w-3.5 text-green-600" />
                <p className="text-xs font-medium text-green-800">Recorde</p>
              </div>
              <div className="text-xl font-bold text-green-900">{loading ? '...' : stats.melhor_streak}</div>
              <p className="text-xs text-green-600">dias</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 min-w-[120px] flex-shrink-0 snap-start">
            <CardContent className="p-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <BookOpen className="h-3.5 w-3.5 text-purple-600" />
                <p className="text-xs font-medium text-purple-800">Total</p>
              </div>
              <div className="text-xl font-bold text-purple-900">{loading ? '...' : stats.total_completados}</div>
              <p className="text-xs text-purple-600">feitos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 min-w-[120px] flex-shrink-0 snap-start">
            <CardContent className="p-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Calendar className="h-3.5 w-3.5 text-orange-600" />
                <p className="text-xs font-medium text-orange-800">Último</p>
              </div>
              <div className="text-xs font-bold text-orange-900">
                {loading ? '...' : stats.ultimo_devocional ? 
                  new Date(stats.ultimo_devocional).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : 
                  'Nenhum'
                }
              </div>
              <p className="text-xs text-orange-600">data</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Desktop - Grid normal */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Sequência Atual</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{loading ? '...' : stats.streak_atual}</div>
            <p className="text-xs text-blue-600">dias consecutivos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Melhor Sequência</CardTitle>
            <Trophy className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{loading ? '...' : stats.melhor_streak}</div>
            <p className="text-xs text-green-600">seu recorde</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Total Completados</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{loading ? '...' : stats.total_completados}</div>
            <p className="text-xs text-purple-600">devocionais</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Último Devocional</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-orange-900">
              {loading ? '...' : stats.ultimo_devocional ? 
                new Date(stats.ultimo_devocional).toLocaleDateString('pt-BR') : 
                'Nenhum ainda'
              }
            </div>
            <p className="text-xs text-orange-600">data do último</p>
          </CardContent>
        </Card>
      </div>

      {/* Progresso Semanal */}
      <WeeklyDevotionalProgress completedDates={completedDates} />

      {/* Card de Histórico redesenhado */}
      <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white max-w-full">
        <CardContent className="pt-4 sm:pt-6 pb-6 px-3 sm:px-4">
          <div className="text-center">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-pink-100" />
            <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2">Explore Sua Jornada Espiritual</h3>
            <p className="text-pink-100 mb-3 sm:mb-4 text-sm sm:text-base">
              Reveja seus momentos de crescimento, reflexões e orações que marcaram sua caminhada com Deus.
            </p>
            <Button 
              className="bg-white text-purple-600 hover:bg-pink-50 font-semibold text-sm sm:text-base"
              onClick={() => navigate('/historico-devocional')}
            >
              📖 Ver Meu Histórico
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevocionalDashboard;
