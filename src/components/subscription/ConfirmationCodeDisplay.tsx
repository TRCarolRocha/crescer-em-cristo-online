import React from 'react';
import { Check, Copy, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

  const copyAllInfo = () => {
    const allInfo = `CÓDIGO DE CONFIRMAÇÃO: ${confirmationCode}\nPLANO: ${planType}\nEMAIL: ${email}`;
    navigator.clipboard.writeText(allInfo);
    toast({
      title: 'Informações copiadas!',
      description: 'Todas as informações foram copiadas para compartilhar com o administrador.'
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
        <Alert variant="default" className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-900 dark:text-amber-400 font-semibold">
            Importante: Guarde este código!
          </AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
            O sistema de e-mails está temporariamente desabilitado. Você NÃO receberá e-mail de confirmação.
            <strong className="block mt-2">Envie este código para o administrador aprovar seu pagamento.</strong>
          </AlertDescription>
        </Alert>

        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 space-y-3 border-2 border-primary/20">
          <p className="text-sm font-semibold text-center text-primary">Código de Confirmação:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-background px-4 py-3 rounded-lg text-center font-mono text-2xl font-bold tracking-wider">
              {confirmationCode}
            </code>
            <Button size="icon" variant="outline" onClick={copyCode} className="h-12 w-12">
              <Copy className="w-5 h-5" />
            </Button>
          </div>
          <Button 
            variant="secondary" 
            className="w-full mt-2" 
            onClick={copyAllInfo}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar todas as informações
          </Button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <p className="font-medium">✓ Plano: <span className="text-foreground font-semibold">{planType}</span></p>
            <p className="font-medium">✓ Email: <span className="text-foreground font-semibold">{email}</span></p>
          </div>
          
          <Alert>
            <AlertDescription className="text-xs space-y-2">
              <p className="font-semibold text-foreground">Próximos passos:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Copie este código de confirmação</li>
                <li>Envie para o administrador junto com o comprovante de pagamento</li>
                <li>Aguarde a aprovação (geralmente em até 24 horas)</li>
                <li>Você poderá acessar seu plano após a aprovação</li>
              </ol>
            </AlertDescription>
          </Alert>
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
