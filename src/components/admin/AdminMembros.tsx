
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, UserX, UserCheck, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EditMemberDialog from './EditMemberDialog';
import TagBadge from '@/components/TagBadge';
import { getTagColor, getTagName } from '@/utils/tagUtils';

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
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {member.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{member.full_name || 'Nome não informado'}</h3>
                    <p className="text-gray-600">{member.phone || 'Telefone não informado'}</p>
                    <p className="text-gray-500 text-sm">{member.address || 'Endereço não informado'}</p>
                    
                    {/* Tags de ministérios/departamentos */}
                    <div className="mt-2 flex flex-wrap">
                      {member.department && (
                        <TagBadge 
                          tagName={member.department} 
                          color={getTagColor(member.department)}
                        />
                      )}
                      {member.ministry && (
                        <TagBadge 
                          tagName={member.ministry} 
                          color={getTagColor(member.ministry)}
                        />
                      )}
                      {member.tags?.map((tagId) => (
                        <TagBadge
                          key={tagId}
                          tagName={getTagName(tagId, ministeriosDepartamentos)}
                          color={getTagColor(getTagName(tagId, ministeriosDepartamentos))}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                    {member.role === 'admin' ? 'Administrador' : 'Membro'}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingMember(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
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
