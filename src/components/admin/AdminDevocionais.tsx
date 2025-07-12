
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Plus, Edit, Trash, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CreateDevocionalDialog from './CreateDevocionalDialog';
import EditDevocionalDialog from './EditDevocionalDialog';

interface Devocional {
  id: string;
  tema: string;
  data: string;
  versiculo: string;
  referencia: string;
  texto_central: string;
  pergunta_1: string;
  pergunta_2: string;
  pergunta_3: string;
}

const AdminDevocionais = () => {
  const [devocionais, setDevocionais] = useState<Devocional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingDevocional, setEditingDevocional] = useState<Devocional | null>(null);
  const [editingInline, setEditingInline] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Devocional>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchDevocionais();
  }, []);

  const fetchDevocionais = async () => {
    try {
      const { data, error } = await supabase
        .from('devocionais')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;
      setDevocionais(data || []);
    } catch (error) {
      console.error('Erro ao buscar devocionais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os devocionais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInlineEdit = (devocional: Devocional) => {
    setEditingInline(devocional.id);
    setEditData(devocional);
  };

  const handleCancelEdit = () => {
    setEditingInline(null);
    setEditData({});
  };

  const handleSaveInline = async (devocionalId: string) => {
    try {
      const { error } = await supabase
        .from('devocionais')
        .update({
          tema: editData.tema,
          data: editData.data,
          versiculo: editData.versiculo,
          referencia: editData.referencia,
          texto_central: editData.texto_central,
          pergunta_1: editData.pergunta_1,
          pergunta_2: editData.pergunta_2,
          pergunta_3: editData.pergunta_3,
          updated_at: new Date().toISOString()
        })
        .eq('id', devocionalId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Devocional atualizado com sucesso"
      });

      setEditingInline(null);
      setEditData({});
      await fetchDevocionais();
    } catch (error) {
      console.error('Erro ao salvar devocional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive"
      });
    }
  };

  const deleteDevocional = async (devocionalId: string) => {
    if (!confirm('Tem certeza que deseja excluir este devocional? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('devocionais')
        .delete()
        .eq('id', devocionalId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Devocional excluído com sucesso"
      });

      fetchDevocionais();
    } catch (error) {
      console.error('Erro ao excluir devocional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o devocional",
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
        <h2 className="text-2xl font-bold">Gestão de Devocionais</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Devocional
        </Button>
      </div>

      <div className="grid gap-4">
        {devocionais.map((devocional) => (
          <Card key={devocional.id}>
            <CardContent className="p-6">
              {editingInline === devocional.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Data</label>
                      <Input
                        type="date"
                        value={editData.data || ''}
                        onChange={(e) => setEditData({ ...editData, data: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tema</label>
                      <Input
                        value={editData.tema || ''}
                        onChange={(e) => setEditData({ ...editData, tema: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Versículo</label>
                      <Textarea
                        value={editData.versiculo || ''}
                        onChange={(e) => setEditData({ ...editData, versiculo: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Referência</label>
                      <Input
                        value={editData.referencia || ''}
                        onChange={(e) => setEditData({ ...editData, referencia: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Texto Central</label>
                    <Textarea
                      value={editData.texto_central || ''}
                      onChange={(e) => setEditData({ ...editData, texto_central: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Perguntas de Reflexão</label>
                    <Textarea
                      placeholder="Pergunta 1"
                      value={editData.pergunta_1 || ''}
                      onChange={(e) => setEditData({ ...editData, pergunta_1: e.target.value })}
                      rows={2}
                    />
                    <Textarea
                      placeholder="Pergunta 2"
                      value={editData.pergunta_2 || ''}
                      onChange={(e) => setEditData({ ...editData, pergunta_2: e.target.value })}
                      rows={2}
                    />
                    <Textarea
                      placeholder="Pergunta 3"
                      value={editData.pergunta_3 || ''}
                      onChange={(e) => setEditData({ ...editData, pergunta_3: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSaveInline(devocional.id)}
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
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white">
                      <Heart className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{devocional.tema}</h3>
                      <p className="text-gray-600">{devocional.referencia}</p>
                      <p className="text-gray-500 text-sm">{formatDate(devocional.data)}</p>
                      <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                        {devocional.texto_central.substring(0, 150)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleInlineEdit(devocional)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingDevocional(devocional)}
                    >
                      Editar Completo
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deleteDevocional(devocional.id)}
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
        <CreateDevocionalDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            fetchDevocionais();
            setShowCreateDialog(false);
          }}
        />
      )}

      {editingDevocional && (
        <EditDevocionalDialog
          devocional={editingDevocional}
          onClose={() => setEditingDevocional(null)}
          onSuccess={() => {
            fetchDevocionais();
            setEditingDevocional(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDevocionais;
