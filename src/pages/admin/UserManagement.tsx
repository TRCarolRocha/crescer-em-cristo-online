import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, UserX, UserPlus, Download } from 'lucide-react';
import { useUsers, UserData } from '@/hooks/useUsers';
import { UserFilters } from '@/components/admin/UserFilters';
import { UserTable } from '@/components/admin/UserTable';
import { EditUserDialog } from '@/components/admin/EditUserDialog';
import { supabase } from '@/integrations/supabase/client';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [churchId, setChurchId] = useState('all');
  const [planType, setPlanType] = useState('all');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [churches, setChurches] = useState<Array<{ id: string; name: string }>>([]);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: users, isLoading } = useUsers({
    searchTerm,
    churchId: churchId === 'all' ? undefined : churchId,
    planType: planType === 'all' ? undefined : planType,
    role: role === 'all' ? undefined : role,
    status: status === 'all' ? undefined : status,
  });

  useEffect(() => {
    fetchChurches();
  }, []);

  const fetchChurches = async () => {
    const { data, error } = await supabase
      .from('churches')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      setChurches(data);
    }
  };

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    setEditDialogOpen(true);
  };

  const handleExportCSV = () => {
    if (!users) return;

    const csvHeaders = ['Nome', 'E-mail', 'Igreja', 'Plano', 'Roles', 'Status', 'Data de Cadastro'];
    const csvRows = users.map(user => [
      user.full_name || '',
      user.email,
      user.church_name || '',
      user.plan_type,
      user.roles.join(', '),
      user.subscription_status,
      new Date(user.created_at).toLocaleDateString('pt-BR'),
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const stats = {
    total: users?.length || 0,
    active: users?.filter(u => u.subscription_status === 'active').length || 0,
    free: users?.filter(u => u.plan_type === 'free').length || 0,
    recent: users?.filter(u => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(u.created_at) > thirtyDaysAgo;
    }).length || 0,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Visualize e gerencie todos os usuários da plataforma
          </p>
        </div>
        <Button onClick={handleExportCSV} disabled={!users || users.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planos Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Free</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.free}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos (30 dias)</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <UserFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            churchId={churchId}
            onChurchChange={setChurchId}
            planType={planType}
            onPlanTypeChange={setPlanType}
            role={role}
            onRoleChange={setRole}
            status={status}
            onStatusChange={setStatus}
            churches={churches}
          />
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({users?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <UserTable users={users || []} onEdit={handleEdit} />
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditUserDialog
        user={editingUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        churches={churches}
      />
    </div>
  );
};

export default UserManagement;
