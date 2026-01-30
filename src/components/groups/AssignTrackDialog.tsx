import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Track {
  id: string;
  title: string;
  description: string | null;
  level: string;
  lessons: number | null;
}

interface AssignTrackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (trackId: string, dueDate?: string) => Promise<void>;
  isLoading?: boolean;
  assignedTrackIds: string[];
}

export const AssignTrackDialog = ({
  open,
  onOpenChange,
  onAssign,
  isLoading = false,
  assignedTrackIds
}: AssignTrackDialogProps) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (open) {
      fetchTracks();
    }
  }, [open]);

  const fetchTracks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('discipleship_tracks')
        .select('id, title, description, level, lessons')
        .or('is_public.eq.true,is_custom.eq.false')
        .order('title');

      if (error) throw error;
      setTracks(data || []);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrack) return;

    await onAssign(selectedTrack, dueDate || undefined);
    setSelectedTrack(null);
    setDueDate('');
    onOpenChange(false);
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'iniciante':
      case 'novo':
        return 'bg-green-500/10 text-green-600 border-green-500/30';
      case 'intermediário':
      case 'crescimento':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'avançado':
      case 'lider':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/30';
    }
  };

  const availableTracks = tracks.filter(t => !assignedTrackIds.includes(t.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Atribuir Trilha ao Grupo</DialogTitle>
          <DialogDescription>
            Selecione uma trilha para o grupo estudar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : availableTracks.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Todas as trilhas já foram atribuídas</p>
            </div>
          ) : (
            <>
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-2">
                  {availableTracks.map((track) => (
                    <Card 
                      key={track.id} 
                      className={`cursor-pointer transition-all ${
                        selectedTrack === track.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedTrack(track.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className={`h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0 ${
                            selectedTrack === track.id ? 'ring-2 ring-primary' : ''
                          }`}>
                            {selectedTrack === track.id ? (
                              <Check className="h-5 w-5 text-white" />
                            ) : (
                              <BookOpen className="h-5 w-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{track.title}</p>
                              <Badge variant="outline" className={getLevelColor(track.level)}>
                                {track.level}
                              </Badge>
                            </div>
                            {track.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                {track.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Prazo (opcional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedTrack || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Atribuindo...
                </>
              ) : (
                'Atribuir Trilha'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
