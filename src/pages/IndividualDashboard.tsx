import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BookOpen, Users, Compass, ArrowRight, Home, Settings, MessageCircle, Info, Search, Calendar, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChurch } from "@/contexts/ChurchContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import UserMenu from "@/components/auth/UserMenu";
import { BottomNav } from "@/components/layout/BottomNav";
import { Input } from "@/components/ui/input";
import { SubscriptionBanner } from '@/components/subscription/SubscriptionBanner';

const IndividualDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { church } = useChurch();
  const { isSuperAdmin, isChurchAdmin, isVisitor } = usePermissions();
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<'active' | 'pending' | 'expired' | null>(null);
  const [planType, setPlanType] = React.useState<string>('');

  React.useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;

      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('status, subscription_plans(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (subscriptions && subscriptions.length > 0) {
        const sub = subscriptions[0];
        setSubscriptionStatus(sub.status as any);
        setPlanType((sub.subscription_plans as any)?.name || '');
      }
    };

    checkSubscription();
  }, [user]);

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

  // Quick access pills (mais compactos)
  const quickAccessItems = [
    {
      icon: BookOpen,
      label: "Devocional",
      color: "from-indigo-500 to-blue-500",
      action: () => navigate('/devocional')
    },
    {
      icon: Compass,
      label: "Trilhas",
      color: "from-teal-500 to-cyan-500",
      action: () => navigate('/trilhas')
    },
    {
      icon: Calendar,
      label: "Agenda",
      color: "from-purple-500 to-pink-500",
      action: () => navigate('/agenda')
    },
    {
      icon: MessageCircle,
      label: "Chat",
      color: "from-green-500 to-emerald-500",
      action: () => navigate('/comunicacao')
    },
    {
      icon: TrendingUp,
      label: "Progresso",
      color: "from-orange-500 to-red-500",
      action: () => navigate('/progresso')
    }
  ];

  // Journey cards (2x2 grid)
  const journeyCards = [
    ...(!isVisitor ? [{
      icon: Users,
      title: "Perfil",
      description: "Suas informações",
      color: "from-green-500 to-emerald-500",
      action: () => navigate('/perfil')
    }] : []),
    {
      icon: BookOpen,
      title: "Devocionais",
      description: isVisitor ? `${publicDevocionais?.length || 0} públicos` : "Diários",
      color: "from-indigo-500 to-blue-500",
      action: () => navigate('/devocional')
    },
    {
      icon: Compass,
      title: "Trilhas",
      description: isVisitor ? `${publicTracks?.length || 0} abertas` : "Discipulado",
      color: "from-teal-500 to-cyan-500",
      action: () => navigate('/trilhas')
    },
    {
      icon: TrendingUp,
      title: "Progresso",
      description: "Sua jornada",
      color: "from-orange-500 to-red-500",
      action: () => navigate('/progresso')
    }
  ];

  // Admin cards
  const adminCards = [
    ...(isChurchAdmin || isSuperAdmin ? [{
      icon: Settings,
      title: "Gerenciar",
      description: "Painel admin",
      color: "from-orange-500 to-red-500",
      action: () => navigate(isSuperAdmin ? '/admin/hodos' : '/admin/igrejas/monte-hebrom')
    }] : []),
    ...(isSuperAdmin ? [{
      icon: Settings,
      title: "Hodos",
      description: "Dashboard completo",
      color: "from-purple-500 to-pink-500",
      action: () => navigate('/admin/hodos')
    }] : [])
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

      <main className="container mx-auto px-4 pb-24 md:pb-12 space-y-6">
        {/* Subscription Banner */}
        {subscriptionStatus === 'pending' && (
          <div className="pt-6">
            <SubscriptionBanner status="pending" planType={planType} />
          </div>
        )}
        
        {subscriptionStatus === 'expired' && (
          <div className="pt-6">
            <SubscriptionBanner 
              status="expired" 
              planType={planType}
              onRenew={() => navigate('/planos')}
            />
          </div>
        )}

        {/* Welcome Section - Compact for mobile */}
        <section className="text-center space-y-3 py-6">
          <h2 className="text-3xl md:text-5xl font-bold text-white animate-fade-in">
            Bem-vindo
          </h2>
          <p className="text-sm md:text-xl text-white/70">
            {isVisitor 
              ? "Explore conteúdos públicos do Hodos"
              : "Seu hub central de navegação"
            }
          </p>
        </section>

        {/* Search Bar - Mobile */}
        <div className="md:hidden px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar devocionais, trilhas..." 
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
        </div>

        {/* Alert para Visitors */}
        {isVisitor && (
          <Alert className="mx-4 md:max-w-2xl md:mx-auto bg-blue-500/10 border-blue-500/30">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertTitle className="text-white">Bem-vindo ao Hodos!</AlertTitle>
            <AlertDescription className="text-white/70">
              Você está visualizando conteúdo público. Para acessar recursos completos, entre em contato com um administrador.
            </AlertDescription>
          </Alert>
        )}

        {/* Card Minha Igreja - Destacado (Mobile) */}
        {church && !isVisitor && (
          <div className="md:hidden px-4">
            <Card 
              className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30 cursor-pointer hover:scale-[1.02] transition-transform"
              onClick={() => navigate(`/igreja/${church.slug}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Home className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-1">Minha Igreja</h3>
                    <p className="text-sm text-white/70 truncate">{church.name}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-white/70 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Access Pills - Mobile */}
        <div className="md:hidden">
          <div className="px-4 mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Acesso Rápido</h3>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 px-4 pb-2">
              {quickAccessItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="flex flex-col items-center gap-2 min-w-[72px] group"
                >
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs text-white/80 font-medium text-center">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Minha Jornada - Mobile Grid 2x2 */}
        <div className="md:hidden px-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Minha Jornada</h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {journeyCards.map((card, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={card.action}
              >
                <CardContent className="p-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-foreground mb-1 text-sm">
                    {card.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Admin Section - Mobile */}
        {adminCards.length > 0 && (
          <div className="md:hidden px-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Administrativo</h3>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {adminCards.map((card, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={card.action}
                >
                  <CardContent className="p-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-bold text-foreground mb-1 text-sm">
                      {card.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Desktop View - Grid 3 colunas */}
        <section className="hidden md:block space-y-8 mt-12">
          <h3 className="text-3xl font-bold text-center text-white">Acesso Rápido</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {church && !isVisitor && (
              <Card
                className="feature-card cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30"
                onClick={() => navigate(`/igreja/${church.slug}`)}
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-6">
                  <Home className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-foreground mb-3">Minha Igreja</h4>
                <p className="text-muted-foreground mb-4">{church.name}</p>
                <Button variant="ghost" className="group">
                  Acessar
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Card>
            )}
            
            {journeyCards.map((card, index) => (
              <Card
                key={index}
                className="feature-card cursor-pointer hover:scale-105 transition-all duration-300"
                onClick={card.action}
              >
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6`}>
                  <card.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-foreground mb-3">{card.title}</h4>
                <p className="text-muted-foreground mb-4">{card.description}</p>
                <Button variant="ghost" className="group">
                  Acessar
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Card>
            ))}

            {adminCards.map((card, index) => (
              <Card
                key={index}
                className="feature-card cursor-pointer hover:scale-105 transition-all duration-300"
                onClick={card.action}
              >
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6`}>
                  <card.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-foreground mb-3">{card.title}</h4>
                <p className="text-muted-foreground mb-4">{card.description}</p>
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
          <section className="text-center py-8 px-4">
            <Card className="p-8 md:p-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/20">
              <MessageCircle className="h-12 md:h-16 w-12 md:w-16 mx-auto mb-4 text-blue-400" />
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">Procurando uma Igreja?</h3>
              <p className="text-sm md:text-lg text-slate-300 mb-6 max-w-2xl mx-auto">
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

      {/* Bottom Navigation - Mobile */}
      <BottomNav churchSlug={church?.slug} />
    </div>
  );
};

export default IndividualDashboard;
