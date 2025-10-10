import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useCreatePendingPayment } from '@/hooks/useCreatePendingPayment';
import { PlanCard } from '@/components/subscription/PlanCard';
import { ConfirmationCodeDisplay } from '@/components/subscription/ConfirmationCodeDisplay';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const RenewSubscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { access } = useSubscriptionAccess();
  const { plans } = useSubscriptionPlans();
  const { createPendingPayment, isLoading } = useCreatePendingPayment();
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

  const currentPlan = plans?.find(p => p.plan_type === access.planType);

  const handleRenew = async (plan: any) => {
    try {
      const result = await createPendingPayment({
        planType: plan.plan_type,
        amount: plan.price_monthly,
      });
      setConfirmationCode(result.confirmation_code);
      setSelectedPlan(plan);
      toast({
        title: 'Renovação solicitada!',
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
        title="Renovar Assinatura"
        description="Renove seu plano e continue com acesso total aos recursos"
      />

      {currentPlan && (
        <div className="max-w-md mx-auto">
          <PlanCard
            plan={currentPlan}
            onSelect={() => handleRenew(currentPlan)}
            isPopular
          />
        </div>
      )}

      <div className="text-center mt-8">
        <Button
          variant="outline"
          onClick={() => navigate('/planos')}
        >
          Ver Outros Planos
        </Button>
      </div>
    </PageContainer>
  );
};

export default RenewSubscription;
