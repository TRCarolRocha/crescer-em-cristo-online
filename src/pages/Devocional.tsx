import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Calendar, BookOpen, Heart, CheckCircle, ArrowLeft, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import DevocionalDashboard from '@/components/devocional/DevocionalDashboard';

interface Devocional {
  id: string;
  data: string;
  tema: string;
  versiculo: string;
  referencia: string;
  texto_central: string;
  pergunta_1: string;
  pergunta_2: string;
  pergunta_3: string;
}

interface DevocionalHistorico {
  id?: string;
  devocional_id: string;
  resposta_1: string;
  resposta_2: string;
  resposta_3: string;
  oracao: string;
  gratidao: string;
  aprendizado: string;
  completado: boolean;
}

interface DevocionalStats {
  streak_atual: number;
  melhor_streak: number;
  total_completados: number;
}

const Devocional = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [devocional, setDevocional] = useState<Devocional | null>(null);
  const [stats, setStats] = useState<DevocionalStats | null>(null);
  const [historico, setHistorico] = useState<DevocionalHistorico>({
    devocional_id: '',
    resposta_1: '',
    resposta_2: '',
    resposta_3: '',
    oracao: '',
    gratidao: '',
    aprendizado: '',
    completado: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDevocionalDoDia();
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data } = await supabase
        .from('devocional_stats')
        .select('streak_atual, melhor_streak, total_completados')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const fetchDevocionalDoDia = async () => {
    try {
      // Corrigir data usando timezone brasileiro
      const hoje = new Date();
      const hojeFormatado = hoje.toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo'
      }).split('/').reverse().join('-');
      
      console.log('Buscando devocional para:', hojeFormatado);

      // Buscar devocional de hoje
      const { data: devocionalData, error: devocionalError } = await supabase
        .from('devocionais')
        .select('*')
        .eq('data', hojeFormatado)
        .single();

      if (devocionalError && devocionalError.code !== 'PGRST116') {
        throw devocionalError;
      }

      if (devocionalData) {
        setDevocional(devocionalData);

        // Buscar histórico do usuário para este devocional
        const { data: historicoData, error: historicoError } = await supabase
          .from('devocional_historico')
          .select('*')
          .eq('user_id', user.id)
          .eq('devocional_id', devocionalData.id)
          .maybeSingle();

        if (historicoError && historicoError.code !== 'PGRST116') {
          throw historicoError;
        }

        if (historicoData) {
          setHistorico(historicoData);
        } else {
          setHistorico(prev => ({ ...prev, devocional_id: devocionalData.id }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar devocional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o devocional de hoje.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof DevocionalHistorico, value: string) => {
    setHistorico(prev => ({ ...prev, [field]: value }));
  };

  const salvarProgresso = async () => {
    if (!user || !devocional) return;

    setSaving(true);
    try {
      const dataToSave = {
        user_id: user.id,
        devocional_id: devocional.id,
        resposta_1: historico.resposta_1,
        resposta_2: historico.resposta_2,
        resposta_3: historico.resposta_3,
        oracao: historico.oracao,
        gratidao: historico.gratidao,
        aprendizado: historico.aprendizado,
        completado: historico.completado
      };

      if (historico.id) {
        const { error } = await supabase
          .from('devocional_historico')
          .update(dataToSave)
          .eq('id', historico.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('devocional_historico')
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        setHistorico(prev => ({ ...prev, id: data.id }));
      }

      toast({
        title: "Progresso salvo!",
        description: "Suas reflexões foram salvas com sucesso."
      });
      
      // Atualizar estatísticas
      await fetchStats();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o progresso.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const marcarComoCompleto = async () => {
    const novoStatus = !historico.completado;
    setHistorico(prev => ({ ...prev, completado: novoStatus }));
    
    // Salvar automaticamente quando marcar como completo
    setTimeout(() => salvarProgresso(), 100);

    if (novoStatus) {
      toast({
        title: "Parabéns! 🎉",
        description: "Devocional concluído com sucesso!"
      });
    }
  };

  const calcularProgresso = () => {
    const campos = ['resposta_1', 'resposta_2', 'resposta_3', 'oracao', 'gratidao', 'aprendizado'];
    const preenchidos = campos.filter(campo => historico[campo as keyof DevocionalHistorico]).length;
    return Math.round((preenchidos / campos.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button 
              onClick={() => setShowDashboard(false)} 
              variant="ghost"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Devocional
            </Button>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
            >
              Home
            </Button>
          </div>
          <DevocionalDashboard />
        </div>
      </div>
    );
  }

  if (!devocional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={() => navigate('/')} 
            variant="ghost" 
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar à Home
          </Button>
          <Card className="text-center p-8">
            <CardContent>
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Nenhum devocional disponível hoje
              </h2>
              <p className="text-gray-600">
                O devocional de hoje ainda não foi publicado. Volte mais tarde!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progresso = calcularProgresso();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={() => navigate('/')} 
            variant="ghost"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar à Home
          </Button>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowDashboard(true)}
              variant="outline"
              size="sm"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Meu Progresso
            </Button>
            <div className="text-right">
              <div className="text-sm text-gray-600">Progresso</div>
              <div className="font-semibold">{progresso}%</div>
            </div>
            <Progress value={progresso} className="w-24" />
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-orange-600">{stats.streak_atual}</div>
                <div className="text-xs text-gray-600">Dias Consecutivos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-yellow-600">{stats.melhor_streak}</div>
                <div className="text-xs text-gray-600">Melhor Sequência</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-blue-600">{stats.total_completados}</div>
                <div className="text-xs text-gray-600">Total Completos</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Header do Devocional */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">
                {new Date(devocional.data + 'T00:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'America/Sao_Paulo'
                })}
              </span>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              {devocional.tema}
            </CardTitle>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-lg font-medium text-gray-900 mb-2">
                "{devocional.versiculo}"
              </p>
              <p className="text-blue-600 font-semibold">
                {devocional.referencia}
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Texto Central */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Reflexão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {devocional.texto_central}
            </p>
          </CardContent>
        </Card>

        {/* Perguntas de Reflexão */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Perguntas para Reflexão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1. {devocional.pergunta_1}
              </label>
              <Textarea
                value={historico.resposta_1}
                onChange={(e) => handleInputChange('resposta_1', e.target.value)}
                placeholder="Escreva sua reflexão aqui..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                2. {devocional.pergunta_2}
              </label>
              <Textarea
                value={historico.resposta_2}
                onChange={(e) => handleInputChange('resposta_2', e.target.value)}
                placeholder="Escreva sua reflexão aqui..."
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                3. {devocional.pergunta_3}
              </label>
              <Textarea
                value={historico.resposta_3}
                onChange={(e) => handleInputChange('resposta_3', e.target.value)}
                placeholder="Escreva sua reflexão aqui..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Diário de Bordo */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Diário de Bordo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Oração do Dia
              </label>
              <Textarea
                value={historico.oracao}
                onChange={(e) => handleInputChange('oracao', e.target.value)}
                placeholder="Compartilhe sua oração..."
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gratidão
              </label>
              <Textarea
                value={historico.gratidao}
                onChange={(e) => handleInputChange('gratidao', e.target.value)}
                placeholder="Pelo que você é grato hoje?"
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aprendizado
              </label>
              <Textarea
                value={historico.aprendizado}
                onChange={(e) => handleInputChange('aprendizado', e.target.value)}
                placeholder="O que você aprendeu hoje?"
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={salvarProgresso}
            disabled={saving}
            variant="outline"
            className="flex-1"
          >
            {saving ? 'Salvando...' : 'Salvar Progresso'}
          </Button>
          
          <Button
            onClick={marcarComoCompleto}
            className={`flex-1 ${historico.completado ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {historico.completado ? 'Concluído ✓' : 'Marcar como Concluído'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Devocional;
