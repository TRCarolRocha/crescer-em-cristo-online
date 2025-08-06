
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, CheckCircle, BookOpen, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Devocional {
  id: string;
  data: string;
  titulo: string;
  versiculo: string;
  reflexao: string;
  oracao: string;
}

const Devocional = () => {
  const [devocional, setDevocional] = useState<Devocional | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completado, setCompletado] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchDevocional();
  }, []);

  const fetchDevocional = async () => {
    setLoading(true);
    try {
      // Buscar devocional do dia
      const { data: devocionalData, error: devocionalError } = await supabase
        .from('devocionais')
        .select('*')
        .eq('data', today)
        .maybeSingle();

      if (devocionalError) {
        console.error('Erro ao buscar devocional:', devocionalError);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o devocional de hoje.",
          variant: "destructive"
        });
        return;
      }

      if (devocionalData) {
        // Mapear campos do banco para a interface
        const devocionalMapped: Devocional = {
          id: devocionalData.id,
          data: devocionalData.data,
          titulo: devocionalData.tema,
          versiculo: `${devocionalData.versiculo} - ${devocionalData.referencia}`,
          reflexao: devocionalData.texto_central || '',
          oracao: `Reflexões para hoje:\n\n1. ${devocionalData.pergunta_1}\n\n2. ${devocionalData.pergunta_2}\n\n3. ${devocionalData.pergunta_3}`
        };

        setDevocional(devocionalMapped);

        // Verificar se o usuário já completou o devocional hoje
        if (user?.id) {
          const { data: historicoData, error: historicoError } = await supabase
            .from('devocional_historico')
            .select('*')
            .eq('user_id', user.id)
            .eq('devocional_id', devocionalData.id)
            .maybeSingle();

          if (historicoError) {
            console.error('Erro ao verificar histórico:', historicoError);
            return;
          }

          setCompletado(!!historicoData?.completado);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar devocional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o devocional de hoje.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!devocional || !user?.id) return;

    setSaving(true);
    try {
      // Salvar no histórico do usuário
      const { error } = await supabase
        .from('devocional_historico')
        .upsert({
          user_id: user.id,
          devocional_id: devocional.id,
          completado: true
        }, { onConflict: 'user_id,devocional_id' });

      if (error) {
        console.error('Erro ao salvar progresso:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar seu progresso.",
          variant: "destructive"
        });
        return;
      }

      setCompletado(true);
      toast({
        title: "Sucesso",
        description: "Devocional de hoje marcado como completo!",
      });
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar seu progresso.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!devocional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center text-center">
        <div>
          <Heart className="h-10 w-10 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            Nenhum devocional disponível para hoje.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="container mx-auto py-6 px-4">
        {/* Header com botão de voltar */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Início
          </Button>
          
          <div className="text-gray-600 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date(devocional.data).toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        <Card className="bg-white shadow-md rounded-lg">
          <CardHeader className="flex flex-col space-y-1.5 p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">{devocional.titulo}</CardTitle>
              {completado ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completo
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Heart className="h-4 w-4 mr-1" />
                  Devocional
                </Badge>
              )}
            </div>
            <CardDescription className="text-gray-500">
              {devocional.versiculo}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="reflexao" className="text-sm font-medium">
                  Reflexão
                </Label>
                <Textarea
                  id="reflexao"
                  defaultValue={devocional.reflexao}
                  className="mt-2 w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="oracao" className="text-sm font-medium">
                  Perguntas para Reflexão
                </Label>
                <Textarea
                  id="oracao"
                  defaultValue={devocional.oracao}
                  className="mt-2 w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                  readOnly
                />
              </div>
              {!completado && (
                <Button
                  className="w-full"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      Marcar como Completo
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Devocional;
