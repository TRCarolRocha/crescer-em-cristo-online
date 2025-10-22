import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  churchId: string;
  onChurchChange: (value: string) => void;
  planType: string;
  onPlanTypeChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  churches: Array<{ id: string; name: string }>;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  searchTerm,
  onSearchChange,
  churchId,
  onChurchChange,
  planType,
  onPlanTypeChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  churches,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={churchId} onValueChange={onChurchChange}>
        <SelectTrigger>
          <SelectValue placeholder="Todas as igrejas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as igrejas</SelectItem>
          {churches.map((church) => (
            <SelectItem key={church.id} value={church.id}>
              {church.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={planType} onValueChange={onPlanTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Todos os planos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os planos</SelectItem>
          <SelectItem value="free">Free</SelectItem>
          <SelectItem value="individual">Individual</SelectItem>
          <SelectItem value="church_simple">Church Simple</SelectItem>
          <SelectItem value="church_plus">Church Plus</SelectItem>
          <SelectItem value="church_premium">Church Premium</SelectItem>
        </SelectContent>
      </Select>

      <Select value={role} onValueChange={onRoleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Todas as roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as roles</SelectItem>
          <SelectItem value="super_admin">Super Admin</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="lider">Líder</SelectItem>
          <SelectItem value="member">Membro</SelectItem>
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Todos os status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="active">Ativo</SelectItem>
          <SelectItem value="inactive">Inativo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
