
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle } from 'lucide-react';

interface WeekDay {
  day: string;
  date: string;
  completed: boolean;
}

const ProgressCalendar = () => {
  const { user } = useAuth();
  const [weekData, setWeekData] = useState<WeekDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWeekProgress();
    }
  }, [user]);

  const fetchWeekProgress = async () => {
    try {
      // Obter datas da semana atual
      const today = new Date();
      const currentWeek = [];
      
      // Começar no domingo (0) da semana atual
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        
        currentWeek.push({
          day: dayNames[i],
          date: date.toISOString().split('T')[0],
          completed: false
        });
      }

      // Buscar devocionais completados desta semana
      const dateStrings = currentWeek.map(day => day.date);
      
      const { data: devocionaisData } = await supabase
        .from('devocionais')
        .select('id, data')
        .in('data', dateStrings);

      if (devocionaisData && devocionaisData.length > 0) {
        const devocionalIds = devocionaisData.map(d => d.id);
        
        const { data: historicoData } = await supabase
          .from('devocional_historico')
          .select('devocional_id, completado')
          .eq('user_id', user.id)
          .in('devocional_id', devocionalIds)
          .eq('completado', true);

        // Marcar dias completados
        const completedDevocionalIds = historicoData?.map(h => h.devocional_id) || [];
        
        currentWeek.forEach(day => {
          const devocional = devocionaisData.find(d => d.data === day.date);
          day.completed = devocional ? completedDevocionalIds.includes(devocional.id) : false;
        });
      }

      setWeekData(currentWeek);
    } catch (error) {
      console.error('Erro ao buscar progresso semanal:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progresso da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">📅 Progresso da Semana</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 justify-between">
          {weekData.map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="text-xs font-medium text-gray-600 mb-1">
                {day.day}
              </div>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                ${day.completed 
                  ? 'bg-green-100 text-green-700 border-2 border-green-500' 
                  : 'bg-gray-100 text-gray-500 border-2 border-gray-300'
                }
              `}>
                {day.completed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-center">
          <div className="text-sm text-gray-600">
            {weekData.filter(day => day.completed).length} de 7 dias completos
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressCalendar;
