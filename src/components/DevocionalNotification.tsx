
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, X, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DevocionalHoje {
  id?: string;
  tema: string;
  data?: string;
}

interface UserStats {
  streak_atual: number;
  ja_fez_hoje: boolean;
}

const DevocionalNotification = () => {
  const [devocionalHoje, setDevocionalHoje] = useState<DevocionalHoje | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({ streak_atual: 0, ja_fez_hoje: false });
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchDevocionalHoje();
      fetchUserStats();
    }
  }, [user]);

  const fetchDevocionalHoje = async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('devocionais')
        .select('id, tema')
        .eq('data', hoje)
        .eq('ativo', true)
        .single();

      if (error) {
        console.log('Nenhum devocional encontrado para hoje:', error);
        // Fallback com devocional mock para desenvolvimento
        setDevocionalHoje({
          tema: "Confiando em Deus em Tempos Difíceis",
          data: hoje
        });
      } else if (data) {
        setDevocionalHoje({
          id: data.id,
          tema: data.tema,
          data: hoje
        });
      }
    } catch (error) {
      console.error('Erro ao buscar devocional de hoje:', error);
      // Fallback com devocional mock
      setDevocionalHoje({
        tema: "Confiando em Deus em Tempos Difíceis",
        data: new Date().toISOString().split('T')[0]
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!user?.id) return;

    try {
      // Verificar se já fez o devocional hoje
      const hoje = new Date().toISOString().split('T')[0];
      
      const { data: historicoData, error: historicoError } = await supabase
        .from('devocional_historico')
        .select('*')
        .eq('user_id', user.id)
        .eq('data_completado', hoje);

      if (historicoError) {
        console.error('Erro ao verificar histórico:', historicoError);
      }

      const jaFezHoje = historicoData && historicoData.length > 0;

      // Mock de stats para desenvolvimento
      setUserStats({
        streak_atual: 3,
        ja_fez_hoje: jaFezHoje || false
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas do usuário:', error);
      setUserStats({ streak_atual: 0, ja_fez_hoje: false });
    }
  };

  const handleFecharNotificacao = () => {
    setIsVisible(false);
  };

  const handleIrParaDevocional = () => {
    navigate('/devocional');
  };

  // Não mostrar se não há usuário, não há devocional, ou usuário já fez hoje, ou não está visível
  if (!user || !devocionalHoje || userStats.ja_fez_hoje || !isVisible || loading) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg mb-6">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Devocional de Hoje</h3>
              <p className="text-blue-100 mb-3">{devocionalHoje.tema}</p>
              
              <div className="flex items-center gap-4 text-sm text-blue-100 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date().toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center gap-1">
                  🔥 Sequência: {userStats.streak_atual} dias
                </div>
              </div>
              
              <Button 
                onClick={handleIrParaDevocional}
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                size="sm"
              >
                Fazer Agora
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFecharNotificacao}
            className="text-white/80 hover:text-white hover:bg-white/20 p-1 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DevocionalNotification;
