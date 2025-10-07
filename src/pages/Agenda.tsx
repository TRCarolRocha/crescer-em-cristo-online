
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users, Cake } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface AgendaEvento {
  id: string;
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string | null;
  local: string | null;
  status: boolean;
}

interface Birthday {
  id: string;
  full_name: string;
  birth_date: string;
  birth_day: number;
  birth_month: number;
  days_until: number;
}

const Agenda = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [eventos, setEventos] = useState<AgendaEvento[]>([]);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventos();
    fetchBirthdays();
  }, []);

  const fetchEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('agenda_eventos')
        .select('*')
        .eq('status', true)
        .order('data_inicio', { ascending: true });

      if (error) throw error;
      setEventos(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os eventos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBirthdays = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, birth_date')
        .not('birth_date', 'is', null);

      if (error) throw error;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const birthdaysList: Birthday[] = [];

      data?.forEach(profile => {
        if (profile.birth_date) {
          const birthDate = new Date(profile.birth_date + 'T00:00:00');
          const thisYear = today.getFullYear();
          const nextBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
          
          if (nextBirthday < today) {
            nextBirthday.setFullYear(thisYear + 1);
          }
          
          const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntil <= 30) {
            birthdaysList.push({
              id: profile.id,
              full_name: profile.full_name || 'Sem nome',
              birth_date: profile.birth_date,
              birth_day: birthDate.getDate(),
              birth_month: birthDate.getMonth() + 1,
              days_until: daysUntil
            });
          }
        }
      });

      setBirthdays(birthdaysList.sort((a, b) => a.days_until - b.days_until));
    } catch (error) {
      console.error('Erro ao carregar aniversários:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getEventTypeColor = (titulo: string) => {
    const tituloLower = titulo.toLowerCase();
    if (tituloLower.includes('culto')) return "bg-blue-100 text-blue-800";
    if (tituloLower.includes('ensaio')) return "bg-purple-100 text-purple-800";
    if (tituloLower.includes('estudo')) return "bg-green-100 text-green-800";
    if (tituloLower.includes('evangelismo')) return "bg-orange-100 text-orange-800";
    return "bg-pink-100 text-pink-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Agenda da Igreja</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Programações e eventos da Monte Hebrom</p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="w-full sm:w-auto">
            Voltar ao Início
          </Button>
        </div>

        {/* Aniversários do Mês */}
        {birthdays.length > 0 && (
          <div className="space-y-4 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Cake className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600" />
              🎂 Aniversários do Mês
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {birthdays.map((birthday) => (
                <Card key={birthday.id} className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 hover:shadow-lg transition-shadow min-h-[100px]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{birthday.full_name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {birthday.birth_day}/{birthday.birth_month}
                        </p>
                      </div>
                      <div className="text-center">
                        <Cake className="h-8 w-8 text-pink-600 mx-auto" />
                        {birthday.days_until === 0 ? (
                          <Badge className="mt-1 bg-pink-600">Hoje!</Badge>
                        ) : (
                          <p className="text-xs text-gray-600 mt-1">
                            em {birthday.days_until} dia{birthday.days_until > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Eventos */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Próximos Eventos</h2>
          
          {eventos.length === 0 ? (
            <Card className="text-center p-6 sm:p-8">
              <CardContent>
                <Calendar className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Nenhum evento programado
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Novos eventos serão exibidos aqui quando forem adicionados.
                </p>
              </CardContent>
            </Card>
          ) : (
            eventos.map((evento) => (
              <Card key={evento.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">{evento.titulo}</h3>
                      {evento.descricao && (
                        <p className="text-gray-600 text-sm mt-1">{evento.descricao}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getEventTypeColor(evento.titulo)}`}>
                      Evento
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
                    <div className="flex items-start sm:items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                      <span className="break-words">
                        {formatDate(evento.data_inicio)}
                        {evento.data_fim && evento.data_fim !== evento.data_inicio && (
                          <span className="ml-2">até {formatDate(evento.data_fim)}</span>
                        )}
                      </span>
                    </div>
                    {evento.local && (
                      <div className="flex items-start sm:items-center">
                        <MapPin className="h-4 w-4 mr-2 text-red-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <span className="break-words">{evento.local}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Estatísticas */}
        {eventos.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Estatísticas do Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total de Eventos</span>
                  <span className="font-semibold">{eventos.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cultos</span>
                  <span className="font-semibold">
                    {eventos.filter(e => e.titulo.toLowerCase().includes('culto')).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estudos</span>
                  <span className="font-semibold">
                    {eventos.filter(e => e.titulo.toLowerCase().includes('estudo')).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Agenda;
