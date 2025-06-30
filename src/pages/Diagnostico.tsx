
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, BookOpen, Users, Heart, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Diagnostico = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      id: 0,
      question: "Há quanto tempo você é cristão?",
      options: [
        { value: "novo", label: "Menos de 1 ano (Novo Convertido)", points: { novo: 3, crescimento: 0, lider: 0 } },
        { value: "recente", label: "1-3 anos", points: { novo: 2, crescimento: 2, lider: 0 } },
        { value: "estabelecido", label: "3-10 anos", points: { novo: 0, crescimento: 3, lider: 1 } },
        { value: "maduro", label: "Mais de 10 anos", points: { novo: 0, crescimento: 1, lider: 3 } }
      ]
    },
    {
      id: 1,
      question: "Com que frequência você lê a Bíblia?",
      options: [
        { value: "raramente", label: "Raramente ou nunca", points: { novo: 3, crescimento: 0, lider: 0 } },
        { value: "ocasional", label: "Algumas vezes por mês", points: { novo: 2, crescimento: 2, lider: 0 } },
        { value: "regular", label: "Algumas vezes por semana", points: { novo: 1, crescimento: 3, lider: 1 } },
        { value: "diario", label: "Diariamente", points: { novo: 0, crescimento: 1, lider: 3 } }
      ]
    },
    {
      id: 2,
      question: "Como você descreveria sua vida de oração?",
      options: [
        { value: "iniciante", label: "Ainda estou aprendendo a orar", points: { novo: 3, crescimento: 1, lider: 0 } },
        { value: "ocasional", label: "Oro quando me lembro ou preciso", points: { novo: 2, crescimento: 2, lider: 0 } },
        { value: "consistente", label: "Tenho uma rotina de oração estabelecida", points: { novo: 0, crescimento: 3, lider: 2 } },
        { value: "profunda", label: "Oração é central na minha vida", points: { novo: 0, crescimento: 1, lider: 3 } }
      ]
    },
    {
      id: 3,
      question: "Qual seu envolvimento na igreja local?",
      options: [
        { value: "visitante", label: "Ainda estou conhecendo/visitando", points: { novo: 3, crescimento: 0, lider: 0 } },
        { value: "membro", label: "Participo dos cultos regularmente", points: { novo: 1, crescimento: 3, lider: 0 } },
        { value: "ativo", label: "Participo de ministérios/grupos", points: { novo: 0, crescimento: 2, lider: 2 } },
        { value: "lideranca", label: "Tenho responsabilidades de liderança", points: { novo: 0, crescimento: 0, lider: 3 } }
      ]
    },
    {
      id: 4,
      question: "Como você se sente sobre compartilhar sua fé?",
      options: [
        { value: "receoso", label: "Ainda tenho receio/não sei como fazer", points: { novo: 3, crescimento: 1, lider: 0 } },
        { value: "aprendendo", label: "Estou aprendendo, mas ainda é difícil", points: { novo: 2, crescimento: 3, lider: 0 } },
        { value: "confortavel", label: "Me sinto confortável compartilhando", points: { novo: 0, crescimento: 2, lider: 2 } },
        { value: "natural", label: "É algo natural e frequente pra mim", points: { novo: 0, crescimento: 0, lider: 3 } }
      ]
    }
  ];

  const handleAnswerChange = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = () => {
    const scores = { novo: 0, crescimento: 0, lider: 0 };
    
    Object.entries(answers).forEach(([questionIndex, answer]) => {
      const question = questions[parseInt(questionIndex)];
      const option = question.options.find(opt => opt.value === answer);
      if (option) {
        scores.novo += option.points.novo;
        scores.crescimento += option.points.crescimento;
        scores.lider += option.points.lider;
      }
    });

    const maxScore = Math.max(scores.novo, scores.crescimento, scores.lider);
    let result = 'crescimento';
    if (scores.novo === maxScore) result = 'novo';
    else if (scores.lider === maxScore) result = 'lider';

    setShowResult(true);
    // Store result for later use
    localStorage.setItem('diagnosticoResult', result);
  };

  const getResultContent = () => {
    const result = localStorage.getItem('diagnosticoResult') || 'crescimento';
    
    const resultData = {
      novo: {
        title: "Novo Convertido",
        icon: <Sparkles className="h-12 w-12 text-yellow-500" />,
        description: "Você está no início de uma jornada incrível! Vamos fortalecer os fundamentos da sua fé.",
        color: "from-yellow-400 to-orange-500",
        tracks: ["Fundamentos da Fé", "Primeiros Passos na Oração", "Conhecendo a Bíblia"]
      },
      crescimento: {
        title: "Em Crescimento",
        icon: <BookOpen className="h-12 w-12 text-blue-500" />,
        description: "Você já tem uma base sólida e está pronto para aprofundar sua caminhada cristã.",
        color: "from-blue-400 to-purple-500",
        tracks: ["Doutrinas Essenciais", "Dons Espirituais", "Vida em Comunidade", "Evangelismo Prático"]
      },
      lider: {
        title: "Líder em Formação",
        icon: <Users className="h-12 w-12 text-green-500" />,
        description: "Você demonstra maturidade espiritual e está pronto para liderar e discipular outros.",
        color: "from-green-400 to-emerald-500",
        tracks: ["Liderança Servidora", "Aconselhamento Bíblico", "Gestão de Pequenos Grupos", "Apologética"]
      }
    };

    return resultData[result as keyof typeof resultData];
  };

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  if (showResult) {
    const result = getResultContent();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="overflow-hidden shadow-2xl">
            <div className={`bg-gradient-to-r ${result.color} p-8 text-white text-center`}>
              <div className="mb-4">{result.icon}</div>
              <h1 className="text-3xl font-bold mb-2">Seu Perfil: {result.title}</h1>
              <p className="text-lg opacity-90">{result.description}</p>
            </div>
            
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                Trilhas Recomendadas para Você
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {result.tracks.map((track, index) => (
                  <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Heart className="h-5 w-5 text-red-500 mr-3" />
                    <span className="font-medium">{track}</span>
                  </div>
                ))}
              </div>
              
              <div className="text-center space-y-4">
                <Button
                  size="lg"
                  className={`bg-gradient-to-r ${result.color} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                  onClick={() => navigate('/trilhas')}
                >
                  Começar Minhas Trilhas
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <div>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                  >
                    Voltar ao Início
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Diagnóstico Espiritual
            </h1>
            <p className="text-gray-600">
              Descubra qual trilha de discipulado é ideal para seu momento atual
            </p>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Pergunta {currentQuestion + 1} de {questions.length}</span>
              <span>{Math.round(progressPercentage)}% concluído</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">
              {questions[currentQuestion].question}
            </CardTitle>
            <CardDescription>
              Selecione a opção que melhor descreve sua situação atual
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <RadioGroup
              value={answers[currentQuestion] || ""}
              onValueChange={handleAnswerChange}
              className="space-y-4"
            >
              {questions[currentQuestion].options.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label 
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              
              <Button
                onClick={nextQuestion}
                disabled={!answers[currentQuestion]}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {currentQuestion === questions.length - 1 ? 'Ver Resultado' : 'Próxima'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Diagnostico;
