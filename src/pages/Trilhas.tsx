
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, Play, CheckCircle, Clock, Users, Star, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Trilhas = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState('crescimento');

  useEffect(() => {
    const result = localStorage.getItem('diagnosticoResult');
    if (result) {
      setUserProfile(result);
    }
  }, []);

  const trilhasData = {
    novo: {
      title: "Trilhas para Novos Convertidos",
      color: "from-yellow-400 to-orange-500",
      trilhas: [
        {
          id: 1,
          title: "Fundamentos da Fé",
          description: "Aprenda os pilares essenciais da fé cristã",
          lessons: 8,
          duration: "4 semanas",
          difficulty: "Iniciante",
          progress: 0,
          topics: ["Salvação", "Oração", "Leitura Bíblica", "Comunhão"],
          featured: true
        },
        {
          id: 2,
          title: "Primeiros Passos na Oração",
          description: "Desenvolva uma vida de oração consistente e significativa",
          lessons: 6,
          duration: "3 semanas",
          difficulty: "Iniciante",
          progress: 0,
          topics: ["Como orar", "Oração do Pai Nosso", "Oração pessoal", "Jejum"]
        },
        {
          id: 3,
          title: "Conhecendo a Bíblia",
          description: "Introdução à estrutura e principais histórias bíblicas",
          lessons: 10,
          duration: "5 semanas",
          difficulty: "Iniciante",
          progress: 0,
          topics: ["Antigo Testamento", "Novo Testamento", "Personagens", "Promessas"]
        }
      ]
    },
    crescimento: {
      title: "Trilhas de Crescimento",
      color: "from-blue-400 to-purple-500",
      trilhas: [
        {
          id: 4,
          title: "Doutrinas Essenciais",
          description: "Aprofunde-se nas verdades fundamentais da fé cristã",
          lessons: 12,
          duration: "6 semanas",
          difficulty: "Intermediário",
          progress: 25,
          topics: ["Trindade", "Pecado", "Redenção", "Santificação"],
          featured: true
        },
        {
          id: 5,
          title: "Dons Espirituais",
          description: "Descubra e desenvolva seus dons espirituais",
          lessons: 8,
          duration: "4 semanas",
          difficulty: "Intermediário",
          progress: 0,
          topics: ["Identificação", "Desenvolvimento", "Exercício", "Frutificação"]
        },
        {
          id: 6,
          title: "Vida em Comunidade",
          description: "Aprenda a viver em comunhão cristã autêntica",
          lessons: 10,
          duration: "5 semanas",
          difficulty: "Intermediário",
          progress: 60,
          topics: ["Relacionamentos", "Perdão", "Servir", "Conflitos"]
        },
        {
          id: 7,
          title: "Evangelismo Prático",
          description: "Compartilhe sua fé com confiança e amor",
          lessons: 9,
          duration: "4 semanas",
          difficulty: "Intermediário",
          progress: 0,
          topics: ["Testemunho", "Abordagem", "Objeções", "Discipulado"]
        }
      ]
    },
    lider: {
      title: "Trilhas de Liderança",
      color: "from-green-400 to-emerald-500",
      trilhas: [
        {
          id: 8,
          title: "Liderança Servidora",
          description: "Desenvolva um coração de servo-líder como Cristo",
          lessons: 15,
          duration: "8 semanas",
          difficulty: "Avançado",
          progress: 40,
          topics: ["Caráter", "Humildade", "Visão", "Influência"],
          featured: true
        },
        {
          id: 9,
          title: "Aconselhamento Bíblico",
          description: "Aprenda a aconselhar com sabedoria bíblica",
          lessons: 12,
          duration: "6 semanas",
          difficulty: "Avançado",
          progress: 0,
          topics: ["Escuta", "Sabedoria", "Aplicação", "Acompanhamento"]
        },
        {
          id: 10,
          title: "Gestão de Pequenos Grupos",
          description: "Lidere pequenos grupos com excelência",
          lessons: 10,
          duration: "5 semanas",
          difficulty: "Avançado",
          progress: 80,
          topics: ["Planejamento", "Facilitação", "Cuidado", "Multiplicação"]
        },
        {
          id: 11,
          title: "Apologética Cristã",
          description: "Defenda sua fé com razão e amor",
          lessons: 14,
          duration: "7 semanas",
          difficulty: "Avançado",
          progress: 0,
          topics: ["Fundamentos", "Objeções", "Diálogo", "Defesa"]
        }
      ]
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante': return 'bg-green-100 text-green-800';
      case 'Intermediário': return 'bg-blue-100 text-blue-800';
      case 'Avançado': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TrilhaCard = ({ trilha }: { trilha: any }) => (
    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      {trilha.featured && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-yellow-500 text-white">
            <Star className="h-3 w-3 mr-1" />
            Recomendada
          </Badge>
        </div>
      )}
      
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg pr-4">{trilha.title}</CardTitle>
        </div>
        <CardDescription className="mb-4">
          {trilha.description}
        </CardDescription>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="text-xs">
            <BookOpen className="h-3 w-3 mr-1" />
            {trilha.lessons} aulas
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {trilha.duration}
          </Badge>
          <Badge className={`text-xs ${getDifficultyColor(trilha.difficulty)}`}>
            {trilha.difficulty}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {trilha.progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progresso</span>
              <span>{trilha.progress}%</span>
            </div>
            <Progress value={trilha.progress} className="h-2" />
          </div>
        )}
        
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Tópicos:</h4>
          <div className="flex flex-wrap gap-1">
            {trilha.topics.map((topic: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
        
        <Button 
          className="w-full"
          variant={trilha.progress > 0 ? "default" : "outline"}
        >
          {trilha.progress > 0 ? (
            <>
              <Play className="h-4 w-4 mr-2" />
              Continuar
            </>
          ) : (
            <>
              <BookOpen className="h-4 w-4 mr-2" />
              Começar
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Suas Trilhas de Discipulado
            </h1>
            <p className="text-xl text-gray-600">
              Jornadas personalizadas para seu crescimento espiritual
            </p>
          </div>
        </div>

        <Tabs defaultValue={userProfile} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="novo" className="text-sm">
              <Award className="h-4 w-4 mr-2" />
              Novo Convertido
            </TabsTrigger>
            <TabsTrigger value="crescimento" className="text-sm">
              <BookOpen className="h-4 w-4 mr-2" />
              Em Crescimento
            </TabsTrigger>
            <TabsTrigger value="lider" className="text-sm">
              <Users className="h-4 w-4 mr-2" />
              Liderança
            </TabsTrigger>
          </TabsList>

          {Object.entries(trilhasData).map(([key, data]) => (
            <TabsContent key={key} value={key}>
              <div className="mb-6">
                <div className={`bg-gradient-to-r ${data.color} p-6 rounded-lg text-white text-center`}>
                  <h2 className="text-2xl font-bold mb-2">{data.title}</h2>
                  <p className="opacity-90">
                    Trilhas cuidadosamente selecionadas para seu nível de maturidade espiritual
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.trilhas.map((trilha) => (
                  <TrilhaCard key={trilha.id} trilha={trilha} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Stats Section */}
        <div className="mt-16 bg-white/50 backdrop-blur-sm rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Seu Progresso Geral</h2>
            <p className="text-gray-600">Acompanhe sua jornada de crescimento espiritual</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">5</div>
              <div className="text-gray-600 text-sm">Trilhas Iniciadas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">2</div>
              <div className="text-gray-600 text-sm">Trilhas Concluídas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">42</div>
              <div className="text-gray-600 text-sm">Aulas Assistidas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">15</div>
              <div className="text-gray-600 text-sm">Dias Consecutivos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trilhas;
