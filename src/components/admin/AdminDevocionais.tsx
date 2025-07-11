
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Plus, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Devocional {
  id: string;
  tema: string;
  data: string;
  versiculo: string;
  referencia: string;
  texto_central: string;
}

const AdminDevocionais = () => {
  const [devocionais, setDevocionais] = useState<Devocional[]>([]);
  const [loading, setLoading] = useState(true);
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
        <Button>
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
                    <p className="text-gray-500 text-sm">{new Date(devocional.data).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDevocionais;
