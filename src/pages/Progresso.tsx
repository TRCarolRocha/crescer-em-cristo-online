import React from 'react';
import { SpiritualProgressDashboard } from '@/components/SpiritualProgressDashboard';

const Progresso: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/5">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Progresso Espiritual
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Acompanhe sua jornada de crescimento espiritual, conquistas e evolução nos níveis de maturidade
          </p>
        </div>
        
        <SpiritualProgressDashboard />
      </div>
    </div>
  );
};

export default Progresso;