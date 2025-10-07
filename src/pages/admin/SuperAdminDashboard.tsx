import { useState } from 'react';
import { Users, Building2, FileText, TrendingUp, Plus } from 'lucide-react';
import { CardMetric } from '@/components/common/CardMetric';
import { ChartCard } from '@/components/common/ChartCard';
import { GradientButton } from '@/components/common/GradientButton';
import { useNavigate } from 'react-router-dom';
import { mockSuperAdminStats, mockRecentActivities, mockEngagementData } from '@/data/mock';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CreateChurchDialog } from '@/components/admin/CreateChurchDialog';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [createChurchOpen, setCreateChurchOpen] = useState(false);

  return (
    <>
      <CreateChurchDialog 
        open={createChurchOpen} 
        onOpenChange={setCreateChurchOpen}
        onSuccess={() => {
          // Atualizar lista se necessário
        }}
      />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7b2ff7] to-[#f107a3] bg-clip-text text-transparent">
              Dashboard Hodos
            </h1>
            <p className="text-muted-foreground mt-2">
              Visão geral da plataforma
            </p>
          </div>
          <div className="flex gap-3">
            <GradientButton onClick={() => setCreateChurchOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Cadastrar Nova Igreja
            </GradientButton>
            <GradientButton onClick={() => navigate('/admin/hodos/igrejas')} variant="outline">
              Ver Todas as Igrejas
            </GradientButton>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <CardMetric
            title="Conteúdos Públicos"
            value={mockSuperAdminStats.publicContent}
            icon={FileText}
          />
          <CardMetric
            title="Engajamento"
            value={`${mockSuperAdminStats.engagementRate}%`}
            icon={TrendingUp}
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GradientButton
            onClick={() => navigate('/admin/hodos/igrejas')}
            className="h-20"
          >
            Gerenciar Igrejas
          </GradientButton>
          <GradientButton
            onClick={() => navigate('/admin/hodos/conteudos')}
            className="h-20"
          >
            Conteúdos Públicos
          </GradientButton>
          <GradientButton
            onClick={() => navigate('/membros')}
            className="h-20"
          >
            Ver Todos os Usuários
          </GradientButton>
        </div>
      </div>
    </div>
    </>
  );
};

export default SuperAdminDashboard;
