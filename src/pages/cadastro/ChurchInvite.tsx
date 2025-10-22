import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useChurchInvite } from '@/hooks/useChurchInvite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResendConfirmationEmail } from '@/components/auth/ResendConfirmationEmail';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, AlertCircle } from 'lucide-react';

const inviteSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
});

type InviteFormData = z.infer<typeof inviteSchema>;

const ChurchInvite = () => {
  const { churchSlug } = useParams<{ churchSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { joinChurch, isLoading } = useChurchInvite();

  const { register, handleSubmit, formState: { errors } } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  });

  const [signupSuccess, setSignupSuccess] = React.useState(false);
  const [churchName, setChurchName] = React.useState('');
  const [userEmail, setUserEmail] = React.useState('');

  const onSubmit = async (data: InviteFormData) => {
    if (!churchSlug) return;

    try {
      const result = await joinChurch({
        churchSlug,
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });

      setChurchName(result.church.name);
      setUserEmail(data.email);
      setSignupSuccess(true);

      toast({
        title: 'Cadastro realizado!',
        description: `Bem-vindo(a) à ${result.church.name}! Verifique seu e-mail para confirmar.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro no cadastro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Cadastro Realizado!</CardTitle>
            <CardDescription>
              Bem-vindo(a) à {churchName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Enviamos um e-mail de confirmação para <strong>{userEmail}</strong>. 
                Por favor, verifique sua caixa de entrada (e spam) e confirme seu cadastro.
              </AlertDescription>
            </Alert>

            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Importante:</strong> Verifique também sua caixa de spam. 
                O e-mail pode levar alguns minutos para chegar.
              </AlertDescription>
            </Alert>

            <ResendConfirmationEmail email={userEmail} />

            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Voltar para Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Junte-se à Igreja</CardTitle>
          <CardDescription>
            Crie sua conta para fazer parte desta comunidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                {...register('fullName')}
                placeholder="Seu nome completo"
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                placeholder="Confirme sua senha"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChurchInvite;
