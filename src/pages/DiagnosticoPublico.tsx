
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, ArrowLeft, Lock, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  }
];

const DiagnosticoPublico = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

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

  const calculatePreview = () => {
    const totalScore = Object.keys(answers).reduce((sum, questionId) => {
      const question = questions.find(q => q.id === questionId);
      const answer = answers[questionId];
      const option = question?.options.find(opt => opt.value === answer);
      return sum + (option?.points || 0);
    }, 0);

    const maxScore = questions.length * 3;
    const percentage = Math.round((totalScore / maxScore) * 100);

    let level = 'novo';
    let recommendation = '';

    if (percentage >= 80) {
      level = 'lider';
      recommendation = 'Você demonstra uma maturidade espiritual avançada!';
    } else if (percentage >= 50) {
      level = 'crescimento';
      recommendation = 'Você está em um bom caminho de crescimento espiritual!';
    } else {
      level = 'novo';
      recommendation = 'Que bom ter você conosco! Vamos começar fortalecendo os fundamentos.';
    }

    return { level, percentage, recommendation };
  };

  const finishPreview = () => {
    setShowPreview(true);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const canProceed = answers[currentQ.id];

  if (showPreview) {
    const preview = calculatePreview();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Voltar para Home
            </Button>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <CardTitle className="text-2xl text-green-700">
                  Preview do Seu Resultado!
                </CardTitle>
                <CardDescription>
                  🪧 Descubra seu nível espiritual completo fazendo login
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Seu Nível Atual</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {preview.level === 'novo' && '🌱 Novo na Fé'}
                    {preview.level === 'crescimento' && '🌿 Em Crescimento'}
                    {preview.level === 'lider' && '🌳 Líder Maduro'}
                  </div>
                  <div className="text-lg text-gray-600">
                    Pontuação: {preview.percentage}%
                  </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Resultado Completo Disponível com Login
                  </h4>
                  <p className="text-gray-700 mb-4">
                    📊 O diagnóstico gera um relatório personalizado com:
                  </p>
                  <ul className="text-left text-sm text-gray-600 space-y-1 mb-4">
                    <li>• Análise detalhada por categoria</li>
                    <li>• Recomendações personalizadas de trilhas</li>
                    <li>• Plano de crescimento espiritual</li>
                    <li>• Acompanhamento de progresso</li>
                  </ul>
                  <p className="text-sm text-gray-500">
                    🔒 Para ver o resultado completo, faça login ou cadastre-se gratuitamente.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="flex-1"
                  >
                    Ver Resultado Completo
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="flex-1"
                  >
                    Ir para Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Voltar para Home
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            🪧 Descubra seu nível espiritual em 2 minutos!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Faça nosso diagnóstico espiritual e descubra onde você está em sua jornada com Deus.
            O resultado gera um relatório personalizado com recomendações de trilhas.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
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
                    onClick={finishPreview}
                    disabled={!canProceed}
                  >
                    Ver Preview do Resultado
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
      </div>
    </div>
  );
};

export default DiagnosticoPublico;
