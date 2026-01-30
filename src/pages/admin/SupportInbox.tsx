import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Search, 
  Inbox, 
  CheckCheck, 
  Clock,
  RefreshCw
} from 'lucide-react';
import { useSupportMessages, SupportMessage } from '@/hooks/useSupportMessages';
import { SupportMessageCard } from '@/components/support/SupportMessageCard';
import { ReplyDialog } from '@/components/support/ReplyDialog';

const SupportInbox = () => {
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);

  const { 
    allMessages, 
    allMessagesLoading, 
    refetchAllMessages,
    replyMessage,
    markAsRead,
    unreadCount 
  } = useSupportMessages();

  const handleReply = async (parentId: string, content: string) => {
    await replyMessage.mutateAsync({ parentId, content });
  };

  const handleMarkAsRead = (messageId: string) => {
    markAsRead.mutate(messageId);
  };

  const openReplyDialog = (message: SupportMessage) => {
    setSelectedMessage(message);
    setReplyDialogOpen(true);
  };

  // Filtrar mensagens
  const filteredMessages = allMessages.filter(msg => {
    const searchLower = search.toLowerCase();
    return (
      msg.subject?.toLowerCase().includes(searchLower) ||
      msg.conteudo.toLowerCase().includes(searchLower) ||
      msg.remetente?.full_name?.toLowerCase().includes(searchLower)
    );
  });

  // Separar por status
  const newMessages = filteredMessages.filter(msg => !msg.read_at);
  const readMessages = filteredMessages.filter(msg => msg.read_at && !msg.replied_at);
  const repliedMessages = filteredMessages.filter(msg => msg.replied_at);

  return (
    <>
      <ReplyDialog
        open={replyDialogOpen}
        onOpenChange={setReplyDialogOpen}
        message={selectedMessage}
        onReply={handleReply}
        isLoading={replyMessage.isPending}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#7b2ff7] to-[#f107a3] bg-clip-text text-transparent">
                  Suporte Hodos
                </h1>
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white">
                    {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                Gerencie as mensagens de suporte dos usuários
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => refetchAllMessages()}
              disabled={allMessagesLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${allMessagesLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{newMessages.length}</p>
                  <p className="text-xs text-muted-foreground">Novas</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Inbox className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{readMessages.length}</p>
                  <p className="text-xs text-muted-foreground">Lidas</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{repliedMessages.length}</p>
                  <p className="text-xs text-muted-foreground">Respondidas</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, assunto ou conteúdo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="new" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="new" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Novas ({newMessages.length})
              </TabsTrigger>
              <TabsTrigger value="read" className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                Lidas ({readMessages.length})
              </TabsTrigger>
              <TabsTrigger value="replied" className="flex items-center gap-2">
                <CheckCheck className="h-4 w-4" />
                Respondidas ({repliedMessages.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="mt-4 space-y-4">
              {newMessages.length === 0 ? (
                <Card className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhuma mensagem nova</p>
                </Card>
              ) : (
                newMessages.map((message) => (
                  <SupportMessageCard
                    key={message.id}
                    message={message}
                    isAdmin
                    onReply={openReplyDialog}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="read" className="mt-4 space-y-4">
              {readMessages.length === 0 ? (
                <Card className="p-8 text-center">
                  <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhuma mensagem lida aguardando resposta</p>
                </Card>
              ) : (
                readMessages.map((message) => (
                  <SupportMessageCard
                    key={message.id}
                    message={message}
                    isAdmin
                    onReply={openReplyDialog}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="replied" className="mt-4 space-y-4">
              {repliedMessages.length === 0 ? (
                <Card className="p-8 text-center">
                  <CheckCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhuma mensagem respondida</p>
                </Card>
              ) : (
                repliedMessages.map((message) => (
                  <SupportMessageCard
                    key={message.id}
                    message={message}
                    isAdmin
                    onReply={openReplyDialog}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default SupportInbox;
