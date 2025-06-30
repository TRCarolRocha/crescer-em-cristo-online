
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Users, Heart, TrendingUp, Star, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Trilhas Personalizadas",
      description: "Jornadas de crescimento adaptadas ao seu nível de maturidade espiritual",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Mentoria Um-a-Um",
      description: "Conecte-se com mentores qualificados da sua igreja local",
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
      title: "Integração com Igreja",
      description: "Fortaleça sua congregação com dados e insights valiosos",
      color: "from-orange-500 to-red-600"
    }
  ];

  const testimonials = [
    {
      name: "Pastor João Silva",
      role: "Igreja Batista Central",
      quote: "Nossa congregação cresceu 40% em maturidade espiritual nos últimos 6 meses.",
      rating: 5
    },
    {
      name: "Maria Santos",
      role: "Líder de Pequenos Grupos",
      quote: "Finalmente tenho uma ferramenta que me ajuda a acompanhar cada pessoa individualmente.",
      rating: 5
    },
    {
      name: "Carlos Oliveira",
      role: "Novo Convertido",
      quote: "As trilhas me guiaram desde os primeiros passos até me tornar um líder de ministério.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
              ✨ Transformando Vidas Através do Discipulado Digital
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-900 via-purple-800 to-indigo-900 bg-clip-text text-transparent mb-6">
              Hub de Discipulado
              <span className="block">Digital</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              A principal ferramenta digital para fortalecer o discipulado um-a-um e formar discípulos maduros e atuantes nas igrejas locais do Brasil.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => navigate('/diagnostico')}
              >
                Começar Minha Jornada
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                Ver Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Discípulos Ativos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-600">Igrejas Parceiras</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">25</div>
              <div className="text-gray-600">Trilhas Disponíveis</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">98%</div>
              <div className="text-gray-600">Satisfação</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Quatro Pilares do Crescimento
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma foi cuidadosamente projetada para nutrir cada aspecto da jornada cristã
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
      <div className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Vidas Transformadas
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Veja como nossa plataforma tem impactado igrejas e discípulos em todo o Brasil
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-blue-200 text-sm">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para Transformar Sua Jornada Espiritual?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de cristãos que já estão crescendo através do nosso Hub de Discipulado Digital
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate('/diagnostico')}
            >
              Fazer Diagnóstico Gratuito
              <CheckCircle className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Falar com Nossa Equipe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
