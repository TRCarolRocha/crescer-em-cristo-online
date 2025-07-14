
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, Send, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

const Comunicacao = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [novoPost, setNovoPost] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          author_id,
          created_at,
          profiles:author_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async () => {
    if (!novoPost.trim() || !user) return;

    setPosting(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: novoPost.trim(),
          author_id: user.id,
          type: 'post'
        });

      if (error) throw error;

      setNovoPost("");
      await fetchMessages();
      
      toast({
        title: "Sucesso!",
        description: "Sua mensagem foi publicada com sucesso."
      });
    } catch (error) {
      console.error('Erro ao publicar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível publicar sua mensagem.",
        variant: "destructive"
      });
    } finally {
      setPosting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "há poucos minutos";
    if (diffInHours < 24) return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('pt-BR');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Entre para Participar
            </h2>
            <p className="text-gray-600 mb-6">
              Faça login para compartilhar com a comunidade Monte Hebrom
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Comunidade da Fé</h1>
            <p className="text-gray-600 mt-2">Compartilhe momentos e se conecte com a família Monte Hebrom</p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            Voltar ao Início
          </Button>
        </div>

        {/* Estatísticas da Comunidade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">Ativos</div>
              <div className="text-sm text-gray-600">Membros Online</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{messages.length}</div>
              <div className="text-sm text-gray-600">Posts Recentes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">Unidos</div>
              <div className="text-sm text-gray-600">Em Comunhão</div>
            </CardContent>
          </Card>
        </div>

        {/* Criar Novo Post */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Compartilhar com a Comunidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Compartilhe algo especial com a família Monte Hebrom..."
                value={novoPost}
                onChange={(e) => setNovoPost(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitPost}
                  disabled={!novoPost.trim() || posting}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {posting ? "Publicando..." : "Publicar"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feed de Posts */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent>
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma mensagem ainda
                </h3>
                <p className="text-gray-600">
                  Seja o primeiro a compartilhar algo com a comunidade!
                </p>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <Card key={message.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Header do Post */}
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {message.profiles?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">
                          {message.profiles?.full_name || 'Usuário'}
                        </h4>
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          Membro
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{formatTimeAgo(message.created_at)}</p>
                    </div>
                  </div>

                  {/* Conteúdo do Post */}
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">{message.content}</p>
                  </div>

                  {/* Ações do Post */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
                        <Heart className="h-4 w-4" />
                        <span className="text-sm">Curtir</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">Comentar</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                        <Share2 className="h-4 w-4" />
                        <span className="text-sm">Compartilhar</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Botão Carregar Mais */}
        {messages.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" onClick={fetchMessages}>
              Atualizar Posts
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comunicacao;
