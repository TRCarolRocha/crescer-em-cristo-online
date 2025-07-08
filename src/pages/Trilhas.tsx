
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Clock, BookOpen, Users, Star, Play } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  description: string;
  level: string;
  lessons: number;
  duration: string;
  difficulty: string;
  topics: string[];
}

interface UserProgress {
  track_id: string;
  progress: number;
  started_at: string;
  completed_at?: string;
}

const Trilhas = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchTracks();
    if (user) {
      fetchUserProgress();
    }
  }, [user]);

  const fetchTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('discipleship_tracks')
        .select('*')
        .order('level', { ascending: true });

      if (error) throw error;
      setTracks(data || []);
    } catch (error) {
      console.error('Erro ao carregar trilhas:', error);
    }
  };

  const fetchUserProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_track_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserProgress(data || []);
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTrack = async (trackId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para iniciar uma trilha",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_track_progress')
        .insert({
          user_id: user.id,
          track_id: trackId,
          progress: 0
        });

      if (error) throw error;

      toast({
        title: "Trilha iniciada!",
        description: "Você pode acompanhar seu progresso aqui",
      });

      fetchUserProgress();
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Trilha já iniciada",
          description: "Você já está cursando esta trilha",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível iniciar a trilha",
          variant: "destructive"
        });
      }
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'novo': return 'bg-green-100 text-green-800';
      case 'crescimento': return 'bg-blue-100 text-blue-800';
      case 'lider': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'novo': return '🌱';
      case 'crescimento': return '🌿';
      case 'lider': return '🌳';
      default: return '📚';
    }
  };

  const getTrackProgress = (trackId: string) => {
    return userProgress.find(p => p.track_id === trackId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            Trilhas de Discipulado
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Escolha a trilha ideal para o seu momento espiritual e cresça na fé de forma estruturada e acompanhada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track) => {
            const progress = getTrackProgress(track.id);
            const isStarted = !!progress;
            const isCompleted = progress?.completed_at;

            return (
              <Card key={track.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getLevelIcon(track.level)}</span>
                      <Badge className={getLevelColor(track.level)}>
                        {track.level === 'novo' && 'Novo na Fé'}
                        {track.level === 'crescimento' && 'Crescimento'}
                        {track.level === 'lider' && 'Liderança'}
                      </Badge>
                    </div>
                    {isCompleted && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
                  </div>
                  
                  <CardTitle className="text-xl mb-2">{track.title}</CardTitle>
                  <CardDescription>{track.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{track.lessons} lições</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{track.duration}</span>
                    </div>
                  </div>

                  {track.topics && track.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {track.topics.slice(0, 3).map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {track.topics.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{track.topics.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {isStarted && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{progress.progress}%</span>
                      </div>
                      <Progress value={progress.progress} />
                    </div>
                  )}

                  <Button 
                    onClick={() => startTrack(track.id)}
                    disabled={isStarted}
                    className="w-full"
                    variant={isStarted ? "outline" : "default"}
                  >
                    {isCompleted ? (
                      <>
                        <Star className="h-4 w-4 mr-2" />
                        Concluída
                      </>
                    ) : isStarted ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Continuar
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Trilha
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!user && (
          <div className="text-center mt-12 p-6 bg-white/80 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Faça login para começar</h3>
            <p className="text-gray-600 mb-4">
              Entre em sua conta para iniciar as trilhas e acompanhar seu progresso.
            </p>
            <Button onClick={() => window.location.href = '/auth'}>
              Fazer Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trilhas;
