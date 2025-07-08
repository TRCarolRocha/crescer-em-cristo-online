
import React from 'react';
import DiagnosticForm from '@/components/DiagnosticForm';

const Diagnostico = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            Diagnóstico Espiritual
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubra em que estágio da sua jornada espiritual você está e receba recomendações 
            personalizadas de trilhas de discipulado para continuar crescendo na fé.
          </p>
        </div>
        
        <DiagnosticForm />
      </div>
    </div>
  );
};

export default Diagnostico;
