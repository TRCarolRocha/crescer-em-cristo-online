import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Edit, Trash2, UserPlus, UserMinus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MemberGroup {
  id: string;
  name: string;
  description: string;
  created_at: string;
  _count?: { members: number };
}

interface GroupMember {
  id: string;
  user_id: string;
  profiles: {
    full_name: string;
  };
}

interface Profile {
  id: string;
  full_name: string;
}

const AdminGrupos = () => {
  const [groups, setGroups] = useState<MemberGroup[]>([]);
  const [groupMembers, setGroupMembers] = useState<{ [key: string]: GroupMember[] }>({});
  const [availableProfiles, setAvailableProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [editingGroup, setEditingGroup] = useState<MemberGroup | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchGroups();
    fetchProfiles();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('member_groups')
        .select('*')
        .order('name');

      if (error) throw error;

      // Fetch member counts for each group
      const groupsWithCounts = await Promise.all(
        (data || []).map(async (group) => {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          return {
            ...group,
            _count: { members: count || 0 }
          };
        })
      );

      setGroups(groupsWithCounts);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast.error('Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');

      if (error) throw error;
      setAvailableProfiles(data || []);
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
    }
  };

  const fetchGroupMembers = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          id,
          user_id
        `)
        .eq('group_id', groupId);

      if (error) throw error;

      // Fetch profile data for each member
      if (data && data.length > 0) {
        const userIds = data.map(member => member.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        const membersWithProfiles = data.map(member => ({
          ...member,
          profiles: profiles?.find(p => p.id === member.user_id) || { full_name: 'Sem nome' }
        }));

        setGroupMembers(prev => ({
          ...prev,
          [groupId]: membersWithProfiles
        }));
      } else {
        setGroupMembers(prev => ({
          ...prev,
          [groupId]: []
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar membros do grupo:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) {
      toast.error('Nome do grupo é obrigatório');
      return;
    }

    try {
      const { error } = await supabase
        .from('member_groups')
        .insert({
          name: newGroup.name,
          description: newGroup.description,
          created_by: user?.id
        });

      if (error) throw error;

      toast.success('Grupo criado com sucesso');
      setCreateDialogOpen(false);
      setNewGroup({ name: '', description: '' });
      fetchGroups();
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      toast.error('Erro ao criar grupo');
    }
  };

  const handleEditGroup = async () => {
    if (!editingGroup || !editingGroup.name.trim()) {
      toast.error('Nome do grupo é obrigatório');
      return;
    }

    try {
      const { error } = await supabase
        .from('member_groups')
        .update({
          name: editingGroup.name,
          description: editingGroup.description
        })
        .eq('id', editingGroup.id);

      if (error) throw error;

      toast.success('Grupo atualizado com sucesso');
      setEditDialogOpen(false);
      setEditingGroup(null);
      fetchGroups();
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      toast.error('Erro ao atualizar grupo');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      // First remove all members
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId);

      // Then delete the group
      const { error } = await supabase
        .from('member_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      toast.success('Grupo excluído com sucesso');
      fetchGroups();
    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      toast.error('Erro ao excluir grupo');
    }
  };

  const handleAddMember = async (groupId: string, userId: string) => {
    try {
      // Check if member already exists in group
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingMember) {
        toast.error('Este membro já faz parte do grupo');
        return;
      }

      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId
        });

      if (error) throw error;

      toast.success('Membro adicionado ao grupo');
      fetchGroupMembers(groupId);
      fetchGroups(); // Update member count
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      toast.error('Erro ao adicionar membro ao grupo');
    }
  };

  const handleRemoveMember = async (memberId: string, groupId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Membro removido do grupo');
      fetchGroupMembers(groupId);
      fetchGroups(); // Update member count
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      toast.error('Erro ao remover membro do grupo');
    }
  };

  const openMembersDialog = (groupId: string) => {
    setSelectedGroup(groupId);
    fetchGroupMembers(groupId);
    setMembersDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-center">
          <Users className="h-8 w-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Carregando grupos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Grupos</h2>
          <p className="text-gray-600">Crie e gerencie grupos de membros para organizar trilhas personalizadas</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Grupo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Grupo</Label>
                <Input
                  id="name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Novos Convertidos"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o propósito deste grupo..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateGroup}>
                  Criar Grupo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      {group._count?.members || 0} membros
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingGroup(group);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {group.description || 'Sem descrição'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openMembersDialog(group.id)}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Gerenciar Membros
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Group Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Grupo</DialogTitle>
          </DialogHeader>
          {editingGroup && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome do Grupo</Label>
                <Input
                  id="edit-name"
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editingGroup.description || ''}
                  onChange={(e) => setEditingGroup(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleEditGroup}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Members Management Dialog */}
      <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Gerenciar Membros - {groups.find(g => g.id === selectedGroup)?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Add Member Section */}
            <div>
              <Label>Adicionar Membro</Label>
              <div className="flex gap-2 mt-2">
                <Select onValueChange={(userId) => {
                  if (selectedGroup) {
                    handleAddMember(selectedGroup, userId);
                  }
                }}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione um membro..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProfiles
                      .filter(profile => 
                        !groupMembers[selectedGroup || '']?.some(member => member.user_id === profile.id)
                      )
                      .map(profile => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.full_name || 'Sem nome'}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Current Members */}
            <div>
              <Label>Membros Atuais</Label>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {selectedGroup && groupMembers[selectedGroup]?.length > 0 ? (
                  groupMembers[selectedGroup].map((member) => (
                    <div key={member.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{member.profiles.full_name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id, selectedGroup)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Nenhum membro no grupo</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGrupos;