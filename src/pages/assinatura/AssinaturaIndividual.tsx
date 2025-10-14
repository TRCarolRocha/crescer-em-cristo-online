import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useCreatePendingPayment } from '@/hooks/useCreatePendingPayment';
import { PaymentConfirmation } from '@/components/subscription/PaymentConfirmation';
import { ConfirmationCodeDisplay } from '@/components/subscription/ConfirmationCodeDisplay';
import { EmailConfirmationPending } from '@/components/subscription/EmailConfirmationPending';
import { useResendConfirmationEmail } from '@/hooks/useResendConfirmationEmail';
import { supabase } from '@/integrations/supabase/client';
import { individualSignupSchema, IndividualSignupFormData } from '@/utils/subscriptionSchemas';

const AssinaturaIndividual = () => {
  const navigate = useNavigate();
  const { signUp, user, session } = useAuth();
  const { toast } = useToast();
  const { plans } = useSubscriptionPlans();
  const { createPendingPayment } = useCreatePendingPayment();
  const { resendEmail, isResending, cooldown } = useResendConfirmationEmail();
  
  const [step, setStep] = useState<'form' | 'payment' | 'confirmation' | 'email-confirmation'>('form');
  const [loading, setLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [formData, setFormData] = useState<IndividualSignupFormData | null>(null);

  const individualPlan = plans?.find(p => p.plan_type === 'individual');

  // Skip form if user is already logged in
  useEffect(() => {
    if (user && session) {
      setStep('payment');
    }
  }, [user, session]);

  const form = useForm<IndividualSignupFormData>({
    resolver: zodResolver(individualSignupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmitForm = (data: IndividualSignupFormData) => {
    setFormData(data);
    setStep('payment');
  };

  const handlePaymentConfirmation = async () => {
    if (!individualPlan) return;

    setLoading(true);
    try {
      // If user is already logged in, skip signup
      if (!user || !session) {
        if (!formData) return;

        // Create user account
        const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: formData.fullName,
            }
          }
        });

        if (signUpError) {
          toast({
            title: 'Erro no cadastro',
            description: signUpError.message,
            variant: 'destructive'
          });
          return;
        }

        // Check if email confirmation is needed
        if (signUpData && !signUpData.session) {
          setStep('email-confirmation');
          return;
        }
      }

      // Create pending payment
      const payment = await createPendingPayment({
        planType: 'individual',
        amount: Number(individualPlan.price_monthly)
      });

      setConfirmationCode(payment.confirmation_code);
      setStep('confirmation');

      toast({
        title: 'Pagamento registrado!',
        description: 'Seu pagamento está em análise. Você receberá um email em até 24h.'
      });

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'email-confirmation') {
    return (
      <EmailConfirmationPending
        email={formData?.email || ''}
        onResend={() => resendEmail(formData?.email || '')}
        isResending={isResending}
        cooldown={cooldown}
      />
    );
  }

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <ConfirmationCodeDisplay
          confirmationCode={confirmationCode}
          email={formData?.email || ''}
          planType="Individual"
          onContinue={() => navigate('/meu-espaco')}
        />
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <PaymentConfirmation
          amount={Number(individualPlan?.price_monthly || 0)}
          planId={individualPlan?.id}
          onConfirm={handlePaymentConfirmation}
          onBack={() => setStep('form')}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/planos')}
            className="w-fit mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <CardTitle className="text-2xl">Plano Individual</CardTitle>
          <CardDescription>
            R$ {Number(individualPlan?.price_monthly || 0).toFixed(2)}/mês
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirme sua senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary"
              >
                Prosseguir para Pagamento
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssinaturaIndividual;
