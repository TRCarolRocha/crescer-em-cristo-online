
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DevocionalData {
  id: string;
  tema: string;
  data: string;
}

interface DevocionalNotificationProps {
  className?: string;
}

const DevocionalNotification = ({ className = '' }: DevocionalNotificationProps) => {
  const [devocionalHoje, setDevocionalHoje] = useState<DevocionalData | null>(null);
  const [jaRealizado, setJaRealizado] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchDevocionalHoje();
    }
  }, [user]);

  const fetchDevocionalHoje = async () => {
    if (!user?.id) return;

    try {
      const hoje = new Date().toISOString().split('T')[0];

      // Buscar devocional de hoje
      const { data: devocionalData, error: devocionalError } = await supabase
        .from('devocionais')
        .select('id, tema, data')
        .eq('data', hoje)
        .maybeSingle();

      if (devocionalError) {
        console.error('Erro ao buscar devocional:', devocionalError);
        setLoading(false);
        return;
      }

      setDevocionalHoje(devocionalData);

      // Se existe devocional de hoje, verificar se já foi realizado
      if (devocionalData) {
        const { data: historicoData, error: historicoError } = await supabase
          .from('devocional_historico')
          .select('id')
          .eq('user_id', user.id)
          .eq('devocional_id', devocionalData.id)
          .eq('completado', true)
          .maybeSingle();

        if (historicoError) {
          console.error('Erro ao verificar histórico:', historicoError);
        } else {
          setJaRealizado(!!historicoData);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar devocional de hoje:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) return null;

  if (!devocionalHoje) {
    return (
      <Card className={`border-yellow-200 bg-yellow-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Nenhum devocional disponível para hoje
              </p>
              <p className="text-xs text-yellow-600">
                Aguarde a publicação do devocional diário
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (jaRealizado) {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Parabéns! Você já fez seu devocional de hoje
              </p>
              <p className="text-xs text-green-600">
                {devocionalHoje.tema}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                Seu devocional de hoje está disponível!
              </p>
              <p className="text-xs text-blue-600">
                {devocionalHoje.tema}
              </p>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => navigate('/devocional')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Começar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DevocionalNotification;
