
import React from 'react';
import DiagnosticForm from '@/components/DiagnosticForm';
import { ProgressSummaryCard } from '@/components/ProgressSummaryCard';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageContainer } from '@/components/layout/PageContainer';

const Diagnostico = () => {
  const { user } = useAuth();

  return (
    <PageContainer>
      <PageHeader 
        title="Diagnóstico Espiritual"
        description="Descubra em que estágio da sua jornada espiritual você está e receba recomendações personalizadas de trilhas de discipulado para continuar crescendo na fé."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2">
          <DiagnosticForm />
        </div>
        
        {user && (
          <div className="lg:col-span-1">
            <ProgressSummaryCard />
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default Diagnostico;
