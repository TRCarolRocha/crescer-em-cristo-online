import React, { useEffect, useState } from 'react';
import { ArrowLeft, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { Skeleton } from '@/components/ui/skeleton';

interface PaymentConfirmationProps {
  amount: number;
  planId?: string;
  onConfirm: () => void;
  onBack: () => void;
  loading?: boolean;
}

export const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  amount,
  planId,
  onConfirm,
  onBack,
  loading = false
}) => {
  const { settings, isLoading: loadingSettings } = usePaymentSettings(planId);

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
        {loadingSettings ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            {/* QR Code */}
            <div className="bg-muted rounded-lg p-8 flex flex-col items-center justify-center">
              {settings?.qr_code_url ? (
                <img 
                  src={settings.qr_code_url} 
                  alt="QR Code PIX" 
                  className="w-48 h-48 object-contain mb-4"
                />
              ) : (
                <>
                  <QrCode className="w-48 h-48 text-muted-foreground mb-4" />
                  <p className="text-sm text-center text-muted-foreground">
                    QR Code não disponível
                  </p>
                </>
              )}
            </div>

            {/* Dados PIX */}
            {settings && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold">Chave PIX:</p>
                <p className="text-sm font-mono break-all">{settings.pix_key}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Tipo: {settings.pix_type.toUpperCase()}
                </p>
              </div>
            )}
          </>
        )}

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
