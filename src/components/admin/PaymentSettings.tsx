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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { QRCodeUpload } from './QRCodeUpload';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const settingsSchema = z.object({
  pix_key: z.string().min(5, 'Chave PIX é obrigatória'),
  pix_type: z.enum(['cpf', 'cnpj', 'email', 'phone', 'random']),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export const PaymentSettings = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined);
  const { settings, isLoading, updateSettings, createSettings } = usePaymentSettings(selectedPlanId);
  const { plans } = useSubscriptionPlans();
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      pix_key: '',
      pix_type: 'email',
    },
  });

  React.useEffect(() => {
    if (settings) {
      reset({
        pix_key: settings.pix_key,
        pix_type: settings.pix_type as 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
      });
    } else {
      reset({
        pix_key: '',
        pix_type: 'email'
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      if (settings) {
        // Atualizar configuração existente
        await updateSettings({
          pix_key: data.pix_key,
          pix_type: data.pix_type,
          plan_id: selectedPlanId
        });
      } else {
        // Criar nova configuração
        await createSettings({
          pix_key: data.pix_key,
          pix_type: data.pix_type,
          plan_id: selectedPlanId
        });
      }
      
      toast({
        title: 'Configurações salvas!',
        description: selectedPlanId 
          ? 'Configuração específica do plano foi atualizada.'
          : 'Configuração global (padrão) foi atualizada.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
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
          <CardTitle>Configurações de PIX por Plano</CardTitle>
          <CardDescription>
            Configure chaves PIX específicas para cada plano de assinatura
          </CardDescription>
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
            </div>

              <Button type="submit" disabled={isLoading}>
                {settings ? 'Atualizar Configuração' : 'Criar Configuração'}
              </Button>
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
          <QRCodeUpload currentUrl={settings?.qr_code_url} />
        </CardContent>
      </Card>
    </div>
  );
};
