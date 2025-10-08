import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BookOpen, Users, Compass, ArrowRight, Home, Settings, MessageCircle, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChurch } from "@/contexts/ChurchContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import UserMenu from "@/components/auth/UserMenu";

const IndividualDashboard = () => {
  const navigate = useNavigate();
  const { church } = useChurch();
  const { isSuperAdmin, isChurchAdmin, isVisitor } = usePermissions();

  // Buscar conteúdos públicos para visitors
  const { data: publicDevocionais } = useQuery({
    queryKey: ['public-devocionais'],
    queryFn: async () => {
      const { data } = await supabase
        .from('devocionais')
        .select('*')
        .eq('is_public', true)
        .order('data', { ascending: false })
        .limit(5);
      return data;
    },
    enabled: isVisitor
  });

  const { data: publicTracks } = useQuery({
    queryKey: ['public-tracks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('discipleship_tracks')
        .select('*')
        .eq('is_public', true)
        .limit(5);
      return data;
    },
    enabled: isVisitor
  });

  // Cards condicionais baseados em role
  const navigationCards = [
    // Cards para usuários com igreja
    ...(church && !isVisitor ? [{
      icon: Home,
      title: "Minha Igreja",
      description: `Voltar para ${church.name}`,
      color: "from-blue-500 to-cyan-500",
      action: () => navigate(`/igreja/${church.slug}`)
    }] : []),
    
    // Cards administrativos
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
    
    // Cards disponíveis para todos (exceto visitors em alguns casos)
    ...(!isVisitor ? [{
      icon: Users,
      title: "Meu Perfil",
      description: "Gerenciar suas informações",
      color: "from-green-500 to-emerald-500",
      action: () => navigate('/perfil')
    }] : []),
    
    // Cards públicos (disponíveis para visitors)
    {
      icon: BookOpen,
      title: isVisitor ? "Devocionais Públicos" : "Devocionais",
      description: isVisitor 
        ? `${publicDevocionais?.length || 0} devocionais disponíveis`
        : "Acessar devocionais diários",
      color: "from-indigo-500 to-blue-500",
      action: () => navigate('/devocional')
    },
    {
      icon: Compass,
      title: isVisitor ? "Trilhas Abertas" : "Trilhas",
      description: isVisitor
        ? `${publicTracks?.length || 0} trilhas públicas`
        : "Explorar trilhas de discipulado",
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
            {isVisitor 
              ? "Explore conteúdos públicos do Hodos"
              : "Seu hub central de navegação no Hodos"
            }
          </p>
        </section>

        {/* Alert para Visitors */}
        {isVisitor && (
          <Alert className="max-w-2xl mx-auto bg-blue-500/10 border-blue-500/30">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertTitle className="text-white">Bem-vindo ao Hodos!</AlertTitle>
            <AlertDescription className="text-white/70">
              Você está visualizando conteúdo público. Para acessar recursos completos e conectar-se a uma igreja, entre em contato com um administrador.
            </AlertDescription>
          </Alert>
        )}

        {/* Navigation Cards */}
        <section className="space-y-8">
          <h3 className="text-3xl font-bold text-center text-white">Acesso Rápido</h3>
          
          {/* Mobile: Carrossel horizontal */}
          <div className="md:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4">
            <div className="flex gap-4 px-4">
              {navigationCards.map((feature, index) => (
                <Card
                  key={index}
                  className="min-w-[280px] snap-center flex-shrink-0 feature-card cursor-pointer hover:scale-105 transition-all duration-300"
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
          </div>

          {/* Desktop: Grid normal */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
