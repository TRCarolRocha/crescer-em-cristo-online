
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookOpen, CheckCircle, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DevocionalData {
  id: string;
  tema: string;
  versiculo: string;
  referencia: string;
  texto_central: string;
  pergunta_1: string;
  pergunta_2: string;
  pergunta_3: string;
  data: string;
}

const Devocional = () => {
  const [devocional, setDevocional] = useState<DevocionalData | null>(null);
  const [respostas, setRespostas] = useState({
    resposta_1: '',
    resposta_2: '',
    resposta_3: '',
    oracao: '',
    gratidao: '',
    aprendizado: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jaRealizado, setJaRealizado] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchDevocionalHoje();
    }
  }, [user]);

  const fetchDevocionalHoje = async () => {
    if (!user?.id) return;

    try {
      const hoje = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('devocionais')
        .select('*')
        .eq('data', hoje)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setDevocional(data);
        
        // Verificar se já foi realizado
        const { data: historico } = await supabase
          .from('devocional_historico')
          .select('*')
          .eq('user_id', user.id)
          .eq('devocional_id', data.id)
          .maybeSingle();

        if (historico) {
          setJaRealizado(historico.completado);
          if (historico.completado) {
            setRespostas({
              resposta_1: historico.resposta_1 || '',
              resposta_2: historico.resposta_2 || '',
              resposta_3: historico.resposta_3 || '',
              oracao: historico.oracao || '',
              gratidao: historico.gratidao || '',
              aprendizado: historico.aprendizado || ''
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar devocional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o devocional de hoje",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    if (!devocional || !user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('devocional_historico')
        .upsert({
          user_id: user.id,
          devocional_id: devocional.id,
          completado: true,
          ...respostas
        }, {
          onConflict: 'user_id,devocional_id'
        });

      if (error) throw error;

      setJaRealizado(true);
      toast({
        title: "Parabéns!",
        description: "Seu devocional foi salvo com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao salvar devocional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o devocional",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-pulse text-center">
          <BookOpen className="h-8 w-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Carregando devocional...</p>
        </div>
      </div>
    );
  }

  if (!devocional) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum devocional disponível
            </h2>
            <p className="text-gray-600">
              Não há devocional programado para hoje. Volte amanhã!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Devocional Diário
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            {new Date(devocional.data).toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Status já realizado */}
        {jaRealizado && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Devocional já realizado! Você pode revisar suas respostas abaixo.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conteúdo do Devocional */}
        <div className="space-y-6">
          {/* Tema e Versículo */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl text-center text-blue-900">
                {devocional.tema}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm sm:text-base text-blue-900 font-medium italic mb-2">
                  "{devocional.versiculo}"
                </p>
                <p className="text-xs sm:text-sm text-blue-700 text-right">
                  {devocional.referencia}
                </p>
              </div>
              <div className="prose prose-sm sm:prose-base max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {devocional.texto_central}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Perguntas de Reflexão */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Perguntas para Reflexão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pergunta1" className="text-sm font-medium text-gray-700">
                  1. {devocional.pergunta_1}
                </Label>
                <Textarea
                  id="pergunta1"
                  value={respostas.resposta_1}
                  onChange={(e) => setRespostas({ ...respostas, resposta_1: e.target.value })}
                  className="min-h-20 resize-none"
                  placeholder="Sua reflexão aqui..."
                  disabled={jaRealizado}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pergunta2" className="text-sm font-medium text-gray-700">
                  2. {devocional.pergunta_2}
                </Label>
                <Textarea
                  id="pergunta2"
                  value={respostas.resposta_2}
                  onChange={(e) => setRespostas({ ...respostas, resposta_2: e.target.value })}
                  className="min-h-20 resize-none"
                  placeholder="Sua reflexão aqui..."
                  disabled={jaRealizado}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pergunta3" className="text-sm font-medium text-gray-700">
                  3. {devocional.pergunta_3}
                </Label>
                <Textarea
                  id="pergunta3"
                  value={respostas.resposta_3}
                  onChange={(e) => setRespostas({ ...respostas, resposta_3: e.target.value })}
                  className="min-h-20 resize-none"
                  placeholder="Sua reflexão aqui..."
                  disabled={jaRealizado}
                />
              </div>
            </CardContent>
          </Card>

          {/* Seção de Oração e Gratidão */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Momento de Oração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="oracao" className="text-sm font-medium text-gray-700">
                  Sua oração de hoje:
                </Label>
                <Textarea
                  id="oracao"
                  value={respostas.oracao}
                  onChange={(e) => setRespostas({ ...respostas, oracao: e.target.value })}
                  className="min-h-20 resize-none"
                  placeholder="Escreva sua oração..."
                  disabled={jaRealizado}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gratidao" className="text-sm font-medium text-gray-700">
                  Pelo que você é grato hoje?
                </Label>
                <Textarea
                  id="gratidao"
                  value={respostas.gratidao}
                  onChange={(e) => setRespostas({ ...respostas, gratidao: e.target.value })}
                  className="min-h-20 resize-none"
                  placeholder="Liste suas gratidões..."
                  disabled={jaRealizado}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aprendizado" className="text-sm font-medium text-gray-700">
                  Qual foi seu principal aprendizado?
                </Label>
                <Textarea
                  id="aprendizado"
                  value={respostas.aprendizado}
                  onChange={(e) => setRespostas({ ...respostas, aprendizado: e.target.value })}
                  className="min-h-20 resize-none"
                  placeholder="Compartilhe seu aprendizado..."
                  disabled={jaRealizado}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botão de Finalizar */}
          {!jaRealizado && (
            <div className="text-center pb-6">
              <Button
                onClick={handleSalvar}
                disabled={saving}
                size="lg"
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? 'Salvando...' : 'Finalizar Devocional'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Devocional;
