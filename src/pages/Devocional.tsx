
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Heart, Calendar, CheckCircle, BookOpen, MessageSquare, Lightbulb, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { getCurrentDateBR, formatDateISOInSaoPaulo } from '@/utils/dateUtils';

interface Devocional {
  id: string;
  data: string;
  titulo: string;
  versiculo: string;
  referencia: string;
  texto_central: string;
  pergunta_1: string;
  pergunta_2: string;
  pergunta_3: string;
}

interface UserResponses {
  resposta_1: string;
  resposta_2: string;
  resposta_3: string;
  oracao: string;
  gratidao: string;
  aprendizado: string;
}

const Devocional = () => {
  const [devocional, setDevocional] = useState<Devocional | null>(null);
  const [userResponses, setUserResponses] = useState<UserResponses>({
    resposta_1: '',
    resposta_2: '',
    resposta_3: '',
    oracao: '',
    gratidao: '',
    aprendizado: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completado, setCompletado] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const today = getCurrentDateBR();

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
        setDevocional({
          id: devocionalData.id,
          data: devocionalData.data,
          titulo: devocionalData.tema || 'Devocional de Hoje',
          versiculo: devocionalData.versiculo || '',
          referencia: devocionalData.referencia || '',
          texto_central: devocionalData.texto_central || 'Dedique um tempo para reflexão e oração sobre o versículo de hoje.',
          pergunta_1: devocionalData.pergunta_1 || '',
          pergunta_2: devocionalData.pergunta_2 || '',
          pergunta_3: devocionalData.pergunta_3 || ''
        });

        // Verificar se o usuário já completou o devocional hoje e carregar suas respostas
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

          if (historicoData) {
            setCompletado(historicoData.completado);
            setUserResponses({
              resposta_1: historicoData.resposta_1 || '',
              resposta_2: historicoData.resposta_2 || '',
              resposta_3: historicoData.resposta_3 || '',
              oracao: historicoData.oracao || '',
              gratidao: historicoData.gratidao || '',
              aprendizado: historicoData.aprendizado || ''
            });
          }
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

  const handleResponseChange = (field: keyof UserResponses, value: string) => {
    setUserResponses(prev => ({
      ...prev,
      [field]: value
    }));
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
          completado: true,
          resposta_1: userResponses.resposta_1,
          resposta_2: userResponses.resposta_2,
          resposta_3: userResponses.resposta_3,
          oracao: userResponses.oracao,
          gratidao: userResponses.gratidao,
          aprendizado: userResponses.aprendizado
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
        description: "Devocional de hoje salvo com sucesso!",
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
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    );
  }

  if (!devocional) {
    return (
      <PageContainer>
        <PageHeader 
          title="Devocional Diário"
          description="Seu momento com Deus"
        />
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">
            Nenhum devocional disponível para hoje.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="4xl">
      <PageHeader 
        title="Devocional Diário"
        description={formatDateISOInSaoPaulo(devocional.data)}
        variant="plain"
      />

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">{devocional.titulo}</CardTitle>
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
            <CardDescription className="text-lg font-medium text-gray-700">
              {devocional.versiculo}
              {devocional.referencia && (
                <span className="block text-sm text-gray-500 mt-1">
                  {devocional.referencia}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Accordion type="multiple" defaultValue={["reflexao"]} className="w-full space-y-4">
              {/* Seção Reflexão */}
              <AccordionItem value="reflexao" className="border border-sky-200 rounded-lg p-1">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-sky-600" />
                    <span className="font-semibold">Reflexão</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="rounded-lg border border-sky-100 bg-sky-50/50 p-4 text-slate-700 whitespace-pre-line leading-relaxed">
                    {devocional.texto_central}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Seção Perguntas para Reflexão */}
              <AccordionItem value="perguntas" className="border border-slate-200 rounded-lg p-1">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-sky-600" />
                    <span className="font-semibold">Perguntas para Reflexão</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  {devocional.pergunta_1 && (
                    <div>
                      <Label className="font-medium text-gray-700">1. {devocional.pergunta_1}</Label>
                      <Textarea
                        value={userResponses.resposta_1}
                        onChange={(e) => handleResponseChange('resposta_1', e.target.value)}
                        placeholder="Digite sua resposta..."
                        className="mt-2 min-h-[80px]"
                      />
                    </div>
                  )}
                  {devocional.pergunta_2 && (
                    <div>
                      <Label className="font-medium text-gray-700">2. {devocional.pergunta_2}</Label>
                      <Textarea
                        value={userResponses.resposta_2}
                        onChange={(e) => handleResponseChange('resposta_2', e.target.value)}
                        placeholder="Digite sua resposta..."
                        className="mt-2 min-h-[80px]"
                      />
                    </div>
                  )}
                  {devocional.pergunta_3 && (
                    <div>
                      <Label className="font-medium text-gray-700">3. {devocional.pergunta_3}</Label>
                      <Textarea
                        value={userResponses.resposta_3}
                        onChange={(e) => handleResponseChange('resposta_3', e.target.value)}
                        placeholder="Digite sua resposta..."
                        className="mt-2 min-h-[80px]"
                      />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Seção Diário de Bordo */}
              <AccordionItem value="diario" className="border border-slate-200 rounded-lg p-1">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-sky-600" />
                    <span className="font-semibold">Diário de Bordo</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  <div>
                    <Label className="font-medium text-gray-700 flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Oração
                    </Label>
                    <Textarea
                      value={userResponses.oracao}
                      onChange={(e) => handleResponseChange('oracao', e.target.value)}
                      placeholder="Compartilhe suas orações e pedidos..."
                      className="mt-2 min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label className="font-medium text-gray-700 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Gratidão
                    </Label>
                    <Textarea
                      value={userResponses.gratidao}
                      onChange={(e) => handleResponseChange('gratidao', e.target.value)}
                      placeholder="Pelo que você é grato hoje?"
                      className="mt-2 min-h-[80px]"
                    />
                  </div>
                  <div>
                    <Label className="font-medium text-gray-700 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Aprendizado
                    </Label>
                    <Textarea
                      value={userResponses.aprendizado}
                      onChange={(e) => handleResponseChange('aprendizado', e.target.value)}
                      placeholder="O que Deus tem ensinado você?"
                      className="mt-2 min-h-[80px]"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Botão Salvar Progresso */}
            <div className="mt-6 pt-6 border-t">
              <Button
                className="w-full sm:w-auto sm:min-w-[200px]"
                onClick={handleSave}
                disabled={saving}
                size="lg"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando Progresso...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Salvar Progresso
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Devocional;
