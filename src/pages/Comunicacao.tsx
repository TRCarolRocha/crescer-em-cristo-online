
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, Camera, Send, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Comunicacao = () => {
  const navigate = useNavigate();
  const [novoPost, setNovoPost] = useState("");

  const posts = [
    {
      id: 1,
      autor: "Pastor João Silva",
      departamento: "Liderança",
      tempo: "há 2 horas",
      conteudo: "Que alegria foi o culto de hoje! Deus nos abençoou ricamente com Sua presença. Gratidão a todos que participaram da adoração! 🙏",
      imagem: "/api/placeholder/400/200",
      curtidas: 15,
      comentarios: 3,
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 2,
      autor: "Irmã Maria Santos",
      departamento: "Ministério das Mulheres",
      tempo: "há 4 horas",
      conteudo: "Convite especial para o encontro das mulheres na próxima sexta-feira! Será um tempo de comunhão e estudo da Palavra. Venham participar! 💕",
      imagem: null,
      curtidas: 8,
      comentarios: 5,
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 3,
      autor: "Ministério de Música",
      departamento: "Ministério de Música",
      tempo: "há 6 horas",
      conteudo: "Ensaio de hoje foi incrível! Preparando louvores especiais para o próximo domingo. Deus está no controle! 🎵",
      imagem: "/api/placeholder/400/200",
      curtidas: 12,
      comentarios: 2,
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 4,
      autor: "Alex Oliveira",
      departamento: "Departamento Infantil",
      tempo: "há 8 horas",
      conteudo: "As crianças estão animadas para a apresentação do próximo domingo! Elas estão ensaiando com muito amor. Deus abençoe nossos pequenos! 👶",
      imagem: "/api/placeholder/400/200",
      curtidas: 20,
      comentarios: 7,
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 5,
      autor: "Alessandra Costa",
      departamento: "Ministério das Mulheres",
      tempo: "há 1 dia",
      conteudo: "Gratidão a Deus por mais uma semana de vida! Que possamos ser sal e luz em todos os lugares que formos. Boa semana a todos! ✨",
      imagem: null,
      curtidas: 18,
      comentarios: 4,
      avatar: "/api/placeholder/40/40"
    }
  ];

  const handleSubmitPost = () => {
    if (novoPost.trim()) {
      console.log("Novo post:", novoPost);
      setNovoPost("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Comunicação da Igreja</h1>
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
              <div className="text-2xl font-bold text-gray-900">150+</div>
              <div className="text-sm text-gray-600">Membros Ativos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">24</div>
              <div className="text-sm text-gray-600">Posts esta Semana</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">156</div>
              <div className="text-sm text-gray-600">Curtidas este Mês</div>
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
              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Adicionar Foto
                </Button>
                <Button 
                  onClick={handleSubmitPost}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Publicar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feed de Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Header do Post */}
                <div className="flex items-start space-x-3 mb-4">
                  <img
                    src={post.avatar}
                    alt={post.autor}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{post.autor}</h4>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {post.departamento}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{post.tempo}</p>
                  </div>
                </div>

                {/* Conteúdo do Post */}
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">{post.conteudo}</p>
                </div>

                {/* Imagem do Post */}
                {post.imagem && (
                  <div className="mb-4">
                    <img
                      src={post.imagem}
                      alt="Post"
                      className="w-full rounded-lg object-cover max-h-64"
                    />
                  </div>
                )}

                {/* Ações do Post */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{post.curtidas}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{post.comentarios}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                      <Share2 className="h-4 w-4" />
                      <span className="text-sm">Compartilhar</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Botão Carregar Mais */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Carregar Mais Posts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Comunicacao;
