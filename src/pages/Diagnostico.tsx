
import React from 'react';
import DiagnosticForm from '@/components/DiagnosticForm';
import { ProgressSummaryCard } from '@/components/ProgressSummaryCard';
import { useAuth } from '@/contexts/AuthContext';

const Diagnostico = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/5">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Diagnóstico Espiritual
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra em que estágio da sua jornada espiritual você está e receba recomendações 
            personalizadas de trilhas de discipulado para continuar crescendo na fé.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            <DiagnosticForm />
          </div>
          
          {user && (
            <div className="lg:col-span-1">
              <ProgressSummaryCard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Diagnostico;
