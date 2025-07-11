
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Track {
  id: string;
  title: string;
  description: string;
  level: string;
  lessons: number;
  duration: string;
  difficulty: string;
}

const AdminTrilhas = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Trilha
        </Button>
      </div>

      <div className="grid gap-4">
        {tracks.map((track) => (
          <Card key={track.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
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
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminTrilhas;
