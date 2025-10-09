import React from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ConfirmationCodeDisplayProps {
  confirmationCode: string;
  email: string;
  planType: string;
  onContinue: () => void;
}

export const ConfirmationCodeDisplay: React.FC<ConfirmationCodeDisplayProps> = ({
  confirmationCode,
  email,
  planType,
  onContinue
}) => {
  const { toast } = useToast();

  const copyCode = () => {
    navigator.clipboard.writeText(confirmationCode);
    toast({
      title: 'Código copiado!',
      description: 'O código foi copiado para sua área de transferência.'
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-2xl">Pagamento Registrado!</CardTitle>
        <CardDescription>
          Seu pagamento está em análise
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">Código de Confirmação:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-background px-3 py-2 rounded text-center font-mono">
              {confirmationCode}
            </code>
            <Button size="icon" variant="outline" onClick={copyCode}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>✓ Plano: {planType}</p>
          <p>✓ Email: {email}</p>
          <p className="mt-4">
            Você receberá um email de confirmação em até 24 horas após a aprovação do pagamento.
          </p>
          <p className="font-medium text-foreground mt-2">
            Guarde este código de confirmação para referência futura.
          </p>
        </div>

        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-primary to-secondary"
        >
          Ir para Meu Espaço
        </Button>
      </CardContent>
    </Card>
  );
};
