import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApprovePaymentDialog } from '@/components/admin/ApprovePaymentDialog';
import { RejectPaymentDialog } from '@/components/admin/RejectPaymentDialog';
import { CheckCircle2, XCircle, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'all';

interface PendingPaymentWithDetails {
  id: string;
  plan_type: string;
  user_id: string;
  amount: number;
  status: string;
  confirmation_code: string;
  payment_method: string;
  church_data: any;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  profiles: {
    full_name: string;
  } | null;
  email?: string;
}

export default function PendingPayments() {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>('pending');
  const [selectedPayment, setSelectedPayment] = useState<PendingPaymentWithDetails | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const { data: payments, isLoading, refetch } = useQuery({
    queryKey: ['pending-payments', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('pending_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get profiles
      const paymentsWithProfiles = await Promise.all(
        (data || []).map(async (payment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', payment.user_id)
            .maybeSingle();
          
          return {
            ...payment,
            profiles: profile,
            email: null, // Will be filled by edge function
          };
        })
      );

      // Fetch emails via edge function (server-side with service role)
      const userIds = paymentsWithProfiles.map(p => p.user_id);
      try {
        const { data: emailData, error: emailError } = await supabase.functions.invoke('admin-get-user-emails', {
          body: { userIds }
        });

        if (!emailError && emailData?.users) {
          const emailMap = new Map(emailData.users.map((u: any) => [u.user_id, u.email]));
          
          return paymentsWithProfiles.map(payment => ({
            ...payment,
            email: emailMap.get(payment.user_id) || 'N/A'
          })) as PendingPaymentWithDetails[];
        }
      } catch (err) {
        console.error('Error fetching emails:', err);
      }

      return paymentsWithProfiles as PendingPaymentWithDetails[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleApprove = (payment: PendingPaymentWithDetails) => {
    setSelectedPayment(payment);
    setApproveDialogOpen(true);
  };

  const handleReject = (payment: PendingPaymentWithDetails) => {
    setSelectedPayment(payment);
    setRejectDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeitado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanTypeName = (planType: string) => {
    const names: Record<string, string> = {
      individual: 'Individual',
      church_simple: 'Igreja Simples',
      church_plus: 'Igreja Plus',
      church_premium: 'Igreja Premium',
    };
    return names[planType] || planType;
  };

  const pendingCount = payments?.filter((p) => p.status === 'pending').length || 0;

  return (
    <PageContainer>
      <PageHeader title="Pagamentos Pendentes" />
      <p className="text-muted-foreground mb-6">Gerencie aprovações e rejeições de assinaturas</p>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pendente</p>
              <p className="text-2xl font-bold">
                R$ {payments
                  ?.filter((p) => p.status === 'pending')
                  .reduce((acc, p) => acc + Number(p.amount), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Lista de Pagamentos</h3>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PaymentStatus)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="rejected">Rejeitados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : payments && payments.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs">{payment.confirmation_code}</TableCell>
                    <TableCell>{getPlanTypeName(payment.plan_type)}</TableCell>
                    <TableCell>{payment.profiles?.full_name || 'N/A'}</TableCell>
                    <TableCell className="text-xs">{payment.email || 'N/A'}</TableCell>
                    <TableCell className="font-semibold">
                      R$ {Number(payment.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {payment.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(payment)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(payment)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      )}
                      {payment.status === 'rejected' && payment.rejection_reason && (
                        <p className="text-xs text-muted-foreground">
                          Motivo: {payment.rejection_reason}
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum pagamento encontrado para o filtro selecionado.
          </div>
        )}
      </Card>

      {selectedPayment && (
        <>
          <ApprovePaymentDialog
            open={approveDialogOpen}
            onOpenChange={setApproveDialogOpen}
            payment={selectedPayment}
            onSuccess={() => {
              refetch();
              setApproveDialogOpen(false);
              setSelectedPayment(null);
            }}
          />
          <RejectPaymentDialog
            open={rejectDialogOpen}
            onOpenChange={setRejectDialogOpen}
            payment={selectedPayment}
            onSuccess={() => {
              refetch();
              setRejectDialogOpen(false);
              setSelectedPayment(null);
            }}
          />
        </>
      )}
    </PageContainer>
  );
}
