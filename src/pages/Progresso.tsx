import React from 'react';
import { SpiritualProgressDashboard } from '@/components/SpiritualProgressDashboard';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { AccessGate } from '@/components/subscription/AccessGate';

const Progresso: React.FC = () => {
  return (
    <AccessGate requiredAccess="canAccessProgress">
      <PageContainer maxWidth="7xl">
        <PageHeader 
          title="Progresso Espiritual"
          description="Acompanhe sua jornada de crescimento espiritual, conquistas e evolução nos níveis de maturidade"
        />
        
        <SpiritualProgressDashboard />
      </PageContainer>
    </AccessGate>
  );
};

export default Progresso;