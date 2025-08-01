
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Cake, Calendar } from 'lucide-react';

interface Aniversariante {
  id: string;
  full_name: string;
  birth_date: string;
  avatar_url?: string;
}

const BirthdaySection = () => {
  const [aniversariantes, setAniversariantes] = useState<Aniversariante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAniversariantes();
  }, []);

  const fetchAniversariantes = async () => {
    try {
      const hoje = new Date();
      const mesAtual = hoje.getMonth() + 1;
      
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, birth_date, avatar_url')
        .not('birth_date', 'is', null)
        .order('birth_date');

      if (data) {
        // Filtrar aniversariantes do mês atual
        const aniversariantesDoMes = data.filter(person => {
          if (!person.birth_date) return false;
          const birthMonth = new Date(person.birth_date + 'T00:00:00').getMonth() + 1;
          return birthMonth === mesAtual;
        });

        // Ordenar por dia do mês
        aniversariantesDoMes.sort((a, b) => {
          const dayA = new Date(a.birth_date + 'T00:00:00').getDate();
          const dayB = new Date(b.birth_date + 'T00:00:00').getDate();
          return dayA - dayB;
        });

        setAniversariantes(aniversariantesDoMes);
      }
    } catch (error) {
      console.error('Erro ao buscar aniversariantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBirthday = (birthDate: string) => {
    const date = new Date(birthDate + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC'
    });
  };

  const isToday = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate + 'T00:00:00');
    return today.getDate() === birth.getDate() && today.getMonth() === birth.getMonth();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cake className="h-5 w-5 text-pink-600" />
            Aniversariantes do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (aniversariantes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cake className="h-5 w-5 text-pink-600" />
            Aniversariantes do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-600">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>Nenhum aniversariante este mês</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cake className="h-5 w-5 text-pink-600" />
          🎉 Aniversariantes do Mês
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {aniversariantes.map((person) => (
            <div
              key={person.id}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-colors
                ${isToday(person.birth_date)
                  ? 'bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300'
                  : 'bg-gray-50 hover:bg-gray-100'
                }
              `}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold
                ${isToday(person.birth_date)
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }
              `}>
                {person.full_name?.charAt(0) || '?'}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  {person.full_name || 'Nome não informado'}
                  {isToday(person.birth_date) && (
                    <span className="ml-2 text-pink-600">🎂</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {formatBirthday(person.birth_date)}
                  {isToday(person.birth_date) && (
                    <span className="ml-2 text-pink-600 font-medium">HOJE!</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BirthdaySection;
