
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { MessageSquare, Plus, Edit, Eye, EyeOff, Trash, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CreateAvisoDialog from './CreateAvisoDialog';

interface Aviso {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  ativo: boolean;
  ordem: number;
  imagem_url: string;
}

const AdminAvisos = () => {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingInline, setEditingInline] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Aviso>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchAvisos();
  }, []);

  const fetchAvisos = async () => {
    try {
      const { data, error } = await supabase
        .from('avisos')
        .select('*')
        .order('ordem');

      if (error) throw error;
      setAvisos(data || []);
    } catch (error) {
      console.error('Erro ao buscar avisos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os avisos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInlineEdit = (aviso: Aviso) => {
    setEditingInline(aviso.id);
    setEditData(aviso);
  };

  const handleCancelEdit = () => {
    setEditingInline(null);
    setEditData({});
  };

  const handleSaveInline = async (avisoId: string) => {
    try {
      console.log('Salvando aviso:', avisoId, 'com dados:', editData);

      const updateData = {
        titulo: editData.titulo,
        descricao: editData.descricao,
        categoria: editData.categoria,
        imagem_url: editData.imagem_url,
        ativo: editData.ativo,
        ordem: editData.ordem,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('avisos')
        .update(updateData)
        .eq('id', avisoId)
        .select();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Aviso atualizado com sucesso:', data);

      toast({
        title: "Sucesso",
        description: "Aviso atualizado com sucesso"
      });

      setEditingInline(null);
      setEditData({});
      await fetchAvisos();
    } catch (error) {
      console.error('Erro ao salvar aviso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive"
      });
    }
  };

  const toggleAvisoStatus = async (avisoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('avisos')
        .update({ ativo: !currentStatus })
        .eq('id', avisoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Aviso ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`
      });

      fetchAvisos();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do aviso",
        variant: "destructive"
      });
    }
  };

  const deleteAviso = async (avisoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este aviso? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('avisos')
        .delete()
        .eq('id', avisoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Aviso excluído com sucesso"
      });

      fetchAvisos();
    } catch (error) {
      console.error('Erro ao excluir aviso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o aviso",
        variant: "destructive"
      });
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
        <h2 className="text-2xl font-bold">Gestão de Avisos</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Aviso
        </Button>
      </div>

      <div className="grid gap-4">
        {avisos.map((aviso) => (
          <Card key={aviso.id} className={`${!aviso.ativo ? 'opacity-60' : ''}`}>
            <CardContent className="p-6">
              {editingInline === aviso.id ? (
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
                      <label className="block text-sm font-medium mb-1">Categoria</label>
                      <Input
                        value={editData.categoria || ''}
                        onChange={(e) => setEditData({ ...editData, categoria: e.target.value })}
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
                      <label className="block text-sm font-medium mb-1">URL da Imagem</label>
                      <Input
                        value={editData.imagem_url || ''}
                        onChange={(e) => setEditData({ ...editData, imagem_url: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Ordem</label>
                      <Input
                        type="number"
                        value={editData.ordem || 1}
                        onChange={(e) => setEditData({ ...editData, ordem: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editData.ativo || false}
                      onCheckedChange={(checked) => setEditData({ ...editData, ativo: checked })}
                    />
                    <label className="text-sm font-medium">Ativo</label>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSaveInline(aviso.id)}
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
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{aviso.titulo}</h3>
                      <p className="text-gray-600">{aviso.descricao}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{aviso.categoria}</Badge>
                        <Badge variant={aviso.ativo ? 'default' : 'destructive'}>
                          {aviso.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Badge variant="secondary">Ordem: {aviso.ordem}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleInlineEdit(aviso)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={aviso.ativo ? "destructive" : "default"}
                      onClick={() => toggleAvisoStatus(aviso.id, aviso.ativo)}
                    >
                      {aviso.ativo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deleteAviso(aviso.id)}
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
        <CreateAvisoDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            fetchAvisos();
            setShowCreateDialog(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminAvisos;
