
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Video, FileText, ChevronRight, CheckCircle, Lock, Play, Download, Eye, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import QuestionnaireSection from './QuestionnaireSection';
import ProgressTracker from './ProgressTracker';
import { useToast } from '@/hooks/use-toast';

interface Conteudo {
  id: string;
  titulo: string;
  descricao: string;
  texto: string;
  video_url?: string;
  pdf_url?: string;
  ordem: number;
}

interface UserContentProgress {
  id?: string;
  watched_video: boolean;
  read_text: boolean;
  downloaded_pdf: boolean;
  answered_questions: boolean;
  completed: boolean;
  time_spent: number;
}

interface ConteudoTrilhaProps {
  trilhaId: string;
  trilhaTitulo: string;
}

const ConteudoTrilha = ({ trilhaId, trilhaTitulo }: ConteudoTrilhaProps) => {
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [conteudoSelecionado, setConteudoSelecionado] = useState<Conteudo | null>(null);
  const [progressData, setProgressData] = useState<Record<string, UserContentProgress>>({});
  const [readingTime, setReadingTime] = useState<number>(0);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchConteudos();
  }, [trilhaId]);

  useEffect(() => {
    if (user?.id && conteudos.length > 0) {
      fetchUserProgress();
    }
  }, [user, conteudos]);

  // Timer para leitura de texto
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (conteudoSelecionado?.texto && !progressData[conteudoSelecionado.id]?.read_text) {
      interval = setInterval(() => {
        setReadingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [conteudoSelecionado, progressData]);

  const fetchConteudos = async () => {
    try {
      const { data, error } = await supabase
        .from('conteudos')
        .select('*')
        .eq('trilha_id', trilhaId)
        .order('ordem', { ascending: true });

      if (error) throw error;
      setConteudos(data || []);
      if (data && data.length > 0) {
        // Selecionar primeiro conteúdo não completado ou o primeiro
        const firstIncomplete = data.find(c => !progressData[c.id]?.completed);
        setConteudoSelecionado(firstIncomplete || data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_content_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('content_id', conteudos.map(c => c.id));

      if (error) throw error;

      const progressMap: Record<string, UserContentProgress> = {};
      data?.forEach(progress => {
        progressMap[progress.content_id] = {
          id: progress.id,
          watched_video: progress.watched_video,
          read_text: progress.read_text,
          downloaded_pdf: progress.downloaded_pdf,
          answered_questions: progress.answered_questions,
          completed: progress.completed,
          time_spent: progress.time_spent
        };
      });

      setProgressData(progressMap);
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

  const updateProgress = async (contentId: string, updates: Partial<UserContentProgress>) => {
    if (!user?.id) return;

    try {
      const currentProgress = progressData[contentId] || {
        watched_video: false,
        read_text: false,
        downloaded_pdf: false,
        answered_questions: false,
        completed: false,
        time_spent: 0
      };

      const newProgress = { ...currentProgress, ...updates };
      
      const { data, error } = await supabase
        .from('user_content_progress')
        .upsert({
          user_id: user.id,
          content_id: contentId,
          ...newProgress,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,content_id'
        })
        .select()
        .single();

      if (error) throw error;

      setProgressData(prev => ({
        ...prev,
        [contentId]: { ...newProgress, id: data.id }
      }));

      // Atualizar time_spent se aplicável
      if (updates.time_spent) {
        setReadingTime(0);
      }

    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar seu progresso",
        variant: "destructive"
      });
    }
  };

  const handleVideoWatched = () => {
    if (conteudoSelecionado) {
      updateProgress(conteudoSelecionado.id, { watched_video: true });
      toast({
        title: "Progresso salvo",
        description: "Vídeo marcado como assistido!"
      });
    }
  };

  const handleTextRead = () => {
    if (conteudoSelecionado && readingTime >= 30) { // Mínimo 30 segundos lendo
      updateProgress(conteudoSelecionado.id, { 
        read_text: true, 
        time_spent: readingTime 
      });
      toast({
        title: "Progresso salvo",
        description: "Texto marcado como lido!"
      });
    }
  };

  const handlePdfDownloaded = () => {
    if (conteudoSelecionado) {
      updateProgress(conteudoSelecionado.id, { downloaded_pdf: true });
      toast({
        title: "Progresso salvo",
        description: "Material baixado!"
      });
    }
  };

  const handleQuestionsCompleted = () => {
    if (conteudoSelecionado) {
      updateProgress(conteudoSelecionado.id, { answered_questions: true });
    }
  };

  const canAccessContent = (conteudo: Conteudo): boolean => {
    if (conteudo.ordem === 1) return true; // Primeiro conteúdo sempre liberado
    
    const previousContent = conteudos.find(c => c.ordem === conteudo.ordem - 1);
    if (!previousContent) return true;
    
    return progressData[previousContent.id]?.completed || false;
  };

  const getContentProgress = (contentId: string): number => {
    const progress = progressData[contentId];
    if (!progress) return 0;

    const conteudo = conteudos.find(c => c.id === contentId);
    if (!conteudo) return 0;

    let totalSteps = 0;
    let completedSteps = 0;

    if (conteudo.video_url) {
      totalSteps++;
      if (progress.watched_video) completedSteps++;
    }

    if (conteudo.texto) {
      totalSteps++;
      if (progress.read_text) completedSteps++;
    }

    if (conteudo.pdf_url) {
      totalSteps++;
      if (progress.downloaded_pdf) completedSteps++;
    }

    // Sempre tem questionário (mesmo que não tenha perguntas cadastradas ainda)
    totalSteps++;
    if (progress.answered_questions) completedSteps++;

    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (conteudos.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Nenhum conteúdo disponível para esta trilha ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{trilhaTitulo}</h2>
        <p className="text-sm sm:text-base text-gray-600">Conteúdo estruturado para seu crescimento espiritual</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Lista de conteúdos */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <h3 className="font-semibold text-gray-900 mb-3">Módulos</h3>
          <div className="space-y-2">
            {conteudos.map((conteudo) => {
              const isAccessible = canAccessContent(conteudo);
              const progress = getContentProgress(conteudo.id);
              const isCompleted = progressData[conteudo.id]?.completed;

              return (
                <Card
                  key={conteudo.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    !isAccessible 
                      ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                      : conteudoSelecionado?.id === conteudo.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => isAccessible && setConteudoSelecionado(conteudo)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-1">
                          {!isAccessible ? (
                            <Lock className="h-4 w-4 text-gray-400" />
                          ) : isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              {conteudo.ordem}
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
                            {conteudo.titulo}
                          </h4>
                          {isAccessible && progress > 0 && (
                            <div className="mt-2">
                              <Progress value={progress} className="h-1.5" />
                              <span className="text-xs text-gray-500 mt-1">{progress}% concluído</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {isAccessible && (
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Conteúdo selecionado */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          {conteudoSelecionado && (
            <div className="space-y-4 sm:space-y-6">
              {/* Header do conteúdo */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>Módulo {conteudoSelecionado.ordem}</Badge>
                        {progressData[conteudoSelecionado.id]?.completed && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Concluído
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg sm:text-xl">{conteudoSelecionado.titulo}</CardTitle>
                      <CardDescription className="text-sm sm:text-base">{conteudoSelecionado.descricao}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Progresso do conteúdo atual */}
              <ProgressTracker
                contentId={conteudoSelecionado.id}
                progress={progressData[conteudoSelecionado.id]}
                content={conteudoSelecionado}
              />

              {/* Conteúdos */}
              <div className="space-y-4 sm:space-y-6">
                {/* Vídeo */}
                {conteudoSelecionado.video_url && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Video className="h-4 w-4" />
                          Vídeo Explicativo
                        </div>
                        {progressData[conteudoSelecionado.id]?.watched_video ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Assistido
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleVideoWatched}
                            className="text-xs"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Marcar como assistido
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <iframe
                          src={conteudoSelecionado.video_url}
                          className="w-full h-full"
                          frameBorder="0"
                          allowFullScreen
                          title={conteudoSelecionado.titulo}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Texto */}
                {conteudoSelecionado.texto && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <BookOpen className="h-4 w-4" />
                          Conteúdo de Estudo
                        </div>
                        <div className="flex items-center gap-2">
                          {readingTime > 0 && !progressData[conteudoSelecionado.id]?.read_text && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {Math.floor(readingTime / 60)}:{(readingTime % 60).toString().padStart(2, '0')}
                            </div>
                          )}
                          {progressData[conteudoSelecionado.id]?.read_text ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              Lido
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleTextRead}
                              disabled={readingTime < 30}
                              className="text-xs"
                            >
                              Marcar como lido {readingTime < 30 && `(${30 - readingTime}s)`}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm sm:prose-base max-w-none">
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm sm:text-base">
                          {conteudoSelecionado.texto}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* PDF */}
                {conteudoSelecionado.pdf_url && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <FileText className="h-4 w-4" />
                          Material Complementar
                        </div>
                        {progressData[conteudoSelecionado.id]?.downloaded_pdf && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <Download className="h-3 w-3 mr-1" />
                            Baixado
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" asChild onClick={handlePdfDownloaded}>
                        <a 
                          href={conteudoSelecionado.pdf_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 w-full sm:w-auto"
                        >
                          <FileText className="h-4 w-4" />
                          Baixar PDF
                          <ChevronRight className="h-4 w-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Questionário */}
                <QuestionnaireSection
                  contentId={conteudoSelecionado.id}
                  onQuestionsCompleted={handleQuestionsCompleted}
                  isCompleted={progressData[conteudoSelecionado.id]?.answered_questions || false}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConteudoTrilha;
