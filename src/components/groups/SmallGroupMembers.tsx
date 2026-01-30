import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, UserMinus, Shield, User } from 'lucide-react';
import { SmallGroupMember } from '@/hooks/useSmallGroup';

interface SmallGroupMembersProps {
  members: SmallGroupMember[];
  isLeader: boolean;
  currentUserId: string;
  onRemoveMember?: (userId: string) => void;
  onUpdateRole?: (memberId: string, role: 'member' | 'co-leader') => void;
}

export const SmallGroupMembers = ({
  members,
  isLeader,
  currentUserId,
  onRemoveMember,
  onUpdateRole
}: SmallGroupMembersProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (members.length === 0) {
    return (
      <Card className="p-8 text-center">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Nenhum membro no grupo ainda</p>
        <p className="text-sm text-muted-foreground mt-1">
          Compartilhe o código de convite para adicionar membros
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {members.map((member) => (
        <Card key={member.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.profile?.avatar_url || ''} />
                <AvatarFallback>
                  {member.profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">
                    {member.profile?.full_name || 'Usuário'}
                  </p>
                  {member.role === 'co-leader' && (
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30">
                      <Shield className="h-3 w-3 mr-1" />
                      Co-líder
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Entrou em {formatDate(member.joined_at)}
                </p>
              </div>

              {isLeader && member.user_id !== currentUserId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {member.role === 'member' ? (
                      <DropdownMenuItem onClick={() => onUpdateRole?.(member.id, 'co-leader')}>
                        <Shield className="h-4 w-4 mr-2" />
                        Promover a Co-líder
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onUpdateRole?.(member.id, 'member')}>
                        <User className="h-4 w-4 mr-2" />
                        Remover função de Co-líder
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => onRemoveMember?.(member.user_id)}
                      className="text-red-600"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remover do grupo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
