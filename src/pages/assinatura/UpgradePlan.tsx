import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useUpgradePlan } from '@/hooks/useUpgradePlan';
import { PlanCard } from '@/components/subscription/PlanCard';
import { ConfirmationCodeDisplay } from '@/components/subscription/ConfirmationCodeDisplay';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const UpgradePlan = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { access } = useSubscriptionAccess();
  const { plans } = useSubscriptionPlans();
  const { upgradePlan, isLoading } = useUpgradePlan();
  const [selectedPlan, setSelectedPlan] = React.useState<any>(null);
  const [confirmationCode, setConfirmationCode] = React.useState<string>('');
  const [userEmail, setUserEmail] = React.useState<string>('');

  React.useEffect(() => {
    const getEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    };
    getEmail();
  }, []);

  const currentPlan = searchParams.get('current') || access.planType;

  const planOrder = ['free', 'individual', 'church_simple', 'church_plus', 'church_premium'];
  const currentIndex = planOrder.indexOf(currentPlan);
  
  const availablePlans = plans?.filter(plan => {
    const planIndex = planOrder.indexOf(plan.plan_type);
    return planIndex > currentIndex;
  });

  const handleUpgrade = async (plan: any) => {
    try {
      const result = await upgradePlan({
        newPlanType: plan.plan_type,
        amount: plan.price_monthly,
      });
      setConfirmationCode(result.confirmation_code);
      setSelectedPlan(plan);
      toast({
        title: 'Upgrade solicitado!',
        description: 'Aguarde a aprovação do pagamento.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (confirmationCode && selectedPlan) {
    return (
      <PageContainer>
        <ConfirmationCodeDisplay
          confirmationCode={confirmationCode}
          email={userEmail}
          planType={selectedPlan.name}
          onContinue={() => navigate('/')}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Fazer Upgrade"
        description="Escolha um plano superior e desbloqueie mais recursos"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availablePlans?.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onSelect={() => handleUpgrade(plan)}
          />
        ))}
      </div>

      {(!availablePlans || availablePlans.length === 0) && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Você já está no plano mais completo!
          </p>
        </div>
      )}
    </PageContainer>
  );
};

export default UpgradePlan;
