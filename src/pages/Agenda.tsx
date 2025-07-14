
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AgendaEvento {
  id: string;
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string | null;
  local: string | null;
  status: boolean;
}

const Agenda = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [eventos, setEventos] = useState<AgendaEvento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventos();
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agenda da Igreja</h1>
            <p className="text-gray-600 mt-2">Programações e eventos da Monte Hebrom</p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            Voltar ao Início
          </Button>
        </div>

        {/* Lista de Eventos */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Próximos Eventos</h2>
          
          {eventos.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent>
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum evento programado
                </h3>
                <p className="text-gray-600">
                  Novos eventos serão exibidos aqui quando forem adicionados.
                </p>
              </CardContent>
            </Card>
          ) : (
            eventos.map((evento) => (
              <Card key={evento.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{evento.titulo}</h3>
                      {evento.descricao && (
                        <p className="text-gray-600 text-sm mt-1">{evento.descricao}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(evento.titulo)}`}>
                      Evento
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                      {formatDate(evento.data_inicio)}
                      {evento.data_fim && evento.data_fim !== evento.data_inicio && (
                        <span className="ml-2">até {formatDate(evento.data_fim)}</span>
                      )}
                    </div>
                    {evento.local && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-red-600" />
                        {evento.local}
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
