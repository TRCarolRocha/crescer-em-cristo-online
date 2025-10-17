import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { PlanCard } from '@/components/subscription/PlanCard';

const Planos = () => {
  const navigate = useNavigate();
  const { plans, isLoading } = useSubscriptionPlans();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <p className="text-muted-foreground">Carregando planos...</p>
      </div>
    );
  }

  const freePlan = plans?.find(p => p.plan_type === 'free');
  const individualPlans = plans?.filter(p => p.plan_type === 'individual') || [];
  const churchPlans = plans?.filter(p => p.plan_type.startsWith('church_')) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Escolha seu Plano HODOS
          </h1>
          <p className="text-muted-foreground text-lg">
            Encontre o plano perfeito para sua jornada espiritual
          </p>
        </div>

        {freePlan && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Plano Gratuito</h2>
              <p className="text-muted-foreground">
                Experimente o Hodos gratuitamente
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <PlanCard
                  plan={freePlan}
                  onSelect={() => navigate('/assinatura/free')}
                />
              </div>
            </div>
          </div>
        )}

        {individualPlans.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Planos Individuais</h2>
              <p className="text-muted-foreground">
                Escolha o plano ideal para sua jornada espiritual
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {individualPlans.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={() => navigate('/assinatura/individual', { 
                    state: { selectedPlanId: plan.id } 
                  })}
                  isPopular={index === 0}
                />
              ))}
            </div>
          </div>
        )}

        {churchPlans.length > 0 && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Planos para Igrejas</h2>
              <p className="text-muted-foreground">
                Soluções completas para gestão e crescimento da sua igreja
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {churchPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={() => navigate('/assinatura/igreja', { state: { selectedPlan: plan.plan_type } })}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Planos;
