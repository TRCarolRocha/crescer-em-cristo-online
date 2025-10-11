import React from 'react';
import { FileText, BookOpen, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientButton } from '@/components/common/GradientButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreatePublicDevotionalDialog } from '@/components/admin/CreatePublicDevotionalDialog';
import { CreatePublicTrackDialog } from '@/components/admin/CreatePublicTrackDialog';
import { Badge } from '@/components/ui/badge';

const PublicContent = () => {
  const navigate = useNavigate();
  const [createDevotionalOpen, setCreateDevotionalOpen] = React.useState(false);
  const [createTrackOpen, setCreateTrackOpen] = React.useState(false);

  const { data: publicDevocionais } = useQuery({
    queryKey: ['public-devocionais'],
    queryFn: async () => {
      const { data } = await supabase
        .from('devocionais')
        .select('*')
        .eq('is_public', true)
        .order('data', { ascending: false });
      return data || [];
    },
  });

  const { data: publicTracks } = useQuery({
    queryKey: ['public-tracks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('discipleship_tracks')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  return (
    <>
      <CreatePublicDevotionalDialog 
        open={createDevotionalOpen} 
        onOpenChange={setCreateDevotionalOpen} 
      />
      <CreatePublicTrackDialog 
        open={createTrackOpen} 
        onOpenChange={setCreateTrackOpen} 
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7b2ff7] to-[#f107a3] bg-clip-text text-transparent">
                Conteúdos Públicos
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie devocionais e trilhas disponíveis para todos
              </p>
            </div>
            <GradientButton onClick={() => navigate('/admin/hodos')}>
              Voltar ao Dashboard
            </GradientButton>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="devotionals" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="devotionals">
                <BookOpen className="h-4 w-4 mr-2" />
                Devocionais
              </TabsTrigger>
              <TabsTrigger value="tracks">
                <FileText className="h-4 w-4 mr-2" />
                Trilhas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="devotionals" className="space-y-4">
              <div className="flex justify-end">
                <GradientButton onClick={() => setCreateDevotionalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Devocional
                </GradientButton>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Devocionais Públicos ({publicDevocionais?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {publicDevocionais && publicDevocionais.length > 0 ? (
                    <div className="space-y-3">
                      {publicDevocionais.map((dev: any) => (
                        <div key={dev.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{dev.tema}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(dev.data).toLocaleDateString('pt-BR')} - {dev.referencia}
                            </p>
                          </div>
                          <Badge variant="outline">Público</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Nenhum devocional público cadastrado ainda.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tracks" className="space-y-4">
              <div className="flex justify-end">
                <GradientButton onClick={() => setCreateTrackOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Trilha
                </GradientButton>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Trilhas Públicas ({publicTracks?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {publicTracks && publicTracks.length > 0 ? (
                    <div className="space-y-3">
                      {publicTracks.map((track: any) => (
                        <div key={track.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{track.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {track.description || 'Sem descrição'}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="secondary">{track.level}</Badge>
                              {track.difficulty && <Badge variant="outline">{track.difficulty}</Badge>}
                            </div>
                          </div>
                          <Badge variant="outline">Público</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Nenhuma trilha pública cadastrada ainda.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default PublicContent;
