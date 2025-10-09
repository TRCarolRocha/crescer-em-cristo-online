import React from 'react';
import { ArrowLeft, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentConfirmationProps {
  amount: number;
  onConfirm: () => void;
  onBack: () => void;
  loading?: boolean;
}

export const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  amount,
  onConfirm,
  onBack,
  loading = false
}) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="w-fit mb-4"
          disabled={loading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <CardTitle className="text-2xl">Pagamento via PIX</CardTitle>
        <CardDescription>
          Valor: R$ {amount.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted rounded-lg p-8 flex flex-col items-center justify-center">
          <QrCode className="w-48 h-48 text-muted-foreground mb-4" />
          <p className="text-sm text-center text-muted-foreground">
            QR Code PIX (Demo)
          </p>
        </div>

        <Alert>
          <AlertDescription>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Abra o app do seu banco</li>
              <li>Escolha a opção Pix</li>
              <li>Escaneie o QR Code acima</li>
              <li>Confirme o pagamento de R$ {amount.toFixed(2)}</li>
              <li>Clique em "Já realizei o pagamento" abaixo</li>
            </ol>
          </AlertDescription>
        </Alert>

        <Button
          onClick={onConfirm}
          className="w-full bg-gradient-to-r from-primary to-secondary"
          disabled={loading}
        >
          {loading ? 'Processando...' : 'Já realizei o pagamento'}
        </Button>
      </CardContent>
    </Card>
  );
};
