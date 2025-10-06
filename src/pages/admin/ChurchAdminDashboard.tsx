import { Users, BookOpen, TrendingUp, Calendar, FileText } from 'lucide-react';
import { CardMetric } from '@/components/common/CardMetric';
import { ChartCard } from '@/components/common/ChartCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams } from 'react-router-dom';
import { mockChurchStats, mockChurchRecentContent, mockEngagementData } from '@/data/mock';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ChurchAdminDashboard = () => {
  const { churchSlug } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7b2ff7] to-[#f107a3] bg-clip-text text-transparent">
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
            value={mockChurchStats.activeDiscipleships}
            icon={BookOpen}
          />
          <CardMetric
            title="Membros Cadastrados"
            value={mockChurchStats.totalMembers}
            icon={Users}
            trend={{ value: 3, isPositive: true }}
          />
          <CardMetric
            title="Engajamento"
            value={`${mockChurchStats.engagement}%`}
            icon={TrendingUp}
            trend={{ value: 5, isPositive: true }}
          />
          <CardMetric
            title="Eventos Este Mês"
            value={mockChurchStats.eventsThisMonth}
            icon={Calendar}
          />
        </div>

        {/* Chart */}
        <ChartCard
          title="Engajamento da Comunidade"
          description="Evolução do engajamento nos últimos meses"
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

        {/* Management Tabs */}
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="discipleships">Discipulados</TabsTrigger>
            <TabsTrigger value="content">Conteúdos</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>

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
              <div className="space-y-4">
                {mockChurchRecentContent.map((content) => (
                  <div
                    key={content.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-[#7b2ff7]" />
                      <div>
                        <p className="font-medium">{content.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Publicado em {content.published_at}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {content.views} visualizações
                    </span>
                  </div>
                ))}
              </div>
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
