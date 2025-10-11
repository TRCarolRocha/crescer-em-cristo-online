import { useState } from 'react';
import { Users, Building2, FileText, TrendingUp, Plus, Clock } from 'lucide-react';
import { CardMetric } from '@/components/common/CardMetric';
import { ChartCard } from '@/components/common/ChartCard';
import { GradientButton } from '@/components/common/GradientButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mockSuperAdminStats, mockRecentActivities, mockEngagementData } from '@/data/mock';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CreateChurchDialog } from '@/components/admin/CreateChurchDialog';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [createChurchOpen, setCreateChurchOpen] = useState(false);

  const { data: pendingPayments } = useQuery({
    queryKey: ['pending-payments-count'],
    queryFn: async () => {
      const { data } = await supabase
        .from('pending_payments')
        .select('id, amount')
        .eq('status', 'pending');
      return data || [];
    },
    refetchInterval: 30000,
  });

  const pendingCount = pendingPayments?.length || 0;

  return (
    <>
      <CreateChurchDialog 
        open={createChurchOpen} 
        onOpenChange={setCreateChurchOpen}
        onSuccess={() => {
          // Atualizar lista se necessário
        }}
      />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-4xl font-bold bg-gradient-to-r from-[#7b2ff7] to-[#f107a3] bg-clip-text text-transparent">
              Dashboard Hodos
            </h1>
            <p className="text-sm text-muted-foreground mt-1 md:mt-2">
              Visão geral da plataforma
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <GradientButton onClick={() => setCreateChurchOpen(true)} size="sm" className="md:h-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nova Igreja
            </GradientButton>
            <GradientButton onClick={() => navigate('/admin/hodos/igrejas')} variant="outline" size="sm">
              Ver Todas
            </GradientButton>
          </div>
        </div>

        {/* Metrics Cards - Mobile: Scroll horizontal / Desktop: Grid */}
        {/* Mobile */}
        <div className="md:hidden overflow-x-auto snap-x scrollbar-hide -mx-4 px-4">
          <div className="flex gap-4 pb-4">
            <div className="min-w-[170px] snap-center flex-shrink-0">
              <CardMetric
                title="Igrejas"
                value={mockSuperAdminStats.totalChurches}
                icon={Building2}
                trend={{ value: 12, isPositive: true }}
              />
            </div>
            <div className="min-w-[170px] snap-center flex-shrink-0">
              <CardMetric
                title="Usuários"
                value={mockSuperAdminStats.activeUsers}
                icon={Users}
                trend={{ value: 8, isPositive: true }}
              />
            </div>
            <div className="min-w-[170px] snap-center flex-shrink-0">
              <CardMetric
                title="Conteúdos"
                value={mockSuperAdminStats.publicContent}
                icon={FileText}
              />
            </div>
            <div className="min-w-[170px] snap-center flex-shrink-0">
              <CardMetric
                title="Engajamento"
                value={`${mockSuperAdminStats.engagementRate}%`}
                icon={TrendingUp}
                trend={{ value: 5, isPositive: true }}
              />
            </div>
          </div>
        </div>

        {/* Desktop - Grid normal */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardMetric
            title="Igrejas Cadastradas"
            value={mockSuperAdminStats.totalChurches}
            icon={Building2}
            trend={{ value: 12, isPositive: true }}
          />
          <CardMetric
            title="Usuários Ativos"
            value={mockSuperAdminStats.activeUsers}
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <div 
            onClick={() => navigate('/admin/hodos/pagamentos')}
            className="cursor-pointer transition-transform hover:scale-105"
          >
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pagamentos</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{pendingCount}</p>
                    {pendingCount > 0 && (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                        Pendente
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <CardMetric
            title="Engajamento"
            value={`${mockSuperAdminStats.engagementRate}%`}
            icon={TrendingUp}
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        {/* Charts - Mobile: Tabs / Desktop: Side by side */}
        {/* Mobile: Tabs */}
        <div className="md:hidden">
          <Tabs defaultValue="engagement" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="engagement" className="text-sm">Engajamento</TabsTrigger>
              <TabsTrigger value="activities" className="text-sm">Atividades</TabsTrigger>
            </TabsList>
            <TabsContent value="engagement" className="mt-4">
              <ChartCard
                title="Engajamento Mensal"
                description="Taxa dos últimos 6 meses"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockEngagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#7b2ff7"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </TabsContent>
            <TabsContent value="activities" className="mt-4">
              <ChartCard
                title="Atividades Recentes"
                description="Últimas ações na plataforma"
              >
                <div className="space-y-4">
                  {mockRecentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <div className="h-2 w-2 rounded-full bg-[#7b2ff7] mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop: Side by side */}
        <div className="hidden md:grid md:grid-cols-2 gap-6">
          <ChartCard
            title="Engajamento Mensal"
            description="Taxa de engajamento dos últimos 6 meses"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockEngagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#7b2ff7"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Atividades Recentes"
            description="Últimas ações na plataforma"
          >
            <div className="space-y-4">
              {mockRecentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <div className="h-2 w-2 rounded-full bg-[#7b2ff7] mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Quick Actions - Mobile: Full width / Desktop: Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <GradientButton
            onClick={() => navigate('/admin/hodos/igrejas')}
            className="h-14 md:h-20"
          >
            Gerenciar Igrejas
          </GradientButton>
          <GradientButton
            onClick={() => navigate('/admin/hodos/conteudos')}
            className="h-14 md:h-20"
          >
            Conteúdos Públicos
          </GradientButton>
          <GradientButton
            onClick={() => navigate('/admin/hodos/planos')}
            className="h-14 md:h-20"
          >
            Gerenciar Planos
          </GradientButton>
        </div>
      </div>
    </div>
    </>
  );
};

export default SuperAdminDashboard;
