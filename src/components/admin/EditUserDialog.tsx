import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useUpdateUser } from '@/hooks/useUpdateUser';
import { UserData } from '@/hooks/useUsers';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Calendar, CreditCard, Plus, Trash2 } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useCreateSubscription } from '@/hooks/useCreateSubscription';
import { useCancelSubscription } from '@/hooks/useCancelSubscription';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type AppRole = Database['public']['Enums']['app_role'];

interface EditUserDialogProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  churches: Array<{ id: string; name: string }>;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  user,
  open,
  onOpenChange,
  churches,
}) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    birth_date: '',
    church_id: '',
  });
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    plan_id: '',
    expires_at: '',
    status: 'active' as 'active' | 'pending' | 'expired' | 'cancelled',
  });

  const { mutate: updateUser, isPending } = useUpdateUser();
  const { plans } = useSubscriptionPlans();
  const { mutate: createSubscription, isPending: isCreating } = useCreateSubscription();
  const { mutate: cancelSubscription, isPending: isCanceling } = useCancelSubscription();

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        address: user.address || '',
        birth_date: user.birth_date || '',
        church_id: user.church_id || '',
      });
      setSelectedRoles(user.roles as AppRole[]);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    updateUser({
      userId: user.id,
      ...formData,
      church_id: formData.church_id === 'none' ? null : (formData.church_id || null),
      roles: selectedRoles,
    });

    onOpenChange(false);
  };

  const toggleRole = (role: AppRole) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleCreateSubscription = () => {
    if (!user || !newSubscription.plan_id) return;

    createSubscription(
      {
        userId: user.id,
        planId: newSubscription.plan_id,
        expiresAt: newSubscription.expires_at || undefined,
        status: newSubscription.status,
      },
      {
        onSuccess: () => {
          setShowSubscriptionForm(false);
          setNewSubscription({ plan_id: '', expires_at: '', status: 'active' });
        },
      }
    );
  };

  const handleCancelSubscription = () => {
    if (!user?.individual_subscription_id) return;
    if (!confirm('Tem certeza que deseja cancelar esta assinatura?')) return;

    cancelSubscription({
      userId: user.id,
      subscriptionId: user.individual_subscription_id,
    });
  };

  const availableRoles: AppRole[] = ['admin', 'lider', 'member'];
  const individualPlans = plans?.filter(p => p.plan_type === 'individual') || [];

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info Display */}
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-semibold">
                {user.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-semibold">{user.full_name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              <Badge variant="outline">{user.plan_type}</Badge>
              {user.church_name && <Badge variant="secondary">{user.church_name}</Badge>}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="church_id">Igreja</Label>
              <Select
                value={formData.church_id || 'none'}
                onValueChange={(value) => setFormData({ ...formData, church_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar igreja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {churches.map((church) => (
                    <SelectItem key={church.id} value={church.id}>
                      {church.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {/* Roles */}
          <div className="space-y-3">
            <Label>Permissões (Roles)</Label>
            <div className="space-y-2">
              {availableRoles.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={role}
                    checked={selectedRoles.includes(role)}
                    onCheckedChange={() => toggleRole(role)}
                  />
                  <label
                    htmlFor={role}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {role === 'admin' && 'Administrador'}
                    {role === 'lider' && 'Líder'}
                    {role === 'member' && 'Membro'}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Subscription Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Gerenciamento de Plano
              </CardTitle>
              <CardDescription>
                Crie ou gerencie assinaturas individuais para este usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Status */}
              <div className="space-y-2">
                <Label>Status Atual</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{user.plan_type}</Badge>
                  {user.church_name && (
                    <Badge variant="secondary">Via {user.church_name}</Badge>
                  )}
                  <Badge variant={user.subscription_status === 'active' ? 'default' : 'destructive'}>
                    {user.subscription_status}
                  </Badge>
                </div>
                {user.individual_expires_at && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Expira em: {format(new Date(user.individual_expires_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                )}
              </div>

              {/* Individual Subscription Info */}
              {user.individual_subscription_id ? (
                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Assinatura Individual Ativa</p>
                      {user.individual_plan_name && (
                        <p className="text-sm text-muted-foreground">{user.individual_plan_name}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Status: {user.individual_subscription_status}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleCancelSubscription}
                      disabled={isCanceling}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {!showSubscriptionForm ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowSubscriptionForm(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Nova Assinatura Individual
                    </Button>
                  ) : (
                    <div className="space-y-3 p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Label>Plano Individual</Label>
                        <Select
                          value={newSubscription.plan_id}
                          onValueChange={(value) => setNewSubscription({ ...newSubscription, plan_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar plano" />
                          </SelectTrigger>
                          <SelectContent>
                            {individualPlans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.name} - R$ {plan.price_monthly}/mês
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Data de Expiração (Opcional)</Label>
                        <Input
                          type="date"
                          value={newSubscription.expires_at}
                          onChange={(e) => setNewSubscription({ ...newSubscription, expires_at: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Deixe em branco para assinatura sem expiração
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={newSubscription.status}
                          onValueChange={(value: any) => setNewSubscription({ ...newSubscription, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="expired">Expirado</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setShowSubscriptionForm(false);
                            setNewSubscription({ plan_id: '', expires_at: '', status: 'active' });
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={handleCreateSubscription}
                          disabled={!newSubscription.plan_id || isCreating}
                        >
                          {isCreating ? 'Criando...' : 'Criar Assinatura'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {user.church_name && user.plan_type.startsWith('church') && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        Este usuário já tem acesso através da igreja <strong>{user.church_name}</strong>. 
                        Criar uma assinatura individual substituirá o acesso da igreja.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
