import React, { useState } from 'react';
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
import { churchSignupSchema, type ChurchSignupFormData } from '@/utils/subscriptionSchemas';
import { Separator } from '@/components/ui/separator';

const AssinaturaIgreja = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const { plans } = useSubscriptionPlans();
  const { createPendingPayment } = useCreatePendingPayment();
  
  const [step, setStep] = useState<'form' | 'payment' | 'confirmation'>('form');
  const [loading, setLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [formData, setFormData] = useState<ChurchSignupFormData | null>(null);

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

  const selectedPlanType = form.watch('planType');
  const selectedPlan = churchPlans.find(p => p.plan_type === selectedPlanType);

  const onSubmitForm = (data: ChurchSignupFormData) => {
    setFormData(data);
    setStep('payment');
  };

  const handlePaymentConfirmation = async () => {
    if (!formData || !selectedPlan) return;

    setLoading(true);
    try {
      // Create user account
      const { error: signUpError } = await signUp(
        formData.loginEmail,
        formData.password,
        formData.responsibleName
      );

      if (signUpError) {
        toast({
          title: 'Erro no cadastro',
          description: signUpError.message,
          variant: 'destructive'
        });
        return;
      }

      // Prepare church data
      const churchData = {
        church_name: formData.churchName,
        cnpj: formData.cnpj || null,
        cpf: formData.cpf || null,
        address: formData.address,
        responsible_name: formData.responsibleName,
        responsible_email: formData.responsibleEmail,
        responsible_phone: formData.responsiblePhone
      };

      // Create pending payment
      const payment = await createPendingPayment({
        planType: formData.planType,
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

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <ConfirmationCodeDisplay
          confirmationCode={confirmationCode}
          email={formData?.loginEmail || ''}
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
