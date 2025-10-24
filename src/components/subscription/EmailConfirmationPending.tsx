import React, { useEffect } from 'react';
import { Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface EmailConfirmationPendingProps {
  email: string;
  onResend: () => void;
  isResending: boolean;
  cooldown?: number;
  redirectPath?: string;
}

export const EmailConfirmationPending: React.FC<EmailConfirmationPendingProps> = ({
  email,
  onResend,
  isResending,
  cooldown = 0,
  redirectPath
}) => {
  const navigate = useNavigate();

  // Observer para detectar confirmação de email
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session && redirectPath) {
        navigate(redirectPath);
      }
    });

    return () => subscription.unsubscribe();
  }, [redirectPath, navigate]);

  const handleContinue = () => {
    if (redirectPath) {
      navigate(redirectPath);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Mail className="w-16 h-16 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Confirme seu Email</CardTitle>
          <CardDescription className="text-center">
            Enviamos um link de confirmação para <strong className="text-foreground">{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Acesse sua caixa de entrada</li>
                <li>Clique no link de confirmação</li>
                <li>Após confirmar, você será redirecionado automaticamente para continuar o pagamento</li>
              </ol>
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleContinue}
              className="w-full"
            >
              Já confirmei, continuar
            </Button>
            
            <Button 
              onClick={onResend} 
              disabled={isResending || cooldown > 0}
              variant="outline"
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              {isResending ? (
                <>Enviando...</>
              ) : cooldown > 0 ? (
                <>Aguarde {cooldown}s</>
              ) : (
                <>Reenviar Email</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
