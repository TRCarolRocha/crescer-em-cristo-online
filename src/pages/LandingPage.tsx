import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Users, Building2, ArrowRight, Heart, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import hodosLogo from "@/assets/hodos-logo.png";

const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: BookOpen,
      title: "Jornada de Discipulado",
      description: "Trilhas personalizadas para cada etapa da sua fé",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "Comunidade de Fé",
      description: "Conecte-se com outros cristãos e fortaleça sua caminhada",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Building2,
      title: "Gestão de Igrejas",
      description: "Ferramentas completas para líderes e administradores",
      gradient: "from-indigo-500 to-blue-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_50%)] animate-pulse" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)] animate-fade-in" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)] animate-fade-in" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center animate-scale-in">
            <img 
              src={hodosLogo} 
              alt="Hodos Logo" 
              className="h-24 w-24 object-contain drop-shadow-2xl"
            />
          </div>

          {/* Main Title - Aerora Style */}
          <h1 className="hodos-title mb-4 animate-fade-in">
            HODOS
          </h1>

          {/* Subtitle */}
          <p className="text-2xl md:text-3xl font-semibold text-white/90 mb-2 animate-fade-in delay-100">
            Hub de Discipulado Digital
          </p>

          {/* Tagline */}
          <p className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto animate-fade-in delay-200">
            Um caminho de fé, propósito e conexão digital
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in delay-300">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-6 text-lg shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
            >
              Entrar
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToFeatures}
              className="border-2 border-white/30 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 px-8 py-6 text-lg transition-all duration-300 hover:scale-105"
            >
              Explorar o Hodos
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-20 left-10 animate-float">
            <Heart className="h-8 w-8 text-pink-400/20" />
          </div>
          <div className="absolute bottom-20 right-10 animate-float delay-1000">
            <Sparkles className="h-8 w-8 text-blue-400/20" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-6 animate-fade-in">
            Uma Plataforma Completa
          </h2>
          <p className="text-xl text-white/70 text-center mb-16 max-w-2xl mx-auto">
            Ferramentas poderosas para crescimento espiritual e gestão comunitária
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="feature-card group hover:scale-105 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="container mx-auto text-center">
          <p className="text-white/60 mb-4">
            © 2025 Hodos - Hub de Discipulado Digital. Todos os direitos reservados.
          </p>
          <div className="flex justify-center gap-6 text-sm text-white/50">
            <a href="#" className="hover:text-white/80 transition-colors">Sobre</a>
            <a href="#" className="hover:text-white/80 transition-colors">Contato</a>
            <a href="#" className="hover:text-white/80 transition-colors">Para Igrejas</a>
            <a href="#" className="hover:text-white/80 transition-colors">Termos</a>
            <a href="#" className="hover:text-white/80 transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
