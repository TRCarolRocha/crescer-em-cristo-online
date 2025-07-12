
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, BookOpen, Users, Heart, TrendingUp, Calendar, MessageSquare, Book } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import ChurchHeader from "@/components/ChurchHeader";
import CarrosselAvisos from "@/components/CarrosselAvisos";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [hasCompletedDiagnostic, setHasCompletedDiagnostic] = useState(false);

  useEffect(() => {
    if (user) {
      checkDiagnosticStatus();
    }
  }, [user]);

  const checkDiagnosticStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('diagnosticos')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data && !error) {
        setHasCompletedDiagnostic(true);
      }
    } catch (error) {
      console.log('Usuário ainda não fez o diagnóstico');
    }
  };

  const handleContinueJourney = () => {
    if (user && hasCompletedDiagnostic) {
      navigate('/trilhas');
    } else {
      navigate('/diagnostico');
    }
  };

  const features = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Trilhas Personalizadas",
      description: "Jornadas de crescimento adaptadas ao seu nível de maturidade espiritual na Monte Hebrom",
      color: "from-blue-500 to-indigo-600",
      action: () => navigate('/trilhas')
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Diagnóstico Espiritual",
      description: "Descubra seu nível espiritual em 2 minutos e receba recomendações personalizadas",
      color: "from-purple-500 to-pink-600",
      action: () => navigate('/diagnostico')
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Devocionais Interativos",
      description: "Transforme seu tempo com Deus em uma experiência rica e pessoal",
      color: "from-emerald-500 to-teal-600",
      action: () => navigate('/devocional')
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Comunidade da Fé",
      description: "Conecte-se com outros membros e cresça juntos em comunhão",
      color: "from-orange-500 to-red-600",
      action: () => navigate('/comunicacao')
    }
  ];

  const churchFeatures = [
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Agenda da Igreja",
      description: "Acompanhe todos os eventos, cultos, estudos e atividades da Monte Hebrom",
      color: "from-blue-500 to-cyan-600",
      action: () => navigate('/agenda')
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Comunicação",
      description: "Feed social para compartilhar momentos e se conectar com a família da fé",
      color: "from-purple-500 to-violet-600",
      action: () => navigate('/comunicacao')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Church Header */}
      <ChurchHeader />

      {/* Hero Section com botões movidos do rodapé */}
      <div className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Pronto para Crescer na Monte Hebrom?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Juntos, como corpo de Cristo, vivemos o IDE com paixão, unidade e avivamento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate('/devocional')}
            >
              <Book className="mr-2 h-5 w-5" />
              📖 Acessar Devocionais
            </Button>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleContinueJourney}
            >
              {user && hasCompletedDiagnostic ? (
                <>
                  📚 Continuar Jornada
                  <CheckCircle className="ml-2 h-5 w-5" />
                </>
              ) : (
                <>
                  🪧 Descobrir Meu Nível Espiritual
                  <CheckCircle className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Quatro Pilares do Discipulado */}
      <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Quatro Pilares do Nosso Discipulado
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma foi cuidadosamente projetada para nutrir cada aspecto da jornada cristã em nossa igreja
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={`relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer ${
                  hoveredFeature === index ? 'scale-105' : ''
                }`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                onClick={feature.action}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 hover:opacity-10 transition-opacity duration-300`} />
                <CardHeader className="text-center">
                  <div className={`mx-auto mb-4 p-3 rounded-full bg-gradient-to-r ${feature.color} text-white w-fit`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Carrossel de Avisos */}
      <CarrosselAvisos />

      {/* Church Management Features - removido "Membros da Igreja" */}
      <div className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Gestão da Nossa Igreja
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ferramentas completas para fortalecer a comunhão e organização da Monte Hebrom
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {churchFeatures.map((feature, index) => (
              <Card 
                key={index}
                className="relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
                onClick={feature.action}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 hover:opacity-10 transition-opacity duration-300`} />
                <CardHeader className="text-center">
                  <div className={`mx-auto mb-4 p-3 rounded-full bg-gradient-to-r ${feature.color} text-white w-fit`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer atualizado com "Fale com a Liderança" */}
      <div className="py-16 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Precisa de Ajuda ou Orientação?
          </h3>
          <p className="text-gray-300 mb-8">
            Nossa liderança está disponível para conversar e apoiar sua jornada espiritual
          </p>
          <Button 
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-8 py-4"
            onClick={() => navigate('/fale-com-lideranca')}
          >
            💬 Falar com a Liderança
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
