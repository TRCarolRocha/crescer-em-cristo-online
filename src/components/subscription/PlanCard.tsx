import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PlanCardProps {
  plan: {
    name: string;
    description: string | null;
    price_monthly: number;
    features: any;
    max_members: number | null;
    max_admins: number | null;
  };
  onSelect: () => void;
  isPopular?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect, isPopular = false }) => {
  const features = Array.isArray(plan.features) ? plan.features : [];
  const price = Number(plan.price_monthly);

  return (
    <Card className={`relative ${isPopular ? 'border-primary shadow-lg' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary">
          <Sparkles className="w-3 h-3 mr-1" />
          Mais Popular
        </Badge>
      )}
      
      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">
            {price === 0 ? 'Grátis' : `R$ ${price.toFixed(2)}`}
          </span>
          {price > 0 && <span className="text-muted-foreground">/mês</span>}
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {features.map((feature: string, index: number) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
          {plan.max_members && (
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">Até {plan.max_members} membros</span>
            </li>
          )}
          {plan.max_admins && (
            <li className="flex items-start gap-2">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">Até {plan.max_admins} administradores</span>
            </li>
          )}
        </ul>
      </CardContent>

      <CardFooter>
        <Button 
          onClick={onSelect}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
        >
          Escolher Plano
        </Button>
      </CardFooter>
    </Card>
  );
};
