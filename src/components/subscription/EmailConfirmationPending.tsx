import React from 'react';
import { Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
          
          <div className="flex justify-center">
            <Button 
              onClick={onResend} 
              disabled={isResending || cooldown > 0}
              variant="outline"
              className="w-full max-w-[300px]"
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
