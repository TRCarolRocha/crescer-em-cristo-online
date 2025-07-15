
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Edit, Eye, EyeOff, Trash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CreateAvisoDialog from './CreateAvisoDialog';
import EditAvisoDialog from './EditAvisoDialog';

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
  const [editingAviso, setEditingAviso] = useState<Aviso | null>(null);
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

      if (error) {
        console.error('Erro detalhado ao buscar avisos:', error);
        throw error;
      }
      
      console.log('Avisos carregados:', data);
      setAvisos(data || []);
    } catch (error) {
      console.error('Erro ao buscar avisos:', error);
      toast({
        title: "Erro",
        description: `Não foi possível carregar os avisos: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAvisoStatus = async (avisoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('avisos')
        .update({ ativo: !currentStatus })
        .eq('id', avisoId);

      if (error) {
        console.error('Erro ao alterar status:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: `Aviso ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`
      });

      fetchAvisos();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: `Não foi possível alterar o status do aviso: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const deleteAviso = async (id: string) => {
    try {
      const { error } = await supabase
        .from('avisos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir aviso:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Aviso excluído com sucesso"
      });

      fetchAvisos();
    } catch (error) {
      console.error('Erro ao excluir aviso:', error);
      toast({
        title: "Erro",
        description: `Não foi possível excluir o aviso: ${error.message}`,
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
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditingAviso(aviso)}
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
                    onClick={() => {
                      if (confirm('Tem certeza que deseja excluir este aviso?')) {
                        deleteAviso(aviso.id);
                      }
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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

      {editingAviso && (
        <EditAvisoDialog
          aviso={editingAviso}
          onClose={() => setEditingAviso(null)}
          onSuccess={() => {
            fetchAvisos();
            setEditingAviso(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminAvisos;
