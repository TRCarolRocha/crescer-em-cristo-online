
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, Edit, Trash, Save, X, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CreateEventDialog from './CreateEventDialog';

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
        .order('data_inicio', { ascending: true });

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
      console.log('Salvando evento:', eventoId, 'com dados:', editData);

      const updateData = {
        titulo: editData.titulo,
        descricao: editData.descricao,
        data_inicio: editData.data_inicio,
        data_fim: editData.data_fim,
        local: editData.local,
        status: editData.status !== undefined ? editData.status : true
      };

      const { data, error } = await supabase
        .from('agenda_eventos')
        .update(updateData)
        .eq('id', eventoId)
        .select();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Evento atualizado com sucesso:', data);

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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).replace(/^./, c => c.toUpperCase());
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
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
          <Card key={evento.id} className={`${!evento.status ? 'opacity-60' : ''}`}>
            <CardContent className="p-6">
              {editingInline === evento.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Título</label>
                    <Input
                      value={editData.titulo || ''}
                      onChange={(e) => setEditData({ ...editData, titulo: e.target.value })}
                    />
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

                  <div>
                    <label className="block text-sm font-medium mb-1">Local</label>
                    <Input
                      value={editData.local || ''}
                      onChange={(e) => setEditData({ ...editData, local: e.target.value })}
                    />
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
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(evento.data_inicio)}</span>
                        </div>
                        {evento.local && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{evento.local}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={evento.status ? 'default' : 'destructive'}>
                          {evento.status ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                  </div>
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
                      variant="destructive"
                      onClick={() => deleteEvento(evento.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
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
    </div>
  );
};

export default AdminAgenda;
