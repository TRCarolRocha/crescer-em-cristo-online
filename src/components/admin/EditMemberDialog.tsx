
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getUserRoles, addRole, removeRole } from '@/utils/roleUtils';

interface Member {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  birth_date: string;
  department: string;
  ministry: string;
  tags: string[];
}

interface MinisterioDepartamento {
  id: string;
  nome: string;
}

interface EditMemberDialogProps {
  member: Member;
  ministeriosDepartamentos: MinisterioDepartamento[];
  onClose: () => void;
  onSuccess: () => void;
}

const EditMemberDialog: React.FC<EditMemberDialogProps> = ({ 
  member, 
  ministeriosDepartamentos, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    full_name: member.full_name || '',
    phone: member.phone || '',
    address: member.address || '',
    birth_date: member.birth_date || '',
    department: member.department || '',
    ministry: member.ministry || ''
  });
  const [selectedTags, setSelectedTags] = useState<string[]>(member.tags || []);
  const [isLider, setIsLider] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadRoles = async () => {
      const roles = await getUserRoles(member.id);
      setIsLider(roles.includes('lider'));
      setIsAdmin(roles.includes('admin'));
    };
    loadRoles();
  }, [member.id]);

  const handleTagChange = (tagId: string, checked: boolean) => {
    if (checked) {
      setSelectedTags([...selectedTags, tagId]);
    } else {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Salvando dados do membro:', {
        ...formData,
        tags: selectedTags
      });

      // Preparar os dados, garantindo que campos vazios sejam tratados corretamente
      const updateData = {
        full_name: formData.full_name.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        birth_date: formData.birth_date && formData.birth_date.trim() !== '' ? formData.birth_date : null,
        department: formData.department.trim() || null,
        ministry: formData.ministry.trim() || null,
        tags: selectedTags,
        updated_at: new Date().toISOString()
      };

      console.log('Dados preparados para atualização:', updateData);

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', member.id);

      if (error) {
        console.error('Erro detalhado ao atualizar membro:', error);
        throw error;
      }

      // Gerenciar roles (admin e lider) baseado nos checkboxes
      if (isAdmin) {
        await addRole(member.id, 'admin');
      } else {
        await removeRole(member.id, 'admin');
      }
      
      if (isLider) {
        await addRole(member.id, 'lider');
      } else {
        await removeRole(member.id, 'lider');
      }

      console.log('Membro atualizado com sucesso');
      toast({
        title: "Sucesso",
        description: "Membro atualizado com sucesso"
      });

      onSuccess();
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      toast({
        title: "Erro",
        description: `Não foi possível atualizar o membro: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Membro</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Deixe em branco se não souber a data</p>
            </div>
            <div>
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Ex: Diaconia, Louvor, Suporte"
              />
            </div>
          </div>

          {/* Checkboxes de Roles */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Permissões</Label>
            
            <div className="flex items-center space-x-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Checkbox
                id="is-admin"
                checked={isAdmin}
                onCheckedChange={(checked) => setIsAdmin(checked as boolean)}
              />
              <Label htmlFor="is-admin" className="font-medium cursor-pointer">
                Administrador da igreja (acesso total ao painel administrativo)
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Checkbox
                id="is-lider"
                checked={isLider}
                onCheckedChange={(checked) => setIsLider(checked as boolean)}
              />
              <Label htmlFor="is-lider" className="font-medium cursor-pointer">
                Líder (líder de célula, ministério ou departamento)
              </Label>
            </div>
          </div>

          <div>
            <Label htmlFor="ministry">Ministério</Label>
            <Input
              id="ministry"
              value={formData.ministry}
              onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
              placeholder="Ex: Música, Ensino, etc."
            />
          </div>

          {ministeriosDepartamentos.length > 0 && (
            <div>
              <Label>Tags de Ministério/Departamento</Label>
              <div className="grid grid-cols-3 gap-2 mt-2 max-h-40 overflow-y-auto">
                {ministeriosDepartamentos.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${item.id}`}
                      checked={selectedTags.includes(item.id)}
                      onCheckedChange={(checked) => handleTagChange(item.id, checked as boolean)}
                    />
                    <Label htmlFor={`tag-${item.id}`} className="text-sm">
                      {item.nome}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMemberDialog;
