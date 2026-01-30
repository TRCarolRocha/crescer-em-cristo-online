import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  Settings, 
  UserPlus, 
  BookOpen, 
  ArrowLeft,
  Copy,
  Trash2,
  Calendar
} from 'lucide-react';
import { useSmallGroup } from '@/hooks/useSmallGroup';
import { useAuth } from '@/contexts/AuthContext';
import { CreateSmallGroupDialog } from '@/components/groups/CreateSmallGroupDialog';
import { SmallGroupMembers } from '@/components/groups/SmallGroupMembers';
import { InviteMemberDialog } from '@/components/groups/InviteMemberDialog';
import { AssignTrackDialog } from '@/components/groups/AssignTrackDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const MeuGrupo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [assignTrackDialogOpen, setAssignTrackDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trackToRemove, setTrackToRemove] = useState<string | null>(null);

  const {
    myGroup,
    myGroupLoading,
    members,
    membersLoading,
    tracks,
    tracksLoading,
    createGroup,
    deleteGroup,
    removeMember,
    updateMemberRole,
    assignTrack,
    removeTrack,
    canCreateGroup,
    memberLimit
  } = useSmallGroup();

  const handleCreateGroup = async (data: { name: string; description?: string }) => {
    await createGroup.mutateAsync(data);
  };

  const handleAssignTrack = async (trackId: string, dueDate?: string) => {
    if (!myGroup) return;
    await assignTrack.mutateAsync({ groupId: myGroup.id, trackId, dueDate });
  };

  const handleRemoveTrack = async () => {
    if (!trackToRemove) return;
    await removeTrack.mutateAsync(trackToRemove);
    setTrackToRemove(null);
  };

  const handleDeleteGroup = async () => {
    if (!myGroup) return;
    await deleteGroup.mutateAsync(myGroup.id);
    setDeleteDialogOpen(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Loading state
  if (myGroupLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Sem grupo criado
  if (!myGroup) {
    return (
      <>
        <CreateSmallGroupDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreate={handleCreateGroup}
          isLoading={createGroup.isPending}
          memberLimit={memberLimit}
        />

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="max-w-2xl mx-auto px-4 py-8">
            <Button onClick={() => navigate(-1)} variant="outline" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <Card className="text-center p-8">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Meu Grupo</h1>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Crie seu grupo de estudo e acompanhe o progresso espiritual de até {memberLimit} pessoas
              </p>

              {canCreateGroup ? (
                <Button 
                  onClick={() => setCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Meu Grupo
                </Button>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Esta funcionalidade está disponível no plano <strong>Hodos Guia</strong>
                  </p>
                  <Button onClick={() => navigate('/planos')}>
                    Ver Planos
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </>
    );
  }

  // Com grupo criado
  return (
    <>
      <CreateSmallGroupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreateGroup}
        isLoading={createGroup.isPending}
        memberLimit={memberLimit}
      />
      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        inviteCode={myGroup.invite_code}
        groupName={myGroup.name}
      />
      <AssignTrackDialog
        open={assignTrackDialogOpen}
        onOpenChange={setAssignTrackDialogOpen}
        onAssign={handleAssignTrack}
        isLoading={assignTrack.isPending}
        assignedTrackIds={tracks.map(t => t.track_id)}
      />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir grupo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os membros serão removidos e as trilhas atribuídas serão desvinculadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteGroup}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!trackToRemove} onOpenChange={(open) => !open && setTrackToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover trilha?</AlertDialogTitle>
            <AlertDialogDescription>
              A trilha será removida do grupo. O progresso dos membros será mantido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveTrack}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={() => navigate(-1)} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>

          {/* Group Info Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{myGroup.name}</h1>
                    {myGroup.description && (
                      <p className="text-muted-foreground mt-1">{myGroup.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="bg-teal-500/10 text-teal-600 border-teal-500/30">
                        {members.length}/{myGroup.max_members} membros
                      </Badge>
                      <Badge variant="outline">
                        Código: {myGroup.invite_code.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setInviteDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Convidar
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="members" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Membros ({members.length})
              </TabsTrigger>
              <TabsTrigger value="tracks" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Trilhas ({tracks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members">
              <SmallGroupMembers
                members={members}
                isLeader={true}
                currentUserId={user?.id || ''}
                onRemoveMember={(userId) => removeMember.mutate({ groupId: myGroup.id, userId })}
                onUpdateRole={(memberId, role) => updateMemberRole.mutate({ memberId, role })}
              />
            </TabsContent>

            <TabsContent value="tracks">
              <div className="space-y-4">
                <Button 
                  onClick={() => setAssignTrackDialogOpen(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Atribuir Nova Trilha
                </Button>

                {tracks.length === 0 ? (
                  <Card className="p-8 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhuma trilha atribuída</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Atribua trilhas para o grupo estudar juntos
                    </p>
                  </Card>
                ) : (
                  <div className="grid gap-3">
                    {tracks.map((trackAssignment) => (
                      <Card key={trackAssignment.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{trackAssignment.track?.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {trackAssignment.track?.level}
                                </Badge>
                                {trackAssignment.due_date && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Prazo: {formatDate(trackAssignment.due_date)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setTrackToRemove(trackAssignment.id)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default MeuGrupo;
