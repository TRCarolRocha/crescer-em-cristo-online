
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DevocionalStatus {
  hasDevocionalToday: boolean;
  isCompleted: boolean;
  streak: number;
  devocionalTema?: string;
}

const DevocionalNotification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<DevocionalStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkDevocionalStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkDevocionalStatus = async () => {
    try {
      const hoje = new Date();
      const hojeFormatado = hoje.toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo'
      }).split('/').reverse().join('-');

      // Verificar se há devocional hoje
      const { data: devocional } = await supabase
        .from('devocionais')
        .select('tema')
        .eq('data', hojeFormatado)
        .single();

      if (!devocional) {
        setLoading(false);
        return;
      }

      // Verificar se já foi completado hoje
      const { data: historico } = await supabase
        .from('devocional_historico')
        .select('completado')
        .eq('user_id', user.id)
        .eq('devocional_id', devocional.id)
        .single();

      // Buscar streak atual
      const { data: stats } = await supabase
        .from('devocional_stats')
        .select('streak_atual')
        .eq('user_id', user.id)
        .single();

      setStatus({
        hasDevocionalToday: true,
        isCompleted: historico?.completado || false,
        streak: stats?.streak_atual || 0,
        devocionalTema: devocional.tema
      });
    } catch (error) {
      console.error('Erro ao verificar status do devocional:', error);
    } finally {
      setLoading(false);
    }
  };

  // Não mostrar se não há usuário, está carregando, foi dispensado, ou não há devocional
  if (!user || loading || dismissed || !status?.hasDevocionalToday) {
    return null;
  }

  // Se já completou hoje, mostrar notificação de parabéns mais discreta
  if (status.isCompleted) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6 relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0 text-green-600 hover:text-green-800"
          onClick={() => setDismissed(true)}
        >
          <X className="h-3 w-3" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-green-800 text-sm">
              Devocional de hoje concluído! 🎉
            </h4>
            <p className="text-green-700 text-xs">
              Streak atual: {status.streak} dias consecutivos
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Notificação principal para devocional pendente
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md mb-6 relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
        onClick={() => setDismissed(true)}
      >
        <X className="h-3 w-3" />
      </Button>
      
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-full animate-pulse">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-blue-900 text-sm">
                Seu devocional de hoje está disponível!
              </h4>
              <Clock className="h-3 w-3 text-blue-600" />
            </div>
            
            {status.devocionalTema && (
              <p className="text-blue-700 text-xs mb-2 font-medium">
                Tema: "{status.devocionalTema}"
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <p className="text-blue-600 text-xs">
                Streak atual: {status.streak} dias
              </p>
              
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-7"
                onClick={() => navigate('/devocional')}
              >
                Fazer Devocional
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DevocionalNotification;
