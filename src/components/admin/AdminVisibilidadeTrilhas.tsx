import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Eye, Settings, Users, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DIAGNOSTIC_LEVELS } from '@/utils/diagnosticLevels';

interface Track {
  id: string;
  title: string;
  description: string;
  level: string;
  allowed_levels: string[];
  allowed_groups: string[];
}

interface MemberGroup {
  id: string;
  name: string;
}


const AdminVisibilidadeTrilhas = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [groups, setGroups] = useState<MemberGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchTracks();
    fetchGroups();
  }, []);

  const fetchTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('discipleship_tracks')
        .select('*')
        .order('title');

      if (error) throw error;
      setTracks(data || []);
    } catch (error) {
      console.error('Erro ao carregar trilhas:', error);
      toast.error('Erro ao carregar trilhas');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('member_groups')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  const handleUpdateTrackVisibility = async () => {
    if (!editingTrack) return;

    try {
      const { error } = await supabase
        .from('discipleship_tracks')
        .update({
          allowed_levels: editingTrack.allowed_levels,
          allowed_groups: editingTrack.allowed_groups
        })
        .eq('id', editingTrack.id);

      if (error) throw error;

      toast.success('Visibilidade da trilha atualizada com sucesso');
      setDialogOpen(false);
      setEditingTrack(null);
      fetchTracks();
    } catch (error) {
      console.error('Erro ao atualizar visibilidade:', error);
      toast.error('Erro ao atualizar visibilidade da trilha');
    }
  };

  const handleLevelChange = (level: string, checked: boolean) => {
    if (!editingTrack) return;

    setEditingTrack(prev => {
      if (!prev) return null;
      
      const newLevels = checked
        ? [...prev.allowed_levels, level]
        : prev.allowed_levels.filter(l => l !== level);

      return { ...prev, allowed_levels: newLevels };
    });
  };

  const handleGroupChange = (groupId: string, checked: boolean) => {
    if (!editingTrack) return;

    setEditingTrack(prev => {
      if (!prev) return null;
      
      const newGroups = checked
        ? [...prev.allowed_groups, groupId]
        : prev.allowed_groups.filter(g => g !== groupId);

      return { ...prev, allowed_groups: newGroups };
    });
  };

  const getLevelBadges = (track: Track) => {
    if (!track.allowed_levels || track.allowed_levels.length === 0) {
      return <Badge variant="outline">Todos os níveis</Badge>;
    }

    return track.allowed_levels.map(level => {
      const levelInfo = DIAGNOSTIC_LEVELS.find(l => l.value === level);
      return (
        <Badge key={level} variant="secondary" className="mr-1">
          {levelInfo?.label || level}
        </Badge>
      );
    });
  };

  const getGroupBadges = (track: Track) => {
    if (!track.allowed_groups || track.allowed_groups.length === 0) {
      return <Badge variant="outline">Nenhum grupo específico</Badge>;
    }

    return track.allowed_groups.map(groupId => {
      const group = groups.find(g => g.id === groupId);
      return (
        <Badge key={groupId} variant="secondary" className="mr-1">
          <Users className="h-3 w-3 mr-1" />
          {group?.name || 'Grupo não encontrado'}
        </Badge>
      );
    });
  };

  const openEditDialog = (track: Track) => {
    setEditingTrack({
      ...track,
      allowed_levels: track.allowed_levels || [],
      allowed_groups: track.allowed_groups || []
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-center">
          <Eye className="h-8 w-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Carregando trilhas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Visibilidade das Trilhas</h2>
          <p className="text-gray-600">Configure quais níveis de diagnóstico e grupos podem ver cada trilha</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {tracks.map((track) => (
          <Card key={track.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{track.title}</CardTitle>
                  <p className="text-sm text-gray-600 mb-4">{track.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Níveis Permitidos:
                      </Label>
                      <div className="mt-1">
                        {getLevelBadges(track)}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Grupos Permitidos:
                      </Label>
                      <div className="mt-1">
                        {getGroupBadges(track)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(track)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Edit Visibility Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Configurar Visibilidade - {editingTrack?.title}
            </DialogTitle>
          </DialogHeader>
          
          {editingTrack && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Níveis de Diagnóstico</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Selecione quais níveis de diagnóstico espiritual podem ver esta trilha
                </p>
                <div className="space-y-2">
                  {DIAGNOSTIC_LEVELS.map((level) => (
                    <div key={level.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`level-${level.value}`}
                        checked={editingTrack.allowed_levels.includes(level.value)}
                        onCheckedChange={(checked) => handleLevelChange(level.value, checked as boolean)}
                      />
                      <Label htmlFor={`level-${level.value}`} className="text-sm">
                        {level.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {editingTrack.allowed_levels.length === 0 && (
                  <p className="text-xs text-blue-600 mt-2">
                    ℹ️ Nenhum nível selecionado = visível para todos os níveis
                  </p>
                )}
              </div>

              <div>
                <Label className="text-base font-medium">Grupos Específicos</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Selecione grupos específicos que devem ter acesso a esta trilha (opcional)
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {groups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={editingTrack.allowed_groups.includes(group.id)}
                        onCheckedChange={(checked) => handleGroupChange(group.id, checked as boolean)}
                      />
                      <Label htmlFor={`group-${group.id}`} className="text-sm">
                        {group.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {groups.length === 0 && (
                  <p className="text-sm text-gray-500">Nenhum grupo disponível</p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Lógica de Visibilidade</h4>
                <p className="text-sm text-blue-800">
                  A trilha será visível se o usuário atender a <strong>pelo menos uma</strong> das condições:
                </p>
                <ul className="text-sm text-blue-800 mt-2 list-disc list-inside">
                  <li>Seu nível de diagnóstico está nos "Níveis Permitidos"</li>
                  <li>Ele faz parte de algum dos "Grupos Específicos"</li>
                  <li>Se nenhuma restrição estiver definida, será visível para todos</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateTrackVisibility}>
                  Salvar Configurações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVisibilidadeTrilhas;