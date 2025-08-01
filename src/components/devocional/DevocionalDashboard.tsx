
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Flame, Trophy, Calendar, BookOpen, ChevronRight } from 'lucide-react';
import ProgressCalendar from './ProgressCalendar';

interface DevocionalStats {
  streak_atual: number;
  melhor_streak: number;
  total_completados: number;
  ultimo_devocional: string | null;
}

interface DevocionalHistorico {
  id: string;
  devocional: {
    data: string;
    tema: string;
  };
  resposta_1: string;
  resposta_2: string;
  resposta_3: string;
  oracao: string;
  completado: boolean;
  created_at: string;
}

const DevocionalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DevocionalStats | null>(null);
  const [historico, setHistorico] = useState<DevocionalHistorico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchHistorico();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data } = await supabase
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

  const fetchHistorico = async () => {
    try {
      const { data } = await supabase
        .from('devocional_historico')
        .select(`
          id,
          resposta_1,
          resposta_2,
          resposta_3,
          oracao,
          completado,
          created_at,
          devocionais!inner(data, tema)
        `)
        .eq('user_id', user.id)
        .eq('completado', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        const formattedData = data.map(item => ({
          id: item.id,
          devocional: {
            data: item.devocionais.data,
            tema: item.devocionais.tema
          },
          resposta_1: item.resposta_1 || '',
          resposta_2: item.resposta_2 || '',
          resposta_3: item.resposta_3 || '',
          oracao: item.oracao || '',
          completado: item.completado,
          created_at: item.created_at
        }));
        setHistorico(formattedData);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Sequência Atual</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.streak_atual || 0} dias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Melhor Sequência</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.melhor_streak || 0} dias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Completados</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_completados || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendário de Progresso */}
      <ProgressCalendar />

      {/* Histórico Recente */}
      <Card>
        <CardHeader>
          <CardTitle>📖 Devocionais Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {historico.length > 0 ? (
            <div className="space-y-4">
              {historico.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/devocional?date=${item.devocional.data}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {item.devocional.tema}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {formatDate(item.devocional.data)}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {item.oracao && item.oracao.substring(0, 100)}...
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => navigate('/devocional/historico')}
              >
                Ver Histórico Completo
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Você ainda não completou nenhum devocional.</p>
              <Button onClick={() => navigate('/devocional')}>
                Começar Agora
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DevocionalDashboard;
