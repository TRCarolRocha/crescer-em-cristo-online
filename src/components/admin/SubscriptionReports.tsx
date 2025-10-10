import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react';

export const SubscriptionReports = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: async () => {
      // Get active subscriptions count
      const { count: activeCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get total revenue (sum of all active subscriptions)
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('subscription_plans(price_monthly)')
        .eq('status', 'active');

      const mrr = subscriptions?.reduce((sum, sub) => {
        const plan = sub.subscription_plans as any;
        return sum + (plan?.price_monthly || 0);
      }, 0) || 0;

      // Get pending payments count
      const { count: pendingCount } = await supabase
        .from('pending_payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get plan distribution
      const { data: planDist } = await supabase
        .from('subscriptions')
        .select('subscription_plans(name)')
        .eq('status', 'active');

      const planDistribution = planDist?.reduce((acc: Record<string, number>, sub) => {
        const plan = sub.subscription_plans as any;
        const name = plan?.name || 'Desconhecido';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

      return {
        activeSubscriptions: activeCount || 0,
        mrr,
        pendingPayments: pendingCount || 0,
        planDistribution: planDistribution || {},
      };
    },
  });

  if (isLoading) {
    return <div>Carregando relatórios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSubscriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR (Receita Mensal)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats?.mrr.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingPayments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.pendingPayments && stats?.activeSubscriptions
                ? ((stats.activeSubscriptions / (stats.activeSubscriptions + stats.pendingPayments)) * 100).toFixed(1)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Plano</CardTitle>
          <CardDescription>Assinaturas ativas por tipo de plano</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats?.planDistribution || {}).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between">
                <span className="text-sm font-medium">{plan}</span>
                <span className="text-sm text-muted-foreground">{count} assinatura(s)</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
