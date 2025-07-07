
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, BookOpen, Users, Heart, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChurchHeader from "@/components/ChurchHeader";
import StatsSection from "@/components/StatsSection";
import TestimonialsSection from "@/components/TestimonialsSection";

const Index = () => {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Trilhas Personalizadas",
      description: "Jornadas de crescimento adaptadas ao seu nível de maturidade espiritual na Monte Hebrom",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Mentoria Um-a-Um",
      description: "Conecte-se com mentores qualificados da nossa igreja local",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Devocionais Interativos",
      description: "Transforme seu tempo com Deus em uma experiência rica e pessoal",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Integração com a Igreja",
      description: "Fortaleça nossa congregação com acompanhamento e cuidado pastoral",
      color: "from-orange-500 to-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Church Header */}
      <ChurchHeader />

      {/* Stats Section */}
      <StatsSection />

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-b from-white to-gray-50">
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

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para Crescer na Monte Hebrom?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Faça parte da nossa jornada de discipulado digital e fortaleça sua caminhada cristã junto com nossa igreja
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate('/diagnostico')}
            >
              Começar Meu Diagnóstico
              <CheckCircle className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Falar com a Liderança
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
