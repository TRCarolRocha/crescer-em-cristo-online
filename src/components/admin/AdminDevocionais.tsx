
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Plus, Edit, Trash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CreateDevocionalDialog from './CreateDevocionalDialog';
import EditDevocionalDialog from './EditDevocionalDialog';
import { formatDateHeaderBR } from '@/utils/dateUtils';

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

      if (error) {
        console.error('Erro detalhado ao buscar devocionais:', error);
        throw error;
      }
      
      console.log('Devocionais carregados:', data);
      setDevocionais(data || []);
    } catch (error) {
      console.error('Erro ao buscar devocionais:', error);
      toast({
        title: "Erro",
        description: `Não foi possível carregar os devocionais: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteDevocional = async (id: string) => {
    try {
      const { error } = await supabase
        .from('devocionais')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir devocional:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Devocional excluído com sucesso"
      });

      fetchDevocionais();
    } catch (error) {
      console.error('Erro ao excluir devocional:', error);
      toast({
        title: "Erro",
        description: `Não foi possível excluir o devocional: ${error.message}`,
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{devocional.tema}</h3>
                    <p className="text-gray-600">{devocional.referencia}</p>
                    <p className="text-gray-500 text-sm">{formatDateHeaderBR(devocional.data)}</p>
                    <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                      {devocional.texto_central.substring(0, 150)}...
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditingDevocional(devocional)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja excluir este devocional?')) {
                        deleteDevocional(devocional.id);
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
