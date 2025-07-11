
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: { value: number; text: string }[];
}

const questions: Question[] = [
  {
    id: 1,
    text: "Com que frequência você lê a Bíblia?",
    options: [
      { value: 1, text: "Raramente ou nunca" },
      { value: 2, text: "Algumas vezes por mês" },
      { value: 3, text: "Algumas vezes por semana" },
      { value: 4, text: "Todos os dias" }
    ]
  },
  {
    id: 2,
    text: "Como você descreveria sua vida de oração?",
    options: [
      { value: 1, text: "Oro raramente" },
      { value: 2, text: "Oro ocasionalmente" },
      { value: 3, text: "Oro regularmente" },
      { value: 4, text: "Oro constantemente ao longo do dia" }
    ]
  },
  {
    id: 3,
    text: "Qual é o seu envolvimento na igreja?",
    options: [
      { value: 1, text: "Frequento ocasionalmente" },
      { value: 2, text: "Frequento regularmente os cultos" },
      { value: 3, text: "Participo ativamente de grupos/ministérios" },
      { value: 4, text: "Lidero ministérios ou sirvo ativamente" }
    ]
  },
  {
    id: 4,
    text: "Como você aplica os ensinamentos bíblicos em sua vida diária?",
    options: [
      { value: 1, text: "Raramente penso nisso" },
      { value: 2, text: "Às vezes tento aplicar" },
      { value: 3, text: "Procuro aplicar regularmente" },
      { value: 4, text: "Minha vida é guiada pelos princípios bíblicos" }
    ]
  },
  {
    id: 5,
    text: "Qual é o seu conhecimento sobre doutrinas cristãs básicas?",
    options: [
      { value: 1, text: "Conhecimento básico" },
      { value: 2, text: "Conhecimento intermediário" },
      { value: 3, text: "Bom conhecimento" },
      { value: 4, text: "Conhecimento avançado" }
    ]
  },
  {
    id: 6,
    text: "Como você compartilha sua fé com outros?",
    options: [
      { value: 1, text: "Raramente ou nunca" },
      { value: 2, text: "Ocasionalmente" },
      { value: 3, text: "Regularmente" },
      { value: 4, text: "Constantemente busco oportunidades" }
    ]
  },
  {
    id: 7,
    text: "Qual é o seu envolvimento em discipulado?",
    options: [
      { value: 1, text: "Não participo" },
      { value: 2, text: "Já participei algumas vezes" },
      { value: 3, text: "Participo regularmente" },
      { value: 4, text: "Discipulo outros ativamente" }
    ]
  },
  {
    id: 8,
    text: "Como você lida com desafios espirituais?",
    options: [
      { value: 1, text: "Sinto-me perdido frequentemente" },
      { value: 2, text: "Busco ajuda ocasionalmente" },
      { value: 3, text: "Confio em Deus e busco orientação" },
      { value: 4, text: "Tenho maturidade para enfrentar e ajudar outros" }
    ]
  }
];

const DiagnosticoUnificado = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [hasCompletedBefore, setHasCompletedBefore] = useState(false);
  const [checkingPrevious, setCheckingPrevious] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkPreviousDiagnostic();
  }, [user]);

  const checkPreviousDiagnostic = async () => {
    if (!user) {
      setCheckingPrevious(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('diagnosticos')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar diagnóstico:', error);
      }

      if (data) {
        setHasCompletedBefore(true);
      }
    } catch (error) {
      console.error('Erro ao verificar diagnóstico:', error);
    } finally {
      setCheckingPrevious(false);
    }
  };

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = () => {
    const total = Object.values(answers).reduce((sum, value) => sum + value, 0);
    const average = total / questions.length;

    if (average <= 1.5) return 'Iniciante';
    if (average <= 2.5) return 'Crescimento';
    if (average <= 3.5) return 'Maduro';
    return 'Líder';
  };

  const submitDiagnostic = async () => {
    setLoading(true);

    try {
      const result = calculateResult();
      
      if (user) {
        const { error } = await supabase
          .from('diagnosticos')
          .upsert({
            user_id: user.id,
            respostas: answers
          });

        if (error) throw error;
      }

      toast({
        title: "Diagnóstico Concluído!",
        description: `Seu nível espiritual: ${result}`
      });

      navigate('/trilhas');
    } catch (error) {
      console.error('Erro ao salvar diagnóstico:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o diagnóstico",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingPrevious) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (hasCompletedBefore && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Diagnóstico já realizado!</h2>
            <p className="text-gray-600 mb-6">
              Você já completou seu diagnóstico espiritual. Acesse suas trilhas personalizadas.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/trilhas')} className="w-full">
                Ver Minhas Trilhas
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const canProceed = answers[currentQ.id] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={() => navigate('/')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Diagnóstico Espiritual</h1>
            <p className="text-gray-600 mt-1">Descubra seu nível espiritual em 8 perguntas</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Pergunta {currentQuestion + 1} de {questions.length}</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{currentQ.text}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQ.id]?.toString()}
              onValueChange={(value) => handleAnswer(currentQ.id, parseInt(value))}
            >
              {currentQ.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                  <Label htmlFor={`option-${option.value}`} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between mt-8">
              <Button
                onClick={prevQuestion}
                variant="outline"
                disabled={currentQuestion === 0}
              >
                Anterior
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={submitDiagnostic}
                  disabled={!canProceed || loading}
                >
                  {loading ? 'Finalizando...' : 'Finalizar Diagnóstico'}
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  disabled={!canProceed}
                >
                  Próxima
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiagnosticoUnificado;
