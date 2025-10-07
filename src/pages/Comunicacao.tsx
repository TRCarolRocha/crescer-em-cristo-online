import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, Send, Users, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TagBadge from "@/components/TagBadge";
import CommentSection from "@/components/CommentSection";
import ImageUpload from "@/components/ImageUpload";
import { getTagColor } from "@/utils/tagUtils";

interface Message {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  image_url: string | null;
  profiles: {
    full_name: string;
    avatar_url: string | null;
    tags: string[] | null;
    department: string | null;
    ministry: string | null;
  } | null;
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
}

interface TagInfo {
  id: string;
  nome: string;
}

const Comunicacao = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [novoPost, setNovoPost] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tagsInfo, setTagsInfo] = useState<TagInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchTagsInfo();
    }
  }, [user]);

  const fetchTagsInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('ministerios_departamentos')
        .select('id, nome');

      if (error) throw error;
      setTagsInfo(data || []);
    } catch (error) {
      console.error('Erro ao carregar informações das tags:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id, content, author_id, created_at, image_url')
        .order('created_at', { ascending: false })
        .limit(20);

      if (messagesError) throw messagesError;

      if (messagesData && messagesData.length > 0) {
        // Buscar perfis dos autores
        const authorIds = [...new Set(messagesData.map(msg => msg.author_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, tags, department, ministry')
          .in('id', authorIds);

        if (profilesError) throw profilesError;

        // Buscar curtidas e comentários para cada mensagem
        const messageIds = messagesData.map(msg => msg.id);
        
        const { data: likesData, error: likesError } = await supabase
          .from('message_likes')
          .select('message_id, user_id')
          .in('message_id', messageIds);

        if (likesError) throw likesError;

        const { data: commentsData, error: commentsError } = await supabase
          .from('message_comments')
          .select('message_id')
          .in('message_id', messageIds);

        if (commentsError) throw commentsError;

        // Processar dados das mensagens
        const messagesWithData = messagesData.map(message => {
          const profile = profilesData?.find(profile => profile.id === message.author_id);
          const messageLikes = likesData?.filter(like => like.message_id === message.id) || [];
          const messageComments = commentsData?.filter(comment => comment.message_id === message.id) || [];
          const userHasLiked = messageLikes.some(like => like.user_id === user?.id);

          return {
            ...message,
            profiles: profile || null,
            likes_count: messageLikes.length,
            comments_count: messageComments.length,
            user_has_liked: userHasLiked
          };
        });

        setMessages(messagesWithData);
      } else {
        setMessages([]);
      }
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
    if ((!novoPost.trim() && !selectedImage) || !user) return;

    setPosting(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: novoPost.trim() || '',
          author_id: user.id,
          type: 'post',
          image_url: selectedImage
        });

      if (error) throw error;

      setNovoPost("");
      setSelectedImage(null);
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

  const handleLikeToggle = async (messageId: string, currentlyLiked: boolean) => {
    if (!user) return;

    try {
      if (currentlyLiked) {
        const { error } = await supabase
          .from('message_likes')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('message_likes')
          .insert({
            message_id: messageId,
            user_id: user.id
          });

        if (error) throw error;
      }

      // Atualizar estado local
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            likes_count: currentlyLiked ? msg.likes_count - 1 : msg.likes_count + 1,
            user_has_liked: !currentlyLiked
          };
        }
        return msg;
      }));

    } catch (error) {
      console.error('Erro ao curtir/descurtir:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a curtida.",
        variant: "destructive"
      });
    }
  };

  const getTagNameById = (tagId: string) => {
    const tag = tagsInfo.find(t => t.id === tagId);
    return tag?.nome || tagId;
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'member':
        return 'Membro';
      default:
        return 'Membro';
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

  const updateCommentsCount = (messageId: string, newCount: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, comments_count: newCount } : msg
    ));
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
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Comunidade da Fé</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Compartilhe momentos e se conecte com a família Monte Hebrom</p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline" className="w-full sm:w-auto">
            Voltar ao Início
          </Button>
        </div>

        {/* Estatísticas da Comunidade */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-gray-900">Ativos</div>
              <div className="text-xs sm:text-sm text-gray-600">Membros Online</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{messages.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Posts Recentes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mx-auto mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-gray-900">Unidos</div>
              <div className="text-xs sm:text-sm text-gray-600">Em Comunhão</div>
            </CardContent>
          </Card>
        </div>

        {/* Criar Novo Post */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Compartilhar com a Comunidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <Textarea
                placeholder="Compartilhe algo especial com a família Monte Hebrom..."
                value={novoPost}
                onChange={(e) => setNovoPost(e.target.value)}
                className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
              />
              
              <ImageUpload
                onImageUploaded={setSelectedImage}
                selectedImage={selectedImage}
                onRemoveImage={() => setSelectedImage(null)}
              />
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitPost}
                  disabled={(!novoPost.trim() && !selectedImage) || posting}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 min-h-[44px] w-full sm:w-auto"
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
                <CardContent className="p-4 sm:p-6">
                  {/* Header do Post */}
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {message.profiles?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {message.profiles?.full_name || 'Usuário'}
                        </h4>
                      </div>
                      
                      {/* Tags do usuário - Nova lógica implementada */}
                      <div className="flex flex-wrap gap-1 mb-1">
                        {/* Mostrar department se existe */}
                        {message.profiles?.department && (
                          <TagBadge
                            tagName={message.profiles.department}
                            color={getTagColor(message.profiles.department)}
                            size="sm"
                          />
                        )}
                        
                        {/* Mostrar ministry se existe e é diferente de department */}
                        {message.profiles?.ministry && 
                         message.profiles.ministry !== message.profiles.department && (
                          <TagBadge
                            tagName={message.profiles.ministry}
                            color={getTagColor(message.profiles.ministry)}
                            size="sm"
                          />
                        )}
                        
                        {/* Mostrar tags da tabela ministerios_departamentos se existirem */}
                        {message.profiles?.tags && message.profiles.tags.length > 0 && 
                         message.profiles.tags.map((tagId) => (
                          <TagBadge
                            key={tagId}
                            tagName={getTagNameById(tagId)}
                            color={getTagColor(getTagNameById(tagId))}
                            size="sm"
                          />
                        ))}
                        
                        {/* Remover exibição de role - não existe mais */}
                      </div>
                      
                      <p className="text-xs text-gray-500">{formatTimeAgo(message.created_at)}</p>
                    </div>
                  </div>

                  {/* Conteúdo do Post */}
                  <div className="mb-4">
                    {message.content && (
                      <p className="text-gray-700 leading-relaxed mb-3">{message.content}</p>
                    )}
                    
                    {/* Imagem do post */}
                    {message.image_url && (
                      <div className="rounded-lg overflow-hidden">
                        <img
                          src={message.image_url}
                          alt="Imagem do post"
                          className="w-full max-h-96 object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Ações do Post */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-6">
                      <button 
                        onClick={() => handleLikeToggle(message.id, message.user_has_liked)}
                        className={`flex items-center space-x-2 transition-colors ${
                          message.user_has_liked 
                            ? 'text-red-500' 
                            : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${message.user_has_liked ? 'fill-current' : ''}`} />
                        <span className="text-sm">
                          {message.likes_count > 0 ? message.likes_count : 'Curtir'}
                        </span>
                      </button>
                      
                      <CommentSection
                        messageId={message.id}
                        commentsCount={message.comments_count}
                        onCommentsCountChange={(newCount) => updateCommentsCount(message.id, newCount)}
                      />
                      
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
