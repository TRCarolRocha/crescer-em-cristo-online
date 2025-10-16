import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useCreatePendingPayment } from '@/hooks/useCreatePendingPayment';
import { PaymentConfirmation } from '@/components/subscription/PaymentConfirmation';
import { ConfirmationCodeDisplay } from '@/components/subscription/ConfirmationCodeDisplay';
import { EmailConfirmationPending } from '@/components/subscription/EmailConfirmationPending';
import { useResendConfirmationEmail } from '@/hooks/useResendConfirmationEmail';
import { churchSignupSchema, type ChurchSignupFormData } from '@/utils/subscriptionSchemas';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

const AssinaturaIgreja = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, user, session } = useAuth();
  const { toast } = useToast();
  const { plans } = useSubscriptionPlans();
  const { createPendingPayment } = useCreatePendingPayment();
  const { resendEmail, isResending, cooldown } = useResendConfirmationEmail();
  
  const [step, setStep] = useState<'form' | 'payment' | 'confirmation' | 'email-confirmation'>('form');
  const [loading, setLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [formData, setFormData] = useState<ChurchSignupFormData | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const selectedPlanFromState = location.state?.selectedPlan;
  const churchPlans = plans?.filter(p => p.plan_type.startsWith('church_')) || [];

  const form = useForm<ChurchSignupFormData>({
    resolver: zodResolver(churchSignupSchema),
    defaultValues: {
      churchName: '',
      cnpj: '',
      cpf: '',
      address: '',
      responsibleName: '',
      responsibleEmail: '',
      responsiblePhone: '',
      loginEmail: '',
      password: '',
      confirmPassword: '',
      planType: selectedPlanFromState || 'church_simple'
    }
  });

  // Fetch user profile if logged in
  useEffect(() => {
    if (user && session) {
      fetchUserProfile();
    }
  }, [user, session]);

  const fetchUserProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('full_name, church_id, phone, churches(name, cnpj, cpf, address)')
      .eq('id', user.id)
      .maybeSingle();
    
    if (data) {
      setProfile(data);
      
      // Pre-fill form with existing data
      form.reset({
        ...form.getValues(),
        responsibleName: data.full_name || '',
        loginEmail: user.email || '',
        responsiblePhone: data.phone || '',
        // If church exists, pre-fill church data
        ...(data.churches && {
          churchName: (data.churches as any).name || '',
          cnpj: (data.churches as any).cnpj || '',
          cpf: (data.churches as any).cpf || '',
          address: (data.churches as any).address || '',
        })
      });

      // If user already has all needed data, skip to payment
      if (data.full_name && data.churches) {
        setStep('payment');
      }
    }
  };

  const selectedPlanType = form.watch('planType');
  const selectedPlan = churchPlans.find(p => p.plan_type === selectedPlanType);

  const onSubmitForm = (data: ChurchSignupFormData) => {
    setFormData(data);
    setStep('payment');
  };

  const handlePaymentConfirmation = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      // If user is already logged in, skip signup
      if (!user || !session) {
        if (!formData) return;

        // Create user account
        const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
          email: formData.loginEmail,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/assinatura/igreja?resume=1`,
            data: {
              full_name: formData.responsibleName,
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

      // Prepare church data from form or existing profile
      const churchData = formData ? {
        church_name: formData.churchName,
        cnpj: formData.cnpj || null,
        cpf: formData.cpf || null,
        address: formData.address,
        responsible_name: formData.responsibleName,
        responsible_email: formData.responsibleEmail,
        responsible_phone: formData.responsiblePhone
      } : profile?.churches ? {
        church_name: profile.churches.name,
        cnpj: profile.churches.cnpj,
        cpf: profile.churches.cpf,
        address: profile.churches.address,
        responsible_name: profile.full_name,
        responsible_email: user?.email,
        responsible_phone: profile.phone
      } : null;

      // Create pending payment
      const payment = await createPendingPayment({
        planType: formData?.planType || selectedPlan.plan_type as any,
        amount: Number(selectedPlan.price_monthly),
        churchData
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
        email={formData?.loginEmail || ''}
        onResend={() => resendEmail(formData?.loginEmail || '')}
        isResending={isResending}
        cooldown={cooldown}
        redirectPath="/assinatura/igreja?resume=1"
      />
    );
  }

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <ConfirmationCodeDisplay
          confirmationCode={confirmationCode}
          email={formData?.loginEmail || user?.email || ''}
          planType={selectedPlan?.name || 'Igreja'}
          onContinue={() => navigate('/meu-espaco')}
        />
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <PaymentConfirmation
          amount={Number(selectedPlan?.price_monthly || 0)}
          planId={selectedPlan?.id}
          onConfirm={handlePaymentConfirmation}
          onBack={() => setStep('form')}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
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
            <CardTitle className="text-2xl">Assinatura para Igreja</CardTitle>
            <CardDescription>
              Preencha os dados da sua igreja para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="planType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano Escolhido</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um plano" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {churchPlans.map(plan => (
                            <SelectItem key={plan.id} value={plan.plan_type}>
                              {plan.name} - R$ {Number(plan.price_monthly).toFixed(2)}/mês
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {selectedPlan?.description}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Dados da Igreja</h3>
                  
                  <FormField
                    control={form.control}
                    name="churchName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Igreja</FormLabel>
                        <FormControl>
                          <Input placeholder="Igreja Batista Central" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ</FormLabel>
                          <FormControl>
                            <Input placeholder="00.000.000/0000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF (se não tiver CNPJ)</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, número, bairro, cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Dados do Responsável</h3>
                  
                  <FormField
                    control={form.control}
                    name="responsibleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Responsável</FormLabel>
                        <FormControl>
                          <Input placeholder="Pastor João Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="responsibleEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email do Responsável</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="pastor@igreja.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="responsiblePhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 98765-4321" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Dados de Acesso</h3>
                  
                  <FormField
                    control={form.control}
                    name="loginEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de Login</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="login@igreja.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Este será o email usado para fazer login no sistema
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                </div>

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
    </div>
  );
};

export default AssinaturaIgreja;
