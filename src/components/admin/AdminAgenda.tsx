
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Edit, MapPin, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CreateEventDialog from './CreateEventDialog';
import EditEventDialog from './EditEventDialog';

interface AgendaEvento {
  id: string;
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  local: string;
  status: boolean;
  criado_em: string;
}

const AdminAgenda = () => {
  const [eventos, setEventos] = useState<AgendaEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEvento, setEditingEvento] = useState<AgendaEvento | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('agenda_eventos')
        .select('*')
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      setEventos(data || []);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os eventos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvento = async (eventoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;

    setDeleting(eventoId);
    try {
      const { error } = await supabase
        .from('agenda_eventos')
        .delete()
        .eq('id', eventoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso"
      });

      await fetchEventos();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o evento",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão da Agenda</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      <div className="grid gap-4">
        {eventos.map((evento) => (
          <Card key={evento.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-green-600 flex items-center justify-center text-white">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{evento.titulo}</h3>
                    <p className="text-gray-600">{evento.descricao}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{formatDate(evento.data_inicio)}</span>
                      {evento.data_fim && evento.data_fim !== evento.data_inicio && (
                        <>
                          <span>até</span>
                          <span>{formatDate(evento.data_fim)}</span>
                        </>
                      )}
                      {evento.local && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{evento.local}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={evento.status ? 'default' : 'secondary'}>
                    {evento.status ? 'Visível' : 'Oculto'}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditingEvento(evento)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeleteEvento(evento.id)}
                    disabled={deleting === evento.id}
                  >
                    {deleting === evento.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showCreateDialog && (
        <CreateEventDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={async () => {
            await fetchEventos();
            setShowCreateDialog(false);
          }}
        />
      )}

      {editingEvento && (
        <EditEventDialog
          evento={editingEvento}
          onClose={() => setEditingEvento(null)}
          onSuccess={async () => {
            await fetchEventos();
            setEditingEvento(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminAgenda;
