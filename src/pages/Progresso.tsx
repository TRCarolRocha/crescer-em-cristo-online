import React from 'react';
import { SpiritualProgressDashboard } from '@/components/SpiritualProgressDashboard';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContainer } from '@/components/layout/PageContainer';

const Progresso: React.FC = () => {
  return (
    <PageContainer maxWidth="7xl">
      <PageHeader 
        title="Progresso Espiritual"
        description="Acompanhe sua jornada de crescimento espiritual, conquistas e evolução nos níveis de maturidade"
      />
      
      <SpiritualProgressDashboard />
    </PageContainer>
  );
};

export default Progresso;