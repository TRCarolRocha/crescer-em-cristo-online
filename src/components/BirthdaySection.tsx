
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Cake, Gift } from 'lucide-react';

interface Birthday {
  id: string;
  full_name: string;
  birth_date: string;
  days_until: number;
}

const BirthdaySection = () => {
  const { user } = useAuth();
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUpcomingBirthdays();
    }
  }, [user]);

  const fetchUpcomingBirthdays = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, birth_date')
        .not('birth_date', 'is', null)
        .order('birth_date');

      if (error) throw error;

      const today = new Date();
      const upcomingBirthdays: Birthday[] = [];

      data?.forEach(profile => {
        if (profile.birth_date && profile.full_name) {
          const birthDate = new Date(profile.birth_date);
          const thisYear = today.getFullYear();
          
          // Calcular próximo aniversário
          const nextBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
          
          // Se já passou este ano, considerar próximo ano
          if (nextBirthday < today) {
            nextBirthday.setFullYear(thisYear + 1);
          }
          
          const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          // Mostrar apenas próximos 30 dias
          if (daysUntil <= 30) {
            upcomingBirthdays.push({
              id: profile.id,
              full_name: profile.full_name,
              birth_date: profile.birth_date,
              days_until: daysUntil
            });
          }
        }
      });

      // Ordenar por dias até o aniversário
      upcomingBirthdays.sort((a, b) => a.days_until - b.days_until);
      
      setBirthdays(upcomingBirthdays.slice(0, 5)); // Mostrar apenas os 5 próximos
    } catch (error) {
      console.error('Erro ao buscar aniversários:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading || birthdays.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-pink-800">
          <Cake className="h-5 w-5" />
          Aniversários Próximos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {birthdays.map((birthday) => (
          <div key={birthday.id} className="flex items-center justify-between bg-white/70 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="bg-pink-100 p-2 rounded-full">
                <Gift className="h-4 w-4 text-pink-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {birthday.full_name}
                </p>
                <p className="text-xs text-gray-600">
                  {new Date(birthday.birth_date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long'
                  })}
                </p>
              </div>
            </div>
            
            <Badge 
              variant="outline" 
              className={`text-xs ${
                birthday.days_until === 0 
                  ? 'bg-pink-100 text-pink-700 border-pink-300' 
                  : birthday.days_until <= 7
                    ? 'bg-orange-100 text-orange-700 border-orange-300'
                    : 'bg-blue-100 text-blue-700 border-blue-300'
              }`}
            >
              {birthday.days_until === 0 
                ? 'Hoje! 🎉' 
                : birthday.days_until === 1
                  ? 'Amanhã'
                  : `${birthday.days_until} dias`
              }
            </Badge>
          </div>
        ))}
        
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            <Calendar className="h-3 w-3 inline mr-1" />
            Próximos 30 dias
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BirthdaySection;
