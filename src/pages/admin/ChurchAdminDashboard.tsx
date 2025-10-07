import { useState, useEffect } from 'react';
import { Users, BookOpen, TrendingUp, Calendar, FileText } from 'lucide-react';
import { CardMetric } from '@/components/common/CardMetric';
import { ChartCard } from '@/components/common/ChartCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';

const ChurchAdminDashboard = () => {
  const { churchSlug } = useParams();
  const navigate = useNavigate();
  const { canManageChurch, loading: permissionsLoading } = usePermissions();
  const [churchId, setChurchId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeDiscipleships: 0,
    engagement: 0,
    eventsThisMonth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!churchSlug || permissionsLoading) return;

      // Buscar igreja pelo slug
      const { data: church, error } = await supabase
        .from('churches')
        .select('id')
        .eq('slug', churchSlug)
        .single();

      if (error || !church) {
        navigate('/');
        return;
      }

      setChurchId(church.id);

      // Verificar permissão
      const hasAccess = await canManageChurch(church.id);
      if (!hasAccess) {
        navigate('/');
        return;
      }

      // Buscar dados reais
      await fetchChurchStats(church.id);
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="discipleships">Discipulados</TabsTrigger>
            <TabsTrigger value="content">Conteúdos</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <ChartCard title="Perfil da Igreja">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Logo da Igreja</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="block w-full text-sm text-muted-foreground
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-gradient-to-r file:from-[#7b2ff7] file:to-[#f107a3]
                      file:text-white hover:file:opacity-90"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome da Igreja</label>
                  <input 
                    type="text"
                    defaultValue={churchSlug?.replace('-', ' ')}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição/Headline</label>
                  <textarea 
                    rows={3}
                    placeholder="Uma breve descrição da igreja..."
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cor Primária</label>
                    <input 
                      type="color"
                      defaultValue="#7b2ff7"
                      className="w-full h-10 rounded-md cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cor Secundária</label>
                    <input 
                      type="color"
                      defaultValue="#f107a3"
                      className="w-full h-10 rounded-md cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug Personalizado</label>
                  <input 
                    type="text"
                    defaultValue={churchSlug}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="igreja-nome"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL: /igreja/{churchSlug || 'seu-slug'}
                  </p>
                </div>

                <button className="px-6 py-2 bg-gradient-to-r from-[#7b2ff7] to-[#f107a3] text-white rounded-md hover:opacity-90 transition-opacity">
                  Salvar Alterações
                </button>
              </div>
            </ChartCard>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <ChartCard title="Gestão de Membros">
              <p className="text-muted-foreground">
                Gerenciar membros da igreja, adicionar novos, editar perfis e monitorar participação.
              </p>
            </ChartCard>
          </TabsContent>

          <TabsContent value="discipleships" className="space-y-4">
            <ChartCard title="Discipulados Ativos">
              <p className="text-muted-foreground">
                Criar e gerenciar trilhas de discipulado, acompanhar progresso dos membros.
              </p>
            </ChartCard>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <ChartCard title="Conteúdos Publicados">
              <p className="text-muted-foreground">
                Gerenciar trilhas, devocionais e avisos da igreja.
              </p>
            </ChartCard>
          </TabsContent>

          <TabsContent value="agenda" className="space-y-4">
            <ChartCard title="Eventos e Agenda">
              <p className="text-muted-foreground">
                Gerenciar eventos, cultos e atividades da igreja.
              </p>
            </ChartCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChurchAdminDashboard;
