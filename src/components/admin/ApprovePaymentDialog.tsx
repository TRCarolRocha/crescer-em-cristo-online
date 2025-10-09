import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useApprovePayment } from '@/hooks/useApprovePayment';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApprovePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: any;
  onSuccess: () => void;
}

export function ApprovePaymentDialog({
  open,
  onOpenChange,
  payment,
  onSuccess,
}: ApprovePaymentDialogProps) {
  const { toast } = useToast();
  const { approvePayment, isLoading } = useApprovePayment();

  const handleApprove = async () => {
    try {
      await approvePayment(payment.id);
      toast({
        title: 'Pagamento aprovado!',
        description: 'O usuário receberá um email de confirmação.',
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Erro ao aprovar pagamento',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getPlanTypeName = (planType: string) => {
    const names: Record<string, string> = {
      individual: 'Individual',
      church_simple: 'Igreja Simples',
      church_plus: 'Igreja Plus',
      church_premium: 'Igreja Premium',
    };
    return names[planType] || planType;
  };

  const isChurchPlan = payment?.plan_type?.startsWith('church');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Aprovar Pagamento
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 pt-4">
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Detalhes do pagamento:</p>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Código:</span>
                  <span className="font-mono font-medium text-foreground">
                    {payment?.confirmation_code}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plano:</span>
                  <span className="font-medium text-foreground">
                    {getPlanTypeName(payment?.plan_type)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-semibold text-foreground">
                    R$ {Number(payment?.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Usuário:</span>
                  <span className="font-medium text-foreground">
                    {payment?.profiles?.full_name}
                  </span>
                </div>
                {isChurchPlan && payment?.church_data && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Igreja:</span>
                    <span className="font-medium text-foreground">
                      {payment.church_data.church_name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <p className="font-semibold text-foreground">Ao aprovar, o sistema irá:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Criar registro de assinatura ativa (válida por 30 dias)</li>
                {isChurchPlan && (
                  <>
                    <li>Criar igreja no sistema com slug único</li>
                    <li>Atribuir role de Admin para a igreja</li>
                  </>
                )}
                {!isChurchPlan && <li>Vincular assinatura ao perfil do usuário</li>}
                <li>Enviar email de boas-vindas</li>
                <li>Marcar pagamento como aprovado</li>
              </ul>
            </div>

            <p className="text-amber-600 text-sm font-medium pt-2">
              ⚠️ Esta ação não pode ser desfeita!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleApprove} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirmar Aprovação
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
