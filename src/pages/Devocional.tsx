
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Calendar, BookOpen, MessageCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

interface DevocionalHistorico {
  id: string;
  devocional_id: string;
  user_id: string;
  resposta_1: string;
  resposta_2: string;
  resposta_3: string;
  gratidao: string;
  aprendizado: string;
  oracao: string;
  completado: boolean;
}

const Devocional = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [devocionalAtual, setDevocionalAtual] = useState<Devocional | null>(null);
  const [historico, setHistorico] = useState<DevocionalHistorico | null>(null);
  const [respostas, setRespostas] = useState({
    resposta_1: '',
    resposta_2: '',
    resposta_3: '',
    gratidao: '',
    aprendizado: '',
    oracao: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDevocionalAtual();
  }, []);

  useEffect(() => {
    if (devocionalAtual && user) {
      fetchHistorico();
    }
  }, [devocionalAtual, user]);

  const fetchDevocionalAtual = async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('devocionais')
        .select('*')
        .eq('data', hoje)
        .maybeSingle();

      if (error) throw error;
      setDevocionalAtual(data);
    } catch (error) {
      console.error('Erro ao buscar devocional:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorico = async () => {
    if (!devocionalAtual || !user) return;

    try {
      const { data, error } = await supabase
        .from('devocional_historico')
        .select('*')
        .eq('devocional_id', devocionalAtual.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setHistorico(data);
        setRespostas({
          resposta_1: data.resposta_1 || '',
          resposta_2: data.resposta_2 || '',
          resposta_3: data.resposta_3 || '',
          gratidao: data.gratidao || '',
          aprendizado: data.aprendizado || '',
          oracao: data.oracao || ''
        });
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    }
  };

  const salvarRespostas = async () => {
    if (!devocionalAtual || !user) return;

    setSaving(true);
    try {
      const dadosParaSalvar = {
        devocional_id: devocionalAtual.id,
        user_id: user.id,
        ...respostas,
        completado: true,
        updated_at: new Date().toISOString()
      };

      if (historico) {
        const { error } = await supabase
          .from('devocional_historico')
          .update(dadosParaSalvar)
          .eq('id', historico.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('devocional_historico')
          .insert([dadosParaSalvar]);
        if (error) throw error;
      }

      toast({
        title: "Sucesso!",
        description: "Suas reflexões foram salvas."
      });

      fetchHistorico();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar suas reflexões.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const formatarData = (dataString: string) => {
    try {
      // Corrigir o problema de fuso horário
      const date = new Date(dataString + 'T00:00:00-03:00'); // Forçar horário de Brasília
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Sao_Paulo'
      }).replace(/^./, c => c.toUpperCase());
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dataString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!devocionalAtual) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="mb-6 flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Voltar para Home
          </Button>
          
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Nenhum devocional para hoje
              </h2>
              <p className="text-gray-600">
                Volte amanhã para um novo momento de reflexão e crescimento espiritual.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="mb-6 flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Voltar para Home
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header do Devocional */}
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="h-6 w-6" />
                <span className="text-lg font-medium">Devocional Diário</span>
              </div>
              <CardTitle className="text-2xl md:text-3xl">{devocionalAtual.tema}</CardTitle>
              <div className="flex items-center justify-center gap-4 text-purple-100 mt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatarData(devocionalAtual.data)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{devocionalAtual.referencia}</span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Versículo */}
          <Card>
            <CardContent className="p-6">
              <blockquote className="text-lg italic text-center text-gray-700 border-l-4 border-blue-500 pl-6">
                "{devocionalAtual.versiculo}"
              </blockquote>
              <p className="text-right text-sm text-gray-500 mt-2">
                — {devocionalAtual.referencia}
              </p>
            </CardContent>
          </Card>

          {/* Texto Central */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Reflexão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {devocionalAtual.texto_central}
              </p>
            </CardContent>
          </Card>

          {/* Perguntas para Reflexão */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle>Momento de Reflexão Pessoal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {devocionalAtual.pergunta_1}
                  </label>
                  <Textarea
                    value={respostas.resposta_1}
                    onChange={(e) => setRespostas({...respostas, resposta_1: e.target.value})}
                    placeholder="Escreva sua reflexão..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {devocionalAtual.pergunta_2}
                  </label>
                  <Textarea
                    value={respostas.resposta_2}
                    onChange={(e) => setRespostas({...respostas, resposta_2: e.target.value})}
                    placeholder="Escreva sua reflexão..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {devocionalAtual.pergunta_3}
                  </label>
                  <Textarea
                    value={respostas.resposta_3}
                    onChange={(e) => setRespostas({...respostas, resposta_3: e.target.value})}
                    placeholder="Escreva sua reflexão..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pelo que você é grato hoje?
                  </label>
                  <Textarea
                    value={respostas.gratidao}
                    onChange={(e) => setRespostas({...respostas, gratidao: e.target.value})}
                    placeholder="Liste suas gratidões..."
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    O que você aprendeu hoje?
                  </label>
                  <Textarea
                    value={respostas.aprendizado}
                    onChange={(e) => setRespostas({...respostas, aprendizado: e.target.value})}
                    placeholder="Compartilhe seus aprendizados..."
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Oração pessoal
                  </label>
                  <Textarea
                    value={respostas.oracao}
                    onChange={(e) => setRespostas({...respostas, oracao: e.target.value})}
                    placeholder="Sua oração..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={salvarRespostas}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? 'Salvando...' : 'Salvar Reflexões'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Devocional;
