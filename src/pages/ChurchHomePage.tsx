import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Users, Calendar, MessageCircle, Settings } from "lucide-react";
import ChurchHeader from "@/components/ChurchHeader";
import CarrosselAvisos from "@/components/CarrosselAvisos";
import DevocionalNotification from "@/components/DevocionalNotification";
import BirthdaySection from "@/components/BirthdaySection";
import DevocionalDashboard from "@/components/DevocionalDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { ChurchCustomizationDialog } from "@/components/admin/ChurchCustomizationDialog";
import { BottomNav } from "@/components/layout/BottomNav";

interface Church {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  headline: string | null;
  description: string | null;
  primary_color: string;
  secondary_color: string;
}

const ChurchHomePage = () => {
  const navigate = useNavigate();
  const { churchSlug } = useParams();
  const { user } = useAuth();
  const { isChurchAdmin, isSuperAdmin, canManageChurch } = usePermissions();
  const [church, setChurch] = useState<Church | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [hasCompletedDiagnostic, setHasCompletedDiagnostic] = useState(false);
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    const fetchChurch = async () => {
      if (!churchSlug) return;

      const { data, error } = await supabase
        .from('churches')
        .select('*')
        .eq('slug', churchSlug)
        .single();

      if (error) {
        console.error('Error fetching church:', error);
        navigate('/');
        return;
      }

      setChurch(data);
      setLoading(false);
      
      // Check if user can manage this church
      if (data?.id) {
        const hasPermission = await canManageChurch(data.id);
        setCanManage(hasPermission);
      }
    };

    fetchChurch();
  }, [churchSlug, navigate, canManageChurch]);

  useEffect(() => {
    const checkDiagnosticStatus = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('diagnostics')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setHasCompletedDiagnostic(true);
      }
    };

    checkDiagnosticStatus();
  }, [user]);

  const handleContinueJourney = () => {
    if (hasCompletedDiagnostic) {
      navigate('/trilhas');
    } else {
      navigate('/diagnostico');
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: "Devocionais",
      description: "Conecte-se diariamente com a Palavra",
      color: "from-blue-500 to-cyan-500",
      action: () => navigate('/devocional')
    },
    {
      icon: Users,
      title: "Trilhas de Discipulado",
      description: "Cresça na fé através de estudos direcionados",
      color: "from-purple-500 to-pink-500",
      action: () => navigate('/trilhas')
    },
    {
      icon: Calendar,
      title: "Agenda",
      description: "Participe dos eventos e cultos",
      color: "from-orange-500 to-red-500",
      action: () => navigate('/agenda')
    },
    {
      icon: MessageCircle,
      title: "Comunicação",
      description: "Mantenha-se conectado com a comunidade",
      color: "from-green-500 to-emerald-500",
      action: () => navigate('/comunicacao')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!church) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <ChurchHeader 
        church={church} 
        showCustomizeButton={canManage}
        onCustomize={() => setCustomizationOpen(true)}
      />
      
      {/* Dialog de Personalização */}
      {canManage && church && (
        <ChurchCustomizationDialog
          open={customizationOpen}
          onOpenChange={setCustomizationOpen}
          church={church}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
      
      <main className="container mx-auto px-4 py-12 pb-24 md:pb-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-12">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent animate-fade-in">
            Bem-vindo à Sua Jornada de Discipulado
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uma experiência transformadora de crescimento espiritual
          </p>
          <Button 
            size="lg" 
            onClick={handleContinueJourney}
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            {hasCompletedDiagnostic ? "Continuar Jornada" : "Descobrir Seu Nível Espiritual"}
          </Button>
        </section>

        {/* User-specific content */}
        {user && (
          <div className="grid md:grid-cols-2 gap-6">
            <DevocionalNotification />
            <BirthdaySection />
          </div>
        )}

        {/* Carousel */}
        <CarrosselAvisos />

        {/* Devotional Dashboard */}
        {user && <DevocionalDashboard />}

        {/* Features Grid */}
        <section className="space-y-8">
          <h3 className="text-3xl font-bold text-center">Recursos Disponíveis</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50"
                onClick={feature.action}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 transition-transform duration-300 ${hoveredFeature === index ? 'scale-110 rotate-6' : ''}`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="text-center py-12 space-y-4">
          <h3 className="text-2xl font-bold">Precisa Falar com a Liderança?</h3>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/fale-com-lideranca')}
          >
            Enviar Mensagem
          </Button>
        </section>
      </main>

      {/* Menu inferior mobile */}
      <BottomNav churchSlug={church.slug} />
    </div>
  );
};

export default ChurchHomePage;
