
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: { value: string; label: string; points: number }[];
  category: string;
}

const questions: Question[] = [
  {
    id: 'prayer_frequency',
    question: 'Com que frequência você ora?',
    category: 'prayer',
    options: [
      { value: 'daily', label: 'Diariamente', points: 3 },
      { value: 'weekly', label: 'Algumas vezes por semana', points: 2 },
      { value: 'occasionally', label: 'Ocasionalmente', points: 1 },
      { value: 'rarely', label: 'Raramente', points: 0 }
    ]
  },
  {
    id: 'bible_reading',
    question: 'Você tem o hábito de ler a Bíblia?',
    category: 'study',
    options: [
      { value: 'daily', label: 'Todos os dias', points: 3 },
      { value: 'weekly', label: 'Algumas vezes por semana', points: 2 },
      { value: 'monthly', label: 'Algumas vezes por mês', points: 1 },
      { value: 'rarely', label: 'Raramente ou nunca', points: 0 }
    ]
  },
  {
    id: 'church_attendance',
    question: 'Com que frequência você participa dos cultos?',
    category: 'fellowship',
    options: [
      { value: 'always', label: 'Sempre que há culto', points: 3 },
      { value: 'weekly', label: 'Toda semana', points: 2 },
      { value: 'monthly', label: 'Algumas vezes por mês', points: 1 },
      { value: 'rarely', label: 'Raramente', points: 0 }
    ]
  },
  {
    id: 'service_participation',
    question: 'Você participa de algum ministério ou serviço na igreja?',
    category: 'service',
    options: [
      { value: 'leader', label: 'Sim, sou líder de algum ministério', points: 3 },
      { value: 'active', label: 'Sim, participo ativamente', points: 2 },
      { value: 'occasional', label: 'Às vezes ajudo quando precisa', points: 1 },
      { value: 'no', label: 'Não participo', points: 0 }
    ]
  },
  {
    id: 'evangelism',
    question: 'Você compartilha sua fé com outras pessoas?',
    category: 'evangelism',
    options: [
      { value: 'frequently', label: 'Frequentemente', points: 3 },
      { value: 'sometimes', label: 'Às vezes', points: 2 },
      { value: 'rarely', label: 'Raramente', points: 1 },
      { value: 'never', label: 'Nunca', points: 0 }
    ]
  },
  {
    id: 'spiritual_growth',
    question: 'Como você avalia seu crescimento espiritual no último ano?',
    category: 'growth',
    options: [
      { value: 'much', label: 'Cresci muito', points: 3 },
      { value: 'some', label: 'Cresci um pouco', points: 2 },
      { value: 'little', label: 'Cresci muito pouco', points: 1 },
      { value: 'stagnant', label: 'Estou estagnado', points: 0 }
    ]
  },
  {
    id: 'discipleship',
    question: 'Você já discipulou ou mentoreou alguém?',
    category: 'discipleship',
    options: [
      { value: 'currently', label: 'Sim, atualmente discipulo alguém', points: 3 },
      { value: 'past', label: 'Já discipulei no passado', points: 2 },
      { value: 'informal', label: 'Já ajudei informalmente', points: 1 },
      { value: 'never', label: 'Nunca', points: 0 }
    ]
  },
  {
    id: 'biblical_knowledge',
    question: 'Como você avalia seu conhecimento bíblico?',
    category: 'knowledge',
    options: [
      { value: 'advanced', label: 'Avançado', points: 3 },
      { value: 'intermediate', label: 'Intermediário', points: 2 },
      { value: 'basic', label: 'Básico', points: 1 },
      { value: 'beginner', label: 'Iniciante', points: 0 }
    ]
  }
];

