import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { QRCodeUpload } from './QRCodeUpload';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Info, CheckCircle2, AlertCircle, XCircle, Eye } from 'lucide-react';
import { PaymentConfirmation } from '@/components/subscription/PaymentConfirmation';
import { cn } from '@/lib/utils';

const settingsSchema = z.object({
  pix_key: z.string().min(5, 'Chave PIX é obrigatória'),
  pix_type: z.enum(['cpf', 'cnpj', 'email', 'phone', 'random']),
  pix_copia_cola: z.string().optional(),
  external_payment_link: z.string().url('URL inválida').optional().or(z.literal('')),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export const PaymentSettings = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { settings, isLoading, updateSettings, createSettings } = usePaymentSettings(selectedPlanId);
  const { plans } = useSubscriptionPlans();
  const { toast } = useToast();

  // Verificar se a chave PIX é placeholder
  const isPlaceholderKey = (key: string) => {
    const placeholders = ['exemplo', 'seu-pix', 'placeholder', 'teste', 'seu_email', 'seuemail'];
    return placeholders.some(p => key.toLowerCase().includes(p));
  };

  // Verificar completude da configuração
  const getConfigStatus = () => {
    if (!settings?.pix_key) return { complete: false, percentage: 0 };
    
    const checks = {
      hasPixKey: !!settings.pix_key && !isPlaceholderKey(settings.pix_key),
      hasQrCode: !!settings.qr_code_url,
      hasPixCopiaCola: !!settings.pix_copia_cola,
      hasExternalLink: !!settings.external_payment_link,
    };

    const completed = Object.values(checks).filter(Boolean).length;
    const total = 4;
    
    return {
      complete: checks.hasPixKey && (checks.hasQrCode || checks.hasPixCopiaCola),
      percentage: (completed / total) * 100,
      checks
    };
  };

  const configStatus = getConfigStatus();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      pix_key: '',
      pix_type: 'email',
      pix_copia_cola: '',
      external_payment_link: '',
    },
  });

  React.useEffect(() => {
    if (settings) {
      reset({
        pix_key: settings.pix_key,
        pix_type: settings.pix_type as 'cpf' | 'cnpj' | 'email' | 'phone' | 'random',
        pix_copia_cola: settings.pix_copia_cola || '',
        external_payment_link: settings.external_payment_link || '',
      });
    } else {
      reset({
        pix_key: '',
        pix_type: 'email',
        pix_copia_cola: '',
        external_payment_link: '',
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      console.log('[FORM] Submissão iniciada:', { 
        plan_id: selectedPlanId, 
        has_settings: !!settings,
        settings_id: settings?.id 
      });

      if (settings) {
        console.log('[FORM] Chamando updateSettings...');
        // Atualizar configuração existente
        await updateSettings({
          pix_key: data.pix_key,
          pix_type: data.pix_type,
          qr_code_url: settings.qr_code_url,
          pix_copia_cola: data.pix_copia_cola || undefined,
          external_payment_link: data.external_payment_link || undefined,
          plan_id: selectedPlanId
        });
      } else {
        console.log('[FORM] Chamando createSettings...');
        // Criar nova configuração
        await createSettings({
          pix_key: data.pix_key,
          pix_type: data.pix_type,
          pix_copia_cola: data.pix_copia_cola || undefined,
          external_payment_link: data.external_payment_link || undefined,
          plan_id: selectedPlanId
        });
      }
      
      console.log('[FORM] Sucesso!');
      
      toast({
        title: 'Configurações salvas!',
        description: selectedPlanId 
          ? 'Configuração específica do plano foi atualizada.'
          : 'Configuração global (padrão) foi atualizada.',
      });
    } catch (error: any) {
      console.error('[FORM] Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar configurações',
        description: error.message || 'Tente novamente ou contate o suporte.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Configurações de PIX por Plano</CardTitle>
              <CardDescription>
                Configure chaves PIX específicas para cada plano de assinatura
              </CardDescription>
            </div>
            {settings && (
              <Badge variant={configStatus.complete ? "default" : "destructive"} className="h-fit">
                {configStatus.complete ? (
                  <><CheckCircle2 className="w-3 h-3 mr-1" /> Completa</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" /> Incompleta</>
                )}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Seletor de Plano */}
            <div className="space-y-2">
              <Label htmlFor="plan">Plano</Label>
              <Select
                value={selectedPlanId || 'global'}
                onValueChange={(value) => setSelectedPlanId(value === 'global' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">
                    🌐 Configuração Global (Padrão)
                  </SelectItem>
                  {plans?.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - R$ {Number(plan.price_monthly).toFixed(2)}/mês
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {selectedPlanId 
                    ? 'Configurando dados de pagamento específicos para este plano. Se não configurado, usará a configuração global.'
                    : 'Configuração global será usada quando um plano não tiver configuração específica.'}
                </AlertDescription>
              </Alert>
            </div>

            {!settings && selectedPlanId && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Este plano ainda não tem configuração específica. Está usando a configuração global.
                </AlertDescription>
              </Alert>
            )}

            {/* Checklist de Configuração */}
            {settings && (
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Status da Configuração</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {configStatus.checks.hasPixKey ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className={cn(!configStatus.checks.hasPixKey && "text-muted-foreground")}>
                      Chave PIX válida configurada
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {configStatus.checks.hasQrCode ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                    <span className={cn(!configStatus.checks.hasQrCode && "text-muted-foreground")}>
                      QR Code enviado
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {configStatus.checks.hasPixCopiaCola ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                    <span className={cn(!configStatus.checks.hasPixCopiaCola && "text-muted-foreground")}>
                      Pix Copia e Cola configurado
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {configStatus.checks.hasExternalLink ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Info className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={cn(!configStatus.checks.hasExternalLink && "text-muted-foreground")}>
                      Link de pagamento externo (opcional)
                    </span>
                  </div>
                  
                  {!configStatus.complete && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Atenção</AlertTitle>
                      <AlertDescription>
                        Configure pelo menos a chave PIX válida e um QR Code ou Pix Copia e Cola para que os clientes possam realizar pagamentos.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pix_type">Tipo de Chave</Label>
              <Select
                value={watch('pix_type')}
                onValueChange={(value) => setValue('pix_type', value as 'cpf' | 'cnpj' | 'email' | 'phone' | 'random')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpf">CPF</SelectItem>
                  <SelectItem value="cnpj">CNPJ</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Telefone</SelectItem>
                  <SelectItem value="random">Chave Aleatória</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pix_key">Chave PIX</Label>
              <Input id="pix_key" {...register('pix_key')} />
              {errors.pix_key && (
                <p className="text-sm text-destructive">{errors.pix_key.message}</p>
              )}
              {watch('pix_key') && isPlaceholderKey(watch('pix_key')) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    ⚠️ Esta chave PIX parece ser um exemplo. Configure uma chave real!
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pix_copia_cola">Pix Copia e Cola (Opcional)</Label>
              <Textarea 
                id="pix_copia_cola" 
                {...register('pix_copia_cola')}
                placeholder="00020126... (código gerado pelo banco)"
                rows={3}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Código completo gerado pelo seu banco para pagamento instantâneo
              </p>
              {errors.pix_copia_cola && (
                <p className="text-sm text-destructive">{errors.pix_copia_cola.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="external_payment_link">Link de Pagamento Externo (Opcional)</Label>
              <Input 
                id="external_payment_link" 
                {...register('external_payment_link')}
                placeholder="https://mercadopago.com.br/..."
              />
              <p className="text-xs text-muted-foreground">
                Link do Mercado Pago, Asaas ou outro gateway
              </p>
              {errors.external_payment_link && (
                <p className="text-sm text-destructive">{errors.external_payment_link.message}</p>
              )}
            </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {settings ? 'Atualizar Configuração' : 'Criar Configuração'}
                </Button>

                {settings && (
                  <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar Pagamento
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Preview - Tela de Pagamento</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <PaymentConfirmation
                          amount={99.90}
                          planId={selectedPlanId}
                          onConfirm={() => setPreviewOpen(false)}
                          onBack={() => setPreviewOpen(false)}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>QR Code PIX</CardTitle>
          <CardDescription>
            Faça upload do QR Code para facilitar os pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QRCodeUpload currentUrl={settings?.qr_code_url} planId={selectedPlanId} />
        </CardContent>
      </Card>
    </div>
  );
};
