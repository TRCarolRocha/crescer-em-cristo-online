import React, { useEffect, useState } from 'react';
import { ArrowLeft, QrCode, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PixCopyButton } from './PixCopyButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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

  // Determinar qual método de pagamento está disponível
  const hasQrCode = !!settings?.qr_code_url;
  const hasPixCopiaCola = !!settings?.pix_copia_cola;
  const hasExternalLink = !!settings?.external_payment_link;
  const onlyPixKey = !hasQrCode && !hasPixCopiaCola && !hasExternalLink;

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
            {/* Alert quando falta QR Code e Pix Copia e Cola */}
            {onlyPixKey && (
              <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle>QR Code não disponível</AlertTitle>
                <AlertDescription>
                  Use a chave PIX abaixo para fazer o pagamento manualmente no app do seu banco.
                </AlertDescription>
              </Alert>
            )}

            {/* QR Code - PRIORIDADE 1 */}
            {hasQrCode && (
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-6 border-2 border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <p className="font-semibold text-primary">Método Recomendado: QR Code</p>
                </div>
                <div className="bg-white rounded-lg p-4 flex flex-col items-center justify-center">
                  <img 
                    src={settings.qr_code_url} 
                    alt="QR Code PIX" 
                    className="w-48 h-48 object-contain"
                  />
                  <p className="text-sm text-muted-foreground mt-2">Escaneie com o app do banco</p>
                </div>
              </div>
            )}

            {/* Pix Copia e Cola - PRIORIDADE 2 */}
            {hasPixCopiaCola && (
              <div className={cn(
                "rounded-lg p-4 border-2",
                !hasQrCode ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"
              )}>
                {!hasQrCode && (
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold text-primary">Método Recomendado</p>
                  </div>
                )}
                <PixCopyButton pixCode={settings.pix_copia_cola} />
              </div>
            )}

            {/* Chave PIX Manual - PRIORIDADE 3 (destacada se for única opção) */}
            {settings && (
              <div className={cn(
                "rounded-lg p-4 space-y-2 border-2",
                onlyPixKey 
                  ? "border-primary bg-gradient-to-br from-primary/10 to-secondary/10" 
                  : "border-border bg-muted/50"
              )}>
                {onlyPixKey && (
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold text-primary">Use esta chave PIX</p>
                  </div>
                )}
                <p className="text-sm font-semibold">Chave PIX:</p>
                <p className={cn(
                  "font-mono break-all",
                  onlyPixKey ? "text-base font-bold text-foreground" : "text-sm"
                )}>
                  {settings.pix_key}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Tipo: {settings.pix_type.toUpperCase()}
                </p>
              </div>
            )}

            {/* Link de Pagamento Externo */}
            {hasExternalLink && (
              <Button
                variant="outline"
                size="lg"
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
              <li>
                {hasQrCode && "Escaneie o QR Code acima"}
                {!hasQrCode && hasPixCopiaCola && "Use o código Pix Copia e Cola"}
                {onlyPixKey && "Digite a chave PIX manualmente"}
              </li>
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
