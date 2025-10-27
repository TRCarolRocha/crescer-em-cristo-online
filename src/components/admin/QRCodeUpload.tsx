import React from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface QRCodeUploadProps {
  currentUrl?: string | null;
  planId?: string | null;
}

export const QRCodeUpload: React.FC<QRCodeUploadProps> = ({ currentUrl, planId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `qrcode-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('message-images')
        .upload(`payment-qrcodes/${fileName}`, file);

      if (uploadError) {
        throw new Error('Erro ao fazer upload. Verifique a permissão de upload do bucket message-images.');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('message-images')
        .getPublicUrl(`payment-qrcodes/${uploadData.path}`);

      console.log('[QR UPLOAD] URL gerada:', publicUrl);

      // BUSCAR CONFIG EXISTENTE
      let query = supabase
        .from('payment_settings')
        .select('id')
        .eq('is_active', true);
      
      if (planId) {
        query = query.eq('plan_id', planId);
      } else {
        query = query.is('plan_id', null);
      }
      
      const { data: existing, error: searchError } = await query
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (searchError) throw searchError;
      
      if (!existing) {
        throw new Error('Configuração de pagamento não encontrada. Configure a chave PIX primeiro.');
      }

      console.log('[QR UPLOAD] Atualizando config ID:', existing.id);

      // UPDATE DIRETO PELO ID
      const { error: updateError } = await supabase
        .from('payment_settings')
        .update({ 
          qr_code_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;

      // Invalidate payment settings query to refresh UI
      queryClient.invalidateQueries({ queryKey: ['payment-settings', planId] });
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
      
      toast({
        title: 'QR Code salvo!',
        description: 'A imagem foi atualizada com sucesso.',
      });
    } catch (error: any) {
      console.error('[QR UPLOAD] Erro:', error);
      toast({
        title: 'Erro no upload',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      // BUSCAR CONFIG EXISTENTE
      let query = supabase
        .from('payment_settings')
        .select('id')
        .eq('is_active', true);
      
      if (planId) {
        query = query.eq('plan_id', planId);
      } else {
        query = query.is('plan_id', null);
      }
      
      const { data: existing, error: searchError } = await query
        .limit(1)
        .maybeSingle();
      
      if (searchError) throw searchError;
      
      if (!existing) {
        throw new Error('Configuração não encontrada.');
      }

      // UPDATE PELO ID
      const { error } = await supabase
        .from('payment_settings')
        .update({ 
          qr_code_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) throw error;

      toast({
        title: 'QR Code removido',
        description: 'O QR Code foi removido com sucesso.',
      });

      queryClient.invalidateQueries({ queryKey: ['payment-settings', planId] });
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
    } catch (error: any) {
      console.error('[QR REMOVE] Erro:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {currentUrl ? (
        <div className="relative w-64 h-64 border rounded-lg overflow-hidden">
          <img src={currentUrl} alt="QR Code PIX" className="w-full h-full object-contain" />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className="w-64 h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Clique para fazer upload</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={uploading}
      />

      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Enviando...' : currentUrl ? 'Alterar QR Code' : 'Fazer Upload'}
      </Button>
    </div>
  );
};
