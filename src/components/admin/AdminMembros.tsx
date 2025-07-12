
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EditMemberDialog from './EditMemberDialog';
import { getTagName } from '@/utils/tagUtils';

interface Member {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  role: string;
  avatar_url: string;
  birth_date: string;
  department: string;
  ministry: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface MinisterioDepartamento {
  id: string;
  nome: string;
}

const AdminMembros = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingInline, setEditingInline] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Member>>({});
  const [ministeriosDepartamentos, setMinisteriosDepartamentos] = useState<MinisterioDepartamento[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
    fetchMinisteriosDepartamentos();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os membros",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMinisteriosDepartamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('ministerios_departamentos')
        .select('*')
        .order('nome');

      if (error) throw error;
      setMinisteriosDepartamentos(data || []);
    } catch (error) {
      console.error('Erro ao buscar ministérios:', error);
    }
  };

  const handleInlineEdit = (member: Member) => {
    setEditingInline(member.id);
    setEditData(member);
  };

  const handleCancelEdit = () => {
    setEditingInline(null);
    setEditData({});
  };

  const handleSaveInline = async (memberId: string) => {
    try {
      console.log('Salvando membro:', memberId, 'com dados:', editData);

      const updateData = {
        full_name: editData.full_name,
        phone: editData.phone,
        address: editData.address,
        department: editData.department,
        ministry: editData.ministry,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', memberId)
        .select();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Membro atualizado com sucesso:', data);

      toast({
        title: "Sucesso",
        description: "Dados do membro atualizados com sucesso"
      });

      setEditingInline(null);
      setEditData({});
      await fetchMembers();
    } catch (error) {
      console.error('Erro ao salvar membro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive"
      });
    }
  };

  const generateTagColor = (tagName: string) => {
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
      hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800'
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const filteredMembers = members.filter(member =>
    member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Membros</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou função..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredMembers.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {member.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    {editingInline === member.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editData.full_name || ''}
                          onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                          placeholder="Nome completo"
                        />
                        <Input
                          value={editData.phone || ''}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          placeholder="Telefone"
                        />
                        <Input
                          value={editData.address || ''}
                          onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                          placeholder="Endereço"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={editData.department || ''}
                            onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                            placeholder="Departamento"
                          />
                          <Input
                            value={editData.ministry || ''}
                            onChange={(e) => setEditData({ ...editData, ministry: e.target.value })}
                            placeholder="Ministério"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-lg">{member.full_name || 'Nome não informado'}</h3>
                        <p className="text-gray-600">{member.phone || 'Telefone não informado'}</p>
                        <p className="text-gray-500 text-sm">{member.address || 'Endereço não informado'}</p>
                        
                        <div className="mt-2 flex flex-wrap gap-1">
                          {member.department && (
                            <Badge className={generateTagColor(member.department)}>
                              {member.department}
                            </Badge>
                          )}
                          {member.ministry && (
                            <Badge className={generateTagColor(member.ministry)}>
                              {member.ministry}
                            </Badge>
                          )}
                          {member.tags?.map((tagId) => {
                            const tagName = getTagName(tagId, ministeriosDepartamentos);
                            return (
                              <Badge
                                key={tagId}
                                className={generateTagColor(tagName)}
                              >
                                {tagName}
                              </Badge>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                    {member.role === 'admin' ? 'Administrador' : 'Membro'}
                  </Badge>
                  <div className="flex gap-2">
                    {editingInline === member.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSaveInline(member.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInlineEdit(member)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingMember && (
        <EditMemberDialog
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSuccess={() => {
            fetchMembers();
            setEditingMember(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminMembros;
