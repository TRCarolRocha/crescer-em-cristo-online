
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Clock, Users, ChevronRight, Trophy, Target, Award, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConteudoTrilha from '@/components/ConteudoTrilha';

interface Trilha {
  id: string;
  title: string;
  description: string;
  level: string;
  lessons: number;
  duration: string;
  topics: string[];
  allowed_levels: string[];
  allowed_groups: string[];
}

interface UserProgress {
  track_id: string;
  progress: number;
  completed_at: string | null;
}

interface UserDiagnostic {
  result: string;
}

interface UserGroup {
  id: string;
  name: string;
}

const Trilhas = () => {
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [filteredTrilhas, setFilteredTrilhas] = useState<Trilha[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [selectedTrilha, setSelectedTrilha] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userDiagnostic, setUserDiagnostic] = useState<UserDiagnostic | null>(null);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrilhas();
    if (user?.id) {
      fetchUserProgress();
      fetchUserDiagnostic();
      fetchUserGroups();
    }
  }, [user]);

  useEffect(() => {
    filterTrilhas();
  }, [trilhas, userDiagnostic, userGroups]);

  useEffect(() => {
    fetchTrilhas();
    if (user?.id) {
      fetchUserProgress();
    }
  }, [user]);

  const fetchTrilhas = async () => {
    try {
      const { data, error } = await supabase
        .from('discipleship_tracks')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;
      setTrilhas(data || []);
    } catch (error) {
      console.error('Erro ao carregar trilhas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_track_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserProgress(data || []);
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

  const fetchUserDiagnostic = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('diagnostics')
        .select('result')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserDiagnostic(data);
    } catch (error) {
      console.error('Erro ao carregar diagnóstico:', error);
    }
  };

  const fetchUserGroups = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      if (data && data.length > 0) {
        const groupIds = data.map(item => item.group_id);
        
        const { data: groups, error: groupsError } = await supabase
          .from('member_groups')
          .select('id, name')
          .in('id', groupIds);

        if (groupsError) throw groupsError;
        setUserGroups(groups || []);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  const filterTrilhas = () => {
    if (!user) {
      setFilteredTrilhas(trilhas);
      return;
    }

    const filtered = trilhas.filter(trilha => {
      // Se não tem restrições, mostra para todos
      if (!trilha.allowed_levels?.length && !trilha.allowed_groups?.length) {
        return true;
      }

      // Verifica se o nível do usuário está permitido
      const levelAllowed = !trilha.allowed_levels?.length || 
        (userDiagnostic?.result && trilha.allowed_levels.includes(userDiagnostic.result));

      // Verifica se algum grupo do usuário está permitido
      const groupAllowed = !trilha.allowed_groups?.length ||
        userGroups.some(group => trilha.allowed_groups.includes(group.id));

      return levelAllowed || groupAllowed;
    });

    setFilteredTrilhas(filtered);
  };

  const getProgressForTrack = (trackId: string): number => {
    const progress = userProgress.find(p => p.track_id === trackId);
    return progress?.progress || 0;
  };

  const isTrackCompleted = (trackId: string): boolean => {
    const progress = userProgress.find(p => p.track_id === trackId);
    return !!progress?.completed_at;
  };

  const getTrackRecommendationReason = (trilha: Trilha): string | null => {
    if (!user) return null;
    
    const levelAllowed = trilha.allowed_levels?.includes(userDiagnostic?.result || '');
    const groupAllowed = userGroups.some(group => trilha.allowed_groups?.includes(group.id));
    
    if (levelAllowed && groupAllowed) {
      return 'Recomendada pelo diagnóstico e grupo';
    } else if (levelAllowed) {
      return 'Recomendada pelo diagnóstico';
    } else if (groupAllowed) {
      const matchingGroup = userGroups.find(group => trilha.allowed_groups?.includes(group.id));
      return `Disponível pelo grupo: ${matchingGroup?.name}`;
    }
    
    return null;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Iniciante':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediário':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Avançado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-pulse text-center">
          <BookOpen className="h-8 w-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Carregando trilhas...</p>
        </div>
      </div>
    );
  }

  if (selectedTrilha) {
    const trilha = trilhas.find(t => t.id === selectedTrilha);
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedTrilha(null)}
              >
                ← Voltar às Trilhas
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
              >
                🏠 Início
              </Button>
            </div>
            <ConteudoTrilha
              trilhaId={selectedTrilha}
              trilhaTitulo={trilha?.title || ''}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header com botão de voltar */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            🏠 Voltar ao Início
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Trilhas de Discipulado
            </h1>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto">
            Jornadas estruturadas para seu crescimento espiritual. 
            {userDiagnostic?.result && (
              <span className="block mt-2 text-blue-600 font-medium">
                Trilhas personalizadas para seu nível: {userDiagnostic.result}
              </span>
            )}
          </p>
          {userGroups.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-gray-600">Seus grupos: </span>
              {userGroups.map(group => (
                <Badge key={group.id} variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {group.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Estatísticas do usuário */}
        {user && userProgress.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-blue-600 font-medium">Trilhas Iniciadas</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-900">{userProgress.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-200 rounded-lg">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-green-600 font-medium">Trilhas Concluídas</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-900">
                      {userProgress.filter(p => p.completed_at).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 sm:col-span-2 lg:col-span-1">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-200 rounded-lg">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-purple-600 font-medium">Progresso Médio</p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-900">
                      {userProgress.length > 0 
                        ? Math.round(userProgress.reduce((acc, p) => acc + p.progress, 0) / userProgress.length)
                        : 0
                      }%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Grid de Trilhas */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredTrilhas.map((trilha) => {
            const progress = getProgressForTrack(trilha.id);
            const isCompleted = isTrackCompleted(trilha.id);
            const recommendationReason = getTrackRecommendationReason(trilha);

            return (
              <Card 
                key={trilha.id} 
                className={`group hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                  isCompleted ? 'border-green-200 bg-green-50' : ''
                } ${recommendationReason?.includes('diagnóstico') ? 'ring-2 ring-blue-200 bg-blue-50' : ''}`}
                onClick={() => setSelectedTrilha(trilha.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {trilha.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge className={`text-xs px-2 py-1 ${getLevelColor(trilha.level)}`}>
                          {trilha.level}
                        </Badge>
                        {isCompleted && (
                          <Badge className="text-xs px-2 py-1 bg-green-100 text-green-800 border-green-200">
                            <Trophy className="h-3 w-3 mr-1" />
                            Concluída
                          </Badge>
                        )}
                        {recommendationReason?.includes('diagnóstico') && (
                          <Badge className="text-xs px-2 py-1 bg-blue-100 text-blue-800 border-blue-200">
                            <Star className="h-3 w-3 mr-1" />
                            Recomendada
                          </Badge>
                        )}
                        {recommendationReason?.includes('grupo') && (
                          <Badge className="text-xs px-2 py-1 bg-purple-100 text-purple-800 border-purple-200">
                            <Users className="h-3 w-3 mr-1" />
                            Grupo
                          </Badge>
                        )}
                      </div>
                      {recommendationReason && (
                        <p className="text-xs text-blue-600 mt-1 font-medium">
                          {recommendationReason}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {trilha.description}
                  </p>

                  {/* Progresso */}
                  {user && progress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Progresso</span>
                        <span className="text-xs font-semibold text-gray-700">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  {/* Metadados */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-600">{trilha.lessons} lições</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-600">{trilha.duration}</span>
                    </div>
                  </div>

                  {/* Tópicos */}
                  {trilha.topics && trilha.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {trilha.topics.slice(0, 3).map((topic, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-200"
                        >
                          {topic}
                        </Badge>
                      ))}
                      {trilha.topics.length > 3 && (
                        <Badge 
                          variant="outline" 
                          className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500 border-gray-200"
                        >
                          +{trilha.topics.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Botão de Ação */}
                  <Button 
                    className="w-full mt-4 text-sm h-9"
                    variant={progress > 0 ? "default" : "outline"}
                  >
                    {progress > 0 
                      ? (isCompleted ? 'Revisar Trilha' : 'Continuar') 
                      : 'Iniciar Trilha'
                    }
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTrilhas.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {!user ? 'Nenhuma trilha disponível' : 'Nenhuma trilha personalizada encontrada'}
            </h3>
            <p className="text-gray-600 mb-4">
              {!user 
                ? 'Novas trilhas de discipulado estarão disponíveis em breve.'
                : userDiagnostic
                  ? 'Não encontramos trilhas adequadas ao seu nível atual ou grupos. Considere refazer o diagnóstico ou entrar em contato com a liderança.'
                  : 'Complete primeiro o diagnóstico espiritual para ver trilhas personalizadas.'
              }
            </p>
            {user && !userDiagnostic && (
              <Button onClick={() => navigate('/diagnostico')} className="mt-4">
                <Award className="h-4 w-4 mr-2" />
                Fazer Diagnóstico Espiritual
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Trilhas;
