
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar, Plus, Edit, MapPin, Trash, Save, X } from 'lucide-react';
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
  const [editingInline, setEditingInline] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<AgendaEvento>>({});
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

  const handleInlineEdit = (evento: AgendaEvento) => {
    setEditingInline(evento.id);
    setEditData(evento);
  };

  const handleCancelEdit = () => {
    setEditingInline(null);
    setEditData({});
  };

  const handleSaveInline = async (eventoId: string) => {
    try {
      const { error } = await supabase
        .from('agenda_eventos')
        .update({
          titulo: editData.titulo,
          descricao: editData.descricao,
          data_inicio: editData.data_inicio,
          data_fim: editData.data_fim,
          local: editData.local,
          status: editData.status
        })
        .eq('id', eventoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso"
      });

      setEditingInline(null);
      setEditData({});
      await fetchEventos();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive"
      });
    }
  };

  const deleteEvento = async (eventoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
      return;
    }

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

      fetchEventos();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o evento",
        variant: "destructive"
      });
    }
  };

  const toggleEventoStatus = async (eventoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('agenda_eventos')
        .update({ status: !currentStatus })
        .eq('id', eventoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Evento ${!currentStatus ? 'publicado' : 'despublicado'} com sucesso`
      });

      fetchEventos();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do evento",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
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
              {editingInline === evento.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Título</label>
                      <Input
                        value={editData.titulo || ''}
                        onChange={(e) => setEditData({ ...editData, titulo: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Local</label>
                      <Input
                        value={editData.local || ''}
                        onChange={(e) => setEditData({ ...editData, local: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <Textarea
                      value={editData.descricao || ''}
                      onChange={(e) => setEditData({ ...editData, descricao: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Data de Início</label>
                      <Input
                        type="date"
                        value={editData.data_inicio || ''}
                        onChange={(e) => setEditData({ ...editData, data_inicio: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Data de Fim</label>
                      <Input
                        type="date"
                        value={editData.data_fim || ''}
                        onChange={(e) => setEditData({ ...editData, data_fim: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editData.status || false}
                      onCheckedChange={(checked) => setEditData({ ...editData, status: checked })}
                    />
                    <label className="text-sm font-medium">Visível na Home</label>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSaveInline(evento.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
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
                    <Badge 
                      variant={evento.status ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => toggleEventoStatus(evento.id, evento.status)}
                    >
                      {evento.status ? 'Visível' : 'Oculto'}
                    </Badge>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleInlineEdit(evento)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingEvento(evento)}
                      >
                        Editar Completo
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteEvento(evento.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {eventos.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum evento cadastrado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece criando o primeiro evento da agenda
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Evento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {showCreateDialog && (
        <CreateEventDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            fetchEventos();
            setShowCreateDialog(false);
          }}
        />
      )}

      {editingEvento && (
        <EditEventDialog
          evento={editingEvento}
          onClose={() => setEditingEvento(null)}
          onSuccess={() => {
            fetchEventos();
            setEditingEvento(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminAgenda;
