import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ResendConfirmationEmailProps {
  email: string;
}

export const ResendConfirmationEmail: React.FC<ResendConfirmationEmailProps> = ({ email }) => {
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;

      toast({
        title: 'E-mail enviado',
        description: 'Um novo e-mail de confirmação foi enviado. Verifique sua caixa de entrada.',
      });

      // Start countdown
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      console.error('Error resending confirmation:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível reenviar o e-mail de confirmação',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Button
      onClick={handleResend}
      disabled={countdown > 0 || isResending}
      variant="outline"
      className="w-full"
    >
      <Mail className="h-4 w-4 mr-2" />
      {isResending
        ? 'Enviando...'
        : countdown > 0
        ? `Aguarde ${countdown}s para reenviar`
        : 'Reenviar E-mail de Confirmação'}
    </Button>
  );
};
