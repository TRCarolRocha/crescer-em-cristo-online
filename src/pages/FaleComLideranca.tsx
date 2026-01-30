import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, MessageCircle, Headphones, Plus } from 'lucide-react';
import { useSupportMessages } from '@/hooks/useSupportMessages';
import { SupportMessageCard } from '@/components/support/SupportMessageCard';
import { SendSupportMessageDialog } from '@/components/support/SendSupportMessageDialog';

interface Mensagem {
  id: string;
  conteudo: string;
  enviada_em: string;
  lida: boolean;
  remetente_id: string;
  destinatario_id?: string;
}

const FaleComLideranca = () => {
  const [mensagem, setMensagem] = useState('');
  const [mensagensEnviadas, setMensagensEnviadas] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMensagens, setLoadingMensagens] = useState(true);
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { 
    userMessages, 
    userMessagesLoading, 
    sendMessage 
  } = useSupportMessages();

  useEffect(() => {
    if (user) {
      fetchMensagensEnviadas();
    }
  }, [user]);

  const fetchMensagensEnviadas = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .eq('remetente_id', user.id)
        .eq('message_type', 'church_leadership')
        .order('enviada_em', { ascending: false });

      if (error) throw error;
      setMensagensEnviadas(data || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    } finally {
      setLoadingMensagens(false);
    }
  };

  const enviarMensagem = async () => {
    if (!user || !mensagem.trim()) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('mensagens')
        .insert({
          remetente_id: user.id,
          conteudo: mensagem.trim(),
          message_type: 'church_leadership'
        });

      if (error) throw error;

      toast({
        title: "Mensagem enviada!",
        description: "Sua mensagem foi enviada para a liderança da igreja."
      });

      setMensagem('');
      fetchMensagensEnviadas();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua mensagem",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendSupport = async (subject: string, content: string) => {
    await sendMessage.mutateAsync({ subject, content });
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
            <p className="text-gray-600 mb-6">
              Você precisa estar logado para falar com a liderança.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/auth')} className="w-full">
                Fazer Login
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SendSupportMessageDialog
        open={supportDialogOpen}
        onOpenChange={setSupportDialogOpen}
        onSend={handleSendSupport}
        isLoading={sendMessage.isPending}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button onClick={() => navigate(-1)} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mensagens</h1>
              <p className="text-gray-600 mt-2">Entre em contato com a liderança ou suporte</p>
            </div>
          </div>

          <Tabs defaultValue="lideranca" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="lideranca" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Liderança da Igreja
              </TabsTrigger>
              <TabsTrigger value="suporte" className="flex items-center gap-2">
                <Headphones className="h-4 w-4" />
                Suporte Hodos
              </TabsTrigger>
            </TabsList>

            {/* Tab: Liderança da Igreja */}
            <TabsContent value="lideranca">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Formulário para nova mensagem */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Nova Mensagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-2">
                          Sua mensagem
                        </label>
                        <Textarea
                          id="mensagem"
                          placeholder="Escreva sua mensagem para a liderança da igreja..."
                          value={mensagem}
                          onChange={(e) => setMensagem(e.target.value)}
                          className="min-h-[150px]"
                          disabled={loading}
                        />
                      </div>
                      <Button
                        onClick={enviarMensagem}
                        disabled={!mensagem.trim() || loading}
                        className="w-full"
                      >
                        {loading ? 'Enviando...' : 'Enviar Mensagem'}
                        <Send className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Histórico de mensagens */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Mensagens Enviadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingMensagens ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : mensagensEnviadas.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        Nenhuma mensagem enviada ainda.
                      </p>
                    ) : (
                      <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {mensagensEnviadas.map((msg) => (
                          <div key={msg.id} className="border rounded-lg p-4 bg-gray-50">
                            <p className="text-gray-800 mb-2">{msg.conteudo}</p>
                            <div className="text-xs text-gray-500 flex justify-between items-center">
                              <span>{formatarData(msg.enviada_em)}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                msg.lida ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {msg.lida ? 'Lida' : 'Não lida'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Suporte Hodos */}
            <TabsContent value="suporte">
              <div className="space-y-6">
                {/* Card de destaque para novo contato */}
                <Card className="bg-gradient-to-br from-[#7b2ff7]/10 to-[#f107a3]/10 border-[#7b2ff7]/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#7b2ff7] to-[#f107a3] flex items-center justify-center flex-shrink-0">
                        <Headphones className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">Suporte Hodos</h3>
                        <p className="text-muted-foreground text-sm">
                          Dúvidas sobre planos, funcionalidades ou problemas técnicos
                        </p>
                      </div>
                      <Button 
                        onClick={() => setSupportDialogOpen(true)}
                        className="bg-gradient-to-r from-[#7b2ff7] to-[#f107a3] hover:opacity-90"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Mensagem
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de mensagens de suporte */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Minhas Solicitações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userMessagesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7b2ff7]"></div>
                      </div>
                    ) : userMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <Headphones className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          Você ainda não enviou nenhuma mensagem para o suporte
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userMessages.map((message) => (
                          <SupportMessageCard
                            key={message.id}
                            message={message}
                            isAdmin={false}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default FaleComLideranca;
