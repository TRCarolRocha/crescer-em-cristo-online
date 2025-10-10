import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  open,
  onOpenChange,
  currentPlan,
}) => {
  const navigate = useNavigate();

  const features = {
    free: ['Devocionais públicos'],
    individual: ['Devocionais públicos', 'Devocionais pessoais', 'Trilhas de discipulado', 'Acompanhamento de progresso'],
    church_simple: ['Tudo do Individual', 'Grupos de estudo', 'Até 50 membros', '3 administradores'],
    church_plus: ['Tudo do Simple', 'Customização da igreja', 'Até 200 membros', '10 administradores'],
    church_premium: ['Tudo do Plus', 'Membros ilimitados', 'Administradores ilimitados', 'Suporte prioritário'],
  };

  const currentFeatures = features[currentPlan as keyof typeof features] || features.free;
  const upgradePath = currentPlan === 'free' ? 'individual' : 
                      currentPlan === 'individual' ? 'church_simple' :
                      currentPlan === 'church_simple' ? 'church_plus' : 'church_premium';
  const nextFeatures = features[upgradePath as keyof typeof features];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Faça Upgrade do seu Plano</DialogTitle>
          <DialogDescription>
            Desbloqueie mais recursos para sua jornada espiritual
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Seu Plano Atual</h3>
            <ul className="space-y-2">
              {currentFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 border-l pl-6">
            <h3 className="font-semibold text-lg text-primary">Próximo Nível</h3>
            <ul className="space-y-2">
              {nextFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Agora não
          </Button>
          <Button onClick={() => {
            navigate(`/planos?upgrade=true&current=${currentPlan}`);
            onOpenChange(false);
          }}>
            Ver Planos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
