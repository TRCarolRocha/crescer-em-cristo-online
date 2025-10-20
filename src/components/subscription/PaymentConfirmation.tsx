import React, { useEffect, useState } from 'react';
import { ArrowLeft, QrCode, ExternalLink, AlertCircle } from 'lucide-react';
import { PixCopyButton } from './PixCopyButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

            {/* Pix Copia e Cola */}
            {settings?.pix_copia_cola && (
              <PixCopyButton pixCode={settings.pix_copia_cola} />
            )}

            {/* Link de Pagamento Externo */}
            {settings?.external_payment_link && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(settings.external_payment_link!, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Pagar via Link Externo
              </Button>
            )}
          </>
        )}

        <Alert>
          <AlertDescription>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Abra o app do seu banco</li>
              <li>Escolha a opção Pix</li>
              <li>Escaneie o QR Code, use a chave Pix ou o código Copia e Cola</li>
              <li>Confirme o pagamento de R$ {amount.toFixed(2)}</li>
              <li>Clique em "Já realizei o pagamento" abaixo</li>
            </ol>
          </AlertDescription>
        </Alert>

        <Alert variant="default" className="border-primary/30 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <strong>Atenção:</strong> Após confirmar o pagamento, você receberá um <strong>código de confirmação na tela</strong>. 
            Guarde este código e envie para o administrador junto com o comprovante de pagamento.
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
