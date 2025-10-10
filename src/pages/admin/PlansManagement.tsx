import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { PlansList } from '@/components/admin/PlansList';
import { PaymentSettings } from '@/components/admin/PaymentSettings';
import { EmailTemplates } from '@/components/admin/EmailTemplates';
import { SubscriptionReports } from '@/components/admin/SubscriptionReports';

const PlansManagement = () => {
  return (
    <PageContainer>
      <PageHeader 
        title="Gerenciamento de Planos" 
        description="Configure planos, pagamentos e templates de email"
      />

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="payment">Pagamento</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-6">
          <PlansList />
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <PaymentSettings />
        </TabsContent>

        <TabsContent value="emails" className="mt-6">
          <EmailTemplates />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <SubscriptionReports />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default PlansManagement;
