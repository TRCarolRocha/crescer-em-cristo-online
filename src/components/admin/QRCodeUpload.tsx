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

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('message-images')
        .getPublicUrl(`payment-qrcodes/${uploadData.path}`);

      // Update settings
      const { error: updateError } = await supabase
        .from('payment_settings')
        .update({ qr_code_url: publicUrl })
        .eq('is_active', true)
        .match(planId ? { plan_id: planId } : { plan_id: null });

      if (updateError) throw updateError;

      // Invalidate payment settings query to refresh UI
      queryClient.invalidateQueries({ queryKey: ['payment-settings', planId] });
      
      toast({
        title: 'QR Code salvo!',
        description: 'A imagem foi atualizada com sucesso.',
      });
    } catch (error: any) {
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
      const { error } = await supabase
        .from('payment_settings')
        .update({ qr_code_url: null })
        .eq('is_active', true);

      if (error) throw error;

      toast({
        title: 'QR Code removido',
        description: 'O QR Code foi removido com sucesso.',
      });

      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
    } catch (error: any) {
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
