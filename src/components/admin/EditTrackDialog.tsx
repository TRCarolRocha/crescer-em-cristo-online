
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface EditTrackDialogProps {
  track: Track;
  onClose: () => void;
  onSuccess: () => void;
}

const EditTrackDialog: React.FC<EditTrackDialogProps> = ({ track, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: track.title || '',
    description: track.description || '',
    level: track.level || '',
    lessons: track.lessons || 0,
    duration: track.duration || '',
    difficulty: track.difficulty || ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('discipleship_tracks')
        .update(formData)
        .eq('id', track.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Trilha atualizada com sucesso"
      });

      onSuccess();
    } catch (error) {
      console.error('Erro ao atualizar trilha:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a trilha",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Trilha</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="level">Nível</Label>
              <Input
                id="level"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="lessons">Número de Lições</Label>
              <Input
                id="lessons"
                type="number"
                value={formData.lessons}
                onChange={(e) => setFormData({ ...formData, lessons: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duração</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="difficulty">Dificuldade</Label>
              <Input
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTrackDialog;
