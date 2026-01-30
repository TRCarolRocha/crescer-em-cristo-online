import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, CheckCheck, Reply } from 'lucide-react';
import { SupportMessage } from '@/hooks/useSupportMessages';

interface SupportMessageCardProps {
  message: SupportMessage;
  onReply?: (message: SupportMessage) => void;
  onMarkAsRead?: (messageId: string) => void;
  isAdmin?: boolean;
}

export const SupportMessageCard = ({
  message,
  onReply,
  onMarkAsRead,
  isAdmin = false
}: SupportMessageCardProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = () => {
    if (message.replied_at) {
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
          <CheckCheck className="h-3 w-3 mr-1" />
          Respondida
        </Badge>
      );
    }
    if (message.read_at) {
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
          <CheckCheck className="h-3 w-3 mr-1" />
          Lida
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
        <Clock className="h-3 w-3 mr-1" />
        Nova
      </Badge>
    );
  };

  const handleCardClick = () => {
    if (isAdmin && !message.read_at && onMarkAsRead) {
      onMarkAsRead(message.id);
    }
  };

  return (
    <Card 
      className={`transition-all hover:shadow-md ${!message.read_at && isAdmin ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {isAdmin && message.remetente && (
              <Avatar className="h-10 w-10">
                <AvatarImage src={message.remetente.avatar_url || ''} />
                <AvatarFallback>
                  {message.remetente.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              {isAdmin && message.remetente && (
                <p className="font-semibold text-sm">{message.remetente.full_name}</p>
              )}
              <p className="text-xs text-muted-foreground">{formatDate(message.enviada_em)}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
        {message.subject && (
          <h4 className="font-semibold text-base mt-2">{message.subject}</h4>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{message.conteudo}</p>

        {/* Respostas */}
        {message.replies && message.replies.length > 0 && (
          <div className="border-l-2 border-primary/30 pl-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Respostas:</p>
            {message.replies.map((reply) => (
              <div key={reply.id} className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm">{reply.conteudo}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(reply.enviada_em)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Ações */}
        {isAdmin && onReply && (
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onReply(message);
              }}
            >
              <Reply className="h-4 w-4 mr-1" />
              Responder
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
