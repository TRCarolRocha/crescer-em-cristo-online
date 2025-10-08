import { useState, useEffect } from 'react';
import { Users, BookOpen, TrendingUp, Calendar } from 'lucide-react';
import { CardMetric } from '@/components/common/CardMetric';
import { ChartCard } from '@/components/common/ChartCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import AdminMembros from '@/components/admin/AdminMembros';
import AdminGrupos from '@/components/admin/AdminGrupos';
import AdminTrilhas from '@/components/admin/AdminTrilhas';
import AdminVisibilidadeTrilhas from '@/components/admin/AdminVisibilidadeTrilhas';
import AdminDevocionais from '@/components/admin/AdminDevocionais';
import AdminAvisos from '@/components/admin/AdminAvisos';
import AdminAgenda from '@/components/admin/AdminAgenda';
import { ChurchCustomizationDialog } from '@/components/admin/ChurchCustomizationDialog';

const ChurchAdminDashboard = () => {
  const { churchSlug } = useParams();
  const navigate = useNavigate();
  const { canManageChurch, loading: permissionsLoading } = usePermissions();
  const [churchId, setChurchId] = useState<string | null>(null);
  const [church, setChurch] = useState<any>(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeDiscipleships: 0,
    engagement: 0,
    eventsThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!churchSlug || permissionsLoading) return;

      // Buscar igreja pelo slug
      const { data: churchData, error } = await supabase
        .from('churches')
        .select('*')
        .eq('slug', churchSlug)
        .single();

      if (error || !churchData) {
        navigate('/');
        return;
      }

      setChurchId(churchData.id);
      setChurch(churchData);

      // Verificar permissão
      const hasAccess = await canManageChurch(churchData.id);
      if (!hasAccess) {
        navigate('/');
        return;
      }

      // Buscar dados reais
      await fetchChurchStats(churchData.id);
    };

    checkAccess();
  }, [churchSlug, permissionsLoading, canManageChurch, navigate]);

  const fetchChurchStats = async (id: string) => {
    try {
      // Total de membros
      const { count: membersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('church_id', id);

      // Trilhas ativas (isso depende da sua lógica)
      const { data: tracks } = await supabase
        .from('discipleship_tracks')
        .select('id')
        .not('allowed_groups', 'is', null);

      // Eventos deste mês
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      const { data: events } = await supabase
        .from('events')
        .select('id, created_by')
        .gte('event_date', firstDay)
        .lte('event_date', lastDay);

      // Filtrar eventos criados por membros da igreja
      const { data: churchMembers } = await supabase
        .from('profiles')
        .select('id')
        .eq('church_id', id);

      const memberIds = churchMembers?.map(m => m.id) || [];
      const churchEvents = events?.filter(e => memberIds.includes(e.created_by)) || [];

      // Calcular engajamento (exemplo: % de membros com atividade recente)
      const { data: recentActivity } = await supabase
        .from('devocional_historico')
        .select('user_id')
        .in('user_id', memberIds)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const activeUsers = new Set(recentActivity?.map(a => a.user_id) || []).size;
      const engagement = membersCount ? Math.round((activeUsers / membersCount) * 100) : 0;

      setStats({
        totalMembers: membersCount || 0,
        activeDiscipleships: tracks?.length || 0,
        engagement,
        eventsThisMonth: churchEvents.length
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (permissionsLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b2ff7]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#7b2ff7] to-[#f107a3] bg-clip-text text-transparent">
            Dashboard - {churchSlug?.replace('-', ' ')}
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestão completa da sua comunidade
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardMetric
            title="Discipulados Ativos"
            value={stats.activeDiscipleships}
            icon={BookOpen}
          />
          <CardMetric
            title="Membros Cadastrados"
            value={stats.totalMembers}
            icon={Users}
          />
          <CardMetric
            title="Engajamento"
            value={`${stats.engagement}%`}
            icon={TrendingUp}
          />
          <CardMetric
            title="Eventos Este Mês"
            value={stats.eventsThisMonth}
            icon={Calendar}
          />
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="groups">Grupos</TabsTrigger>
            <TabsTrigger value="tracks">Trilhas</TabsTrigger>
            <TabsTrigger value="devotionals">Devocionais</TabsTrigger>
            <TabsTrigger value="notices">Avisos</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <ChartCard title="Perfil da Igreja">
              <button 
                onClick={() => setIsCustomizationOpen(true)}
                className="px-6 py-2 bg-gradient-to-r from-[#7b2ff7] to-[#f107a3] text-white rounded-md hover:opacity-90 transition-opacity"
              >
                Editar Configurações da Igreja
              </button>
            </ChartCard>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <AdminMembros />
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <AdminGrupos />
          </TabsContent>

          <TabsContent value="tracks" className="space-y-4">
            <AdminTrilhas />
            <AdminVisibilidadeTrilhas />
          </TabsContent>

          <TabsContent value="devotionals" className="space-y-4">
            <AdminDevocionais />
          </TabsContent>

          <TabsContent value="notices" className="space-y-4">
            <AdminAvisos />
          </TabsContent>

          <TabsContent value="agenda" className="space-y-4">
            <AdminAgenda />
          </TabsContent>
        </Tabs>

        {/* Church Customization Dialog */}
        {church && (
          <ChurchCustomizationDialog
            open={isCustomizationOpen}
            onOpenChange={setIsCustomizationOpen}
            church={church}
            onSuccess={() => {
              // Recarregar dados da igreja
              const reloadChurch = async () => {
                const { data } = await supabase
                  .from('churches')
                  .select('*')
                  .eq('id', churchId)
                  .single();
                if (data) setChurch(data);
              };
              reloadChurch();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ChurchAdminDashboard;
