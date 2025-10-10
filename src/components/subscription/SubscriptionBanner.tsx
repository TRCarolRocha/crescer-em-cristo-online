import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface SubscriptionBannerProps {
  status: 'pending' | 'expired';
  planType?: string;
  onRenew?: () => void;
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({
  status,
  planType,
  onRenew
}) => {
  if (status === 'pending') {
    return (
      <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <Clock className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-200">
          Pagamento em Análise
        </AlertTitle>
        <AlertDescription className="text-yellow-700 dark:text-yellow-300">
          Seu pagamento do plano {planType} está sendo analisado. 
          Você receberá um email de confirmação em até 24 horas.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'expired') {
    return (
      <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-950">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800 dark:text-red-200">
          Plano Expirado
        </AlertTitle>
        <AlertDescription className="text-red-700 dark:text-red-300">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2">
                Seu plano {planType} expirou. Renove agora para continuar acessando todos os recursos.
              </p>
              <p className="text-sm">
                Após 7 dias sem renovação, sua assinatura será cancelada e você retornará ao plano gratuito.
              </p>
            </div>
            {onRenew && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onRenew}
                className="shrink-0"
              >
                Renovar Agora
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
