import React from 'react';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, DollarSign, Users, Shield } from 'lucide-react';
import { EditPlanDialog } from './EditPlanDialog';

export const PlansList = () => {
  const { plans, isLoading } = useSubscriptionPlans();
  const [editPlan, setEditPlan] = React.useState<any>(null);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans?.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                <Button size="icon" variant="ghost" onClick={() => setEditPlan(plan)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold">
                  {plan.price_monthly === 0 ? 'Grátis' : `R$ ${Number(plan.price_monthly).toFixed(2)}/mês`}
                </span>
              </div>
              {plan.max_members && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Até {plan.max_members} membros</span>
                </div>
              )}
              {plan.max_admins && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Até {plan.max_admins} admins</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {editPlan && (
        <EditPlanDialog
          plan={editPlan}
          open={!!editPlan}
          onOpenChange={(open) => !open && setEditPlan(null)}
        />
      )}
    </>
  );
};
