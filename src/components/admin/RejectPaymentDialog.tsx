import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRejectPayment } from '@/hooks/useRejectPayment';
import { XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const rejectSchema = z.object({
  rejection_reason: z
    .string()
    .min(10, 'O motivo deve ter pelo menos 10 caracteres')
    .max(500, 'O motivo deve ter no máximo 500 caracteres'),
});

type RejectFormData = z.infer<typeof rejectSchema>;

interface RejectPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: any;
  onSuccess: () => void;
}

export function RejectPaymentDialog({
  open,
  onOpenChange,
  payment,
  onSuccess,
}: RejectPaymentDialogProps) {
  const { toast } = useToast();
  const { rejectPayment, isLoading } = useRejectPayment();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RejectFormData>({
    resolver: zodResolver(rejectSchema),
  });

  const onSubmit = async (data: RejectFormData) => {
    try {
      await rejectPayment(payment.id, data.rejection_reason);
      toast({
        title: 'Pagamento rejeitado',
        description: 'O usuário receberá um email com o motivo da rejeição.',
      });
      reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Erro ao rejeitar pagamento',
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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Rejeitar Pagamento
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
                    <span className="text-muted-foreground">Usuário:</span>
                    <span className="font-medium text-foreground">
                      {payment?.profiles?.full_name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejection_reason" className="text-foreground">
                  Motivo da rejeição *
                </Label>
                <Textarea
                  id="rejection_reason"
                  {...register('rejection_reason')}
                  placeholder="Explique o motivo da rejeição (mínimo 10 caracteres)"
                  className="min-h-[100px]"
                />
                {errors.rejection_reason && (
                  <p className="text-sm text-red-600">{errors.rejection_reason.message}</p>
                )}
              </div>

              <p className="text-amber-600 text-sm font-medium pt-2">
                ⚠️ O usuário receberá um email com este motivo. Esta ação não pode ser desfeita!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Confirmar Rejeição
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
