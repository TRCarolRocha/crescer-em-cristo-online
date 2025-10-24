
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, CheckCircle, BookOpen, MessageSquare, Lightbulb, Star, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PageContainer } from '@/components/layout/PageContainer';
import { getCurrentDateBR, formatDateHeaderBR } from '@/utils/dateUtils';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';

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
  return <DevocionalContent />;
};

const DevocionalContent = () => {
  const { access } = useSubscriptionAccess();
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
      let query = supabase
        .from('devocionais')
        .select('*')
        .eq('data', today);

      // Se usuário não tem plano, mostrar apenas públicos
      if (!access.canAccessPersonalDevotionals) {
        query = query.eq('is_public', true);
      }

      const { data: devocionalData, error: devocionalError } = await query.maybeSingle();

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
      <PageContainer maxWidth="2xl">
        <div className="max-w-[600px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-4">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              Nenhum devocional disponível para hoje.
            </p>
            {!access.canAccessPersonalDevotionals && (
              <UpgradePrompt 
                open={false} 
                onOpenChange={() => {}}
                currentPlan={access.planType}
              />
            )}
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="2xl">
      <div className="max-w-[600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Botão Voltar à Home */}
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Voltar à Home</span>
          <span className="sm:hidden">Home</span>
        </Button>

        {/* Card da Data */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-center shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-white/90" />
            <span className="text-white/90 text-sm font-medium uppercase tracking-wide">
              Devocional do Dia
            </span>
          </div>
          <p className="text-white text-xl sm:text-2xl font-semibold">
            {formatDateHeaderBR(devocional.data)}
          </p>
        </div>

        {/* Card do Tema */}
        <div className="bg-white rounded-2xl p-8 shadow-md text-center border border-gray-100">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight">
            {devocional.titulo}
          </h1>
          
          {completado && (
            <Badge className="mt-4 bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="h-4 w-4 mr-1" />
              Completo
            </Badge>
          )}
        </div>

        {/* Card do Versículo */}
        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-8 shadow-sm border border-blue-100">
          <div className="text-center space-y-4">
            <p className="text-lg sm:text-xl text-gray-800 leading-relaxed font-medium italic">
              "{devocional.versiculo}"
            </p>
            
            {devocional.referencia && (
              <p className="text-base font-bold text-blue-600">
                {devocional.referencia}
              </p>
            )}
          </div>
        </div>

        {/* Card da Reflexão */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Reflexão</h2>
          </div>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {devocional.texto_central}
            </p>
          </div>
        </div>

        {/* Card de Perguntas para Reflexão */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Perguntas para Reflexão</h2>
          </div>
          
          {devocional.pergunta_1 && (
            <div>
              <Label className="font-medium text-gray-700 mb-2 block">1. {devocional.pergunta_1}</Label>
              <Textarea
                value={userResponses.resposta_1}
                onChange={(e) => handleResponseChange('resposta_1', e.target.value)}
                placeholder="Digite sua resposta..."
                className="min-h-[80px]"
              />
            </div>
          )}
          {devocional.pergunta_2 && (
            <div>
              <Label className="font-medium text-gray-700 mb-2 block">2. {devocional.pergunta_2}</Label>
              <Textarea
                value={userResponses.resposta_2}
                onChange={(e) => handleResponseChange('resposta_2', e.target.value)}
                placeholder="Digite sua resposta..."
                className="min-h-[80px]"
              />
            </div>
          )}
          {devocional.pergunta_3 && (
            <div>
              <Label className="font-medium text-gray-700 mb-2 block">3. {devocional.pergunta_3}</Label>
              <Textarea
                value={userResponses.resposta_3}
                onChange={(e) => handleResponseChange('resposta_3', e.target.value)}
                placeholder="Digite sua resposta..."
                className="min-h-[80px]"
              />
            </div>
          )}
        </div>

        {/* Card do Diário de Bordo */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
              <Heart className="h-5 w-5 text-rose-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Diário de Bordo</h2>
          </div>
          
          <div>
            <Label className="font-medium text-gray-700 flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-rose-500" />
              Oração
            </Label>
            <Textarea
              value={userResponses.oracao}
              onChange={(e) => handleResponseChange('oracao', e.target.value)}
              placeholder="Compartilhe suas orações e pedidos..."
              className="min-h-[100px]"
            />
          </div>
          
          <div>
            <Label className="font-medium text-gray-700 flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Gratidão
            </Label>
            <Textarea
              value={userResponses.gratidao}
              onChange={(e) => handleResponseChange('gratidao', e.target.value)}
              placeholder="Pelo que você é grato hoje?"
              className="min-h-[80px]"
            />
          </div>
          
          <div>
            <Label className="font-medium text-gray-700 flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Aprendizado
            </Label>
            <Textarea
              value={userResponses.aprendizado}
              onChange={(e) => handleResponseChange('aprendizado', e.target.value)}
              placeholder="O que Deus tem ensinado você?"
              className="min-h-[80px]"
            />
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg py-6 rounded-xl"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : (
              <>
                <Heart className="h-5 w-5 mr-2" />
                Salvar Devocional
              </>
            )}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default Devocional;
