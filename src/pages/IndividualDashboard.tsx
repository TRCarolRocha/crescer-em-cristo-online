import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Users, Compass, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import hodosLogo from "@/assets/hodos-logo.png";

const IndividualDashboard = () => {
  const navigate = useNavigate();

  const publicFeatures = [
    {
      icon: BookOpen,
      title: "Devocionais Públicos",
      description: "Acesse conteúdo devocional gratuito",
      color: "from-blue-500 to-cyan-500",
      action: () => navigate('/devocional')
    },
    {
      icon: Users,
      title: "Trilhas de Discipulado",
      description: "Comece sua jornada espiritual",
      color: "from-purple-500 to-pink-500",
      action: () => navigate('/trilhas')
    },
    {
      icon: Compass,
      title: "Procurar Igrejas",
      description: "Encontre uma comunidade perto de você",
      color: "from-green-500 to-emerald-500",
      action: () => {} // TODO: Implement church search
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={hodosLogo} alt="Hodos" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-white">Hodos</h1>
              <p className="text-xs text-white/60">Seu Espaço Pessoal</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/perfil')}
            className="border-white/30 bg-white/5 text-white hover:bg-white/10"
          >
            Perfil
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Welcome Section */}
        <section className="text-center space-y-6 py-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white animate-fade-in">
            Bem-vindo ao Seu Espaço
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Explore conteúdos de discipulado, devocionais e encontre sua comunidade de fé
          </p>
        </section>

        {/* Public Features */}
        <section className="space-y-8">
          <h3 className="text-3xl font-bold text-center text-white">Recursos Disponíveis</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {publicFeatures.map((feature, index) => (
              <Card
                key={index}
                className="feature-card cursor-pointer hover:scale-105 transition-all duration-300"
                onClick={feature.action}
              >
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-foreground mb-3">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground mb-4">
                  {feature.description}
                </p>
                <Button variant="ghost" className="group">
                  Acessar
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12 space-y-6">
          <Card className="p-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/20">
            <h3 className="text-3xl font-bold mb-4">Procurando uma Igreja?</h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Conecte-se com uma comunidade local e experimente o discipulado em comunhão
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Explorar Igrejas Cadastradas
            </Button>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default IndividualDashboard;
