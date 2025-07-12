
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Edit, FileText, Video, File, Trash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CreateTrackDialog from './CreateTrackDialog';
import EditTrackDialog from './EditTrackDialog';
import ContentDialog from './ContentDialog';

interface Track {
  id: string;
  title: string;
  description: string;
  level: string;
  lessons: number;
  duration: string;
  difficulty: string;
}

interface Content {
  id: string;
  titulo: string;
  descricao: string;
  ordem: number;
  pdf_url?: string;
  video_url?: string;
  texto?: string;
  trilha_id: string;
}

const AdminTrilhas = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [contents, setContents] = useState<{[key: string]: Content[]}>({});
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [contentDialog, setContentDialog] = useState<{
    show: boolean;
    trilhaId: string;
    content?: Content;
  }>({ show: false, trilhaId: '' });
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('discipleship_tracks')
        .select('*')
        .order('title');

      if (error) throw error;
      setTracks(data || []);
    } catch (error) {
      console.error('Erro ao buscar trilhas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as trilhas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchContents = async (trilhaId: string) => {
    try {
      const { data, error } = await supabase
        .from('conteudos')
        .select('*')
        .eq('trilha_id', trilhaId)
        .order('ordem');

      if (error) throw error;
      setContents(prev => ({ ...prev, [trilhaId]: data || [] }));
    } catch (error) {
      console.error('Erro ao buscar conteúdos:', error);
    }
  };

  const handleExpandTrack = (trackId: string) => {
    if (expandedTrack === trackId) {
      setExpandedTrack(null);
    } else {
      setExpandedTrack(trackId);
      if (!contents[trackId]) {
        fetchContents(trackId);
      }
    }
  };

  const deleteContent = async (contentId: string, trilhaId: string) => {
    try {
      const { error } = await supabase
        .from('conteudos')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conteúdo excluído com sucesso"
      });

      await fetchContents(trilhaId);
    } catch (error) {
      console.error('Erro ao excluir conteúdo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o conteúdo",
        variant: "destructive"
      });
    }
  };

  const getContentIcon = (content: Content) => {
    if (content.video_url) return <Video className="h-4 w-4" />;
    if (content.pdf_url) return <File className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getContentType = (content: Content) => {
    if (content.video_url) return 'Vídeo';
    if (content.pdf_url) return 'PDF';
    return 'Texto';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Trilhas</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Trilha
        </Button>
      </div>

      <div className="grid gap-4">
        {tracks.map((track) => (
          <Card key={track.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{track.title}</h3>
                    <p className="text-gray-600">{track.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{track.level}</Badge>
                      <Badge variant="outline">{track.lessons} lições</Badge>
                      <Badge variant="outline">{track.duration}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditingTrack(track)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExpandTrack(track.id)}
                  >
                    {expandedTrack === track.id ? 'Ocultar' : 'Ver'} Conteúdos
                  </Button>
                </div>
              </div>

              {expandedTrack === track.id && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Conteúdos da Trilha</h4>
                    <Button
                      size="sm"
                      onClick={() => setContentDialog({ show: true, trilhaId: track.id })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Novo Conteúdo
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {contents[track.id]?.map((content) => (
                      <div key={content.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getContentIcon(content)}
                          <div>
                            <h5 className="font-medium">{content.titulo}</h5>
                            <p className="text-sm text-gray-600">{content.descricao}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {getContentType(content)}
                              </Badge>
                              <span className="text-xs text-gray-500">Ordem: {content.ordem}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setContentDialog({ 
                              show: true, 
                              trilhaId: track.id, 
                              content 
                            })}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteContent(content.id, track.id)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {(!contents[track.id] || contents[track.id].length === 0) && (
                      <p className="text-gray-500 text-center py-4">
                        Nenhum conteúdo cadastrado para esta trilha
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {showCreateDialog && (
        <CreateTrackDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={async () => {
            await fetchTracks();
            setShowCreateDialog(false);
          }}
        />
      )}

      {editingTrack && (
        <EditTrackDialog
          track={editingTrack}
          onClose={() => setEditingTrack(null)}
          onSuccess={async () => {
            await fetchTracks();
            setEditingTrack(null);
          }}
        />
      )}

      {contentDialog.show && (
        <ContentDialog
          content={contentDialog.content}
          trilhaId={contentDialog.trilhaId}
          onClose={() => setContentDialog({ show: false, trilhaId: '' })}
          onSuccess={async () => {
            await fetchContents(contentDialog.trilhaId);
            setContentDialog({ show: false, trilhaId: '' });
          }}
        />
      )}
    </div>
  );
};

export default AdminTrilhas;
