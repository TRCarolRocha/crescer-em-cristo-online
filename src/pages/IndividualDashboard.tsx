import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Users, Compass, ArrowRight, Home, Settings, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChurch } from "@/contexts/ChurchContext";
import { usePermissions } from "@/hooks/usePermissions";
import UserMenu from "@/components/auth/UserMenu";

const IndividualDashboard = () => {
  const navigate = useNavigate();
  const { church } = useChurch();
  const { isSuperAdmin, isChurchAdmin } = usePermissions();

  const navigationCards = [
    ...(church ? [{
      icon: Home,
      title: "Minha Igreja",
      description: `Voltar para ${church.name}`,
      color: "from-blue-500 to-cyan-500",
      action: () => navigate(`/igreja/${church.slug}`)
    }] : []),
    ...(isChurchAdmin || isSuperAdmin ? [{
      icon: Settings,
      title: "Gerenciar Igreja",
      description: "Acessar painel administrativo",
      color: "from-orange-500 to-red-500",
      action: () => navigate(isSuperAdmin ? '/admin/hodos' : '/admin/igrejas/monte-hebrom')
    }] : []),
    ...(isSuperAdmin ? [{
      icon: Settings,
      title: "Dashboard Hodos",
      description: "Gerenciar plataforma completa",
      color: "from-purple-500 to-pink-500",
      action: () => navigate('/admin/hodos')
    }] : []),
    {
      icon: Users,
      title: "Meu Perfil",
      description: "Gerenciar suas informações",
      color: "from-green-500 to-emerald-500",
      action: () => navigate('/perfil')
    },
    {
      icon: BookOpen,
      title: "Devocionais",
      description: "Acessar devocionais diários",
      color: "from-indigo-500 to-blue-500",
      action: () => navigate('/devocional')
    },
    {
      icon: Compass,
      title: "Trilhas",
      description: "Explorar trilhas de discipulado",
      color: "from-teal-500 to-cyan-500",
      action: () => navigate('/trilhas')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#7b2ff7] to-[#f107a3] flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Hodos</h1>
              <p className="text-xs text-white/60">Meu Espaço</p>
            </div>
          </button>
          <UserMenu />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Welcome Section */}
        <section className="text-center space-y-6 py-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white animate-fade-in">
            Bem-vindo ao Seu Espaço
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Seu hub central de navegação no Hodos
          </p>
        </section>

        {/* Navigation Cards */}
        <section className="space-y-8">
          <h3 className="text-3xl font-bold text-center text-white">Acesso Rápido</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {navigationCards.map((feature, index) => (
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
        {!church && (
          <section className="text-center py-12 space-y-6">
            <Card className="p-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/20">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-blue-400" />
              <h3 className="text-3xl font-bold mb-4 text-white">Procurando uma Igreja?</h3>
              <p className="text-lg text-slate-300 mb-6 max-w-2xl mx-auto">
                Entre em contato conosco para conectar sua comunidade ao Hodos
              </p>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => navigate('/fale-com-lideranca')}
              >
                Falar com o Suporte
              </Button>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
};

export default IndividualDashboard;
