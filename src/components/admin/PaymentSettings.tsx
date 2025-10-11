import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { QRCodeUpload } from './QRCodeUpload';

const settingsSchema = z.object({
  pix_key: z.string().min(5, 'Chave PIX é obrigatória'),
  pix_type: z.enum(['cpf', 'cnpj', 'email', 'phone', 'random']),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export const PaymentSettings = () => {
  const { settings, isLoading, updateSettings } = usePaymentSettings();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      pix_key: settings?.pix_key || '',
      pix_type: (settings?.pix_type as 'cpf' | 'cnpj' | 'email' | 'phone' | 'random') || 'email',
    },
  });

  React.useEffect(() => {
    if (settings) {
      setValue('pix_key', settings.pix_key);
      setValue('pix_type', settings.pix_type as 'cpf' | 'cnpj' | 'email' | 'phone' | 'random');
    }
  }, [settings, setValue]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      await updateSettings({
        pix_key: data.pix_key,
        pix_type: data.pix_type,
      });
      toast({
        title: 'Configurações salvas!',
        description: 'As configurações de pagamento foram atualizadas.',
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
          <CardTitle>Configurações de PIX</CardTitle>
          <CardDescription>
            Configure a chave PIX para recebimento de pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pix_type">Tipo de Chave</Label>
              <Select
                value={watch('pix_type')}
                onValueChange={(value) => setValue('pix_type', value as any)}
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

            <Button type="submit">Salvar Configurações</Button>
          </form>
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