const DiagnosticForm = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check for existing diagnostic on component mount
  useEffect(() => {
    const checkExistingDiagnostic = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('diagnostics')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao verificar diagnóstico existente:', error);
          setIsLoading(false);
          return;
        }

        if (data) {
          // User already has a diagnostic, show result
          const parsedResult = JSON.parse(data.result);
          setResult(parsedResult);
          setAnswers(data.answers as Record<string, string>);
          setIsCompleted(true);
        }
      } catch (error) {
        console.error('Erro ao carregar diagnóstico:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingDiagnostic();
  }, [user]);

  const handleAnswer = (questionId: string, value: string) => {
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
    const categoryScores: Record<string, { total: number; max: number }> = {};
    
    questions.forEach(question => {
      const answer = answers[question.id];
      const option = question.options.find(opt => opt.value === answer);
      const points = option?.points || 0;
      
      if (!categoryScores[question.category]) {
        categoryScores[question.category] = { total: 0, max: 0 };
      }
      
      categoryScores[question.category].total += points;
      categoryScores[question.category].max += 3;
    });

    const totalScore = Object.values(categoryScores).reduce((sum, cat) => sum + cat.total, 0);
    const maxScore = Object.values(categoryScores).reduce((sum, cat) => sum + cat.max, 0);
    const percentage = Math.round((totalScore / maxScore) * 100);

    let level = 'novo';
    let recommendation = '';
    let recommendedTracks = [];

    if (percentage >= 80) {
      level = 'lider';
      recommendation = 'Você demonstra uma maturidade espiritual avançada! Está pronto para liderar e discipular outros.';
      recommendedTracks = ['Liderança Servidora'];
    } else if (percentage >= 50) {
      level = 'crescimento';
      recommendation = 'Você está em um bom caminho de crescimento espiritual! Hora de se aprofundar nas doutrinas.';
      recommendedTracks = ['Doutrinas Essenciais'];
    } else {
      level = 'novo';
      recommendation = 'Que bom ter você conosco! Vamos começar fortalecendo os fundamentos da sua fé.';
      recommendedTracks = ['Fundamentos da Fé', 'Primeiros Passos na Oração'];
    }

    return {
      level,
      percentage,
      recommendation,
      recommendedTracks,
      categoryScores,
      totalScore,
      maxScore
    };
  };

  const submitDiagnostic = async () => {
    if (!user) return;

    setIsSubmitting(true);
    const diagnosticResult = calculateResult();

    try {
      const { error } = await supabase
        .from('diagnostics')
        .insert({
          user_id: user.id,
          answers: answers,
          result: JSON.stringify(diagnosticResult)
        });

      if (error) throw error;

      setResult(diagnosticResult);
      setIsCompleted(true);
      
      toast({
        title: "Diagnóstico Concluído!",
        description: "Seu resultado foi salvo e suas trilhas foram recomendadas.",
      });
    } catch (error) {
      console.error('Erro ao salvar diagnóstico:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o diagnóstico. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const canProceed = answers[currentQ.id];

  // Show loading while checking for existing diagnostic
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Verificando seu diagnóstico...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted && result) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-700">
              Diagnóstico Concluído!
            </CardTitle>
            <CardDescription>
              Aqui está o resultado da sua avaliação espiritual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Seu Nível Atual</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {result.level === 'novo' && '🌱 Novo na Fé'}
                {result.level === 'crescimento' && '🌿 Em Crescimento'}
                {result.level === 'lider' && '🌳 Líder Maduro'}
              </div>
              <div className="text-lg text-gray-600">
                Pontuação: {result.percentage}% ({result.totalScore}/{result.maxScore} pontos)
              </div>
            </div>

            <div className="bg-white p-6 border-l-4 border-blue-500 rounded">
              <h4 className="font-semibold mb-2">O que isso significa:</h4>
              {result.level === 'novo' && (
                <div className="space-y-2">
                  <p className="text-gray-700">Você está no início da sua jornada espiritual! Isso é maravilhoso.</p>
                  <p className="text-gray-700">Neste estágio, é importante focar nos fundamentos: oração diária, leitura bíblica regular e participação ativa na comunidade.</p>
                  <p className="text-gray-700">Recomendamos começar com trilhas básicas para estabelecer uma base sólida na fé.</p>
                </div>
              )}
              {result.level === 'crescimento' && (
                <div className="space-y-2">
                  <p className="text-gray-700">Você está crescendo espiritualmente! Já tem bons hábitos estabelecidos.</p>
                  <p className="text-gray-700">Neste estágio, é hora de se aprofundar no conhecimento bíblico e começar a servir mais ativamente.</p>
                  <p className="text-gray-700">Considere participar de ministérios e começar a compartilhar sua fé com outros.</p>
                </div>
              )}
              {result.level === 'lider' && (
                <div className="space-y-2">
                  <p className="text-gray-700">Você demonstra maturidade espiritual avançada! Parabéns pelo seu crescimento.</p>
                  <p className="text-gray-700">Neste estágio, você está pronto para liderar e discipular outros, sendo um exemplo na fé.</p>
                  <p className="text-gray-700">Seu próximo passo é desenvolver suas habilidades de liderança servidora e mentoria.</p>
                </div>
              )}
            </div>

            <div className="bg-white p-6 border-l-4 border-green-500 rounded">
              <h4 className="font-semibold mb-2">Recomendação Personalizada:</h4>
              <p className="text-gray-700">{result.recommendation}</p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-3">Trilhas Recomendadas para Você:</h4>
              <div className="space-y-2">
                {result.recommendedTracks.map((track: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{track}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={() => window.location.href = '/trilhas'}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                🚀 Continuar para Trilhas Sugeridas
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="flex-1"
              >
                Ir para Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Diagnóstico Espiritual</CardTitle>
          <CardDescription className="text-center">
            Pergunta {currentQuestion + 1} de {questions.length}
          </CardDescription>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{currentQ.question}</h3>
            
            <RadioGroup
              value={answers[currentQ.id] || ''}
              onValueChange={(value) => handleAnswer(currentQ.id, value)}
            >
              {currentQ.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={submitDiagnostic}
                disabled={!canProceed || isSubmitting}
              >
                {isSubmitting ? 'Finalizando...' : 'Finalizar Diagnóstico'}
              </Button>
            ) : (
              <Button
                onClick={nextQuestion}
                disabled={!canProceed}
              >
                Próxima
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiagnosticForm;
