import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomTracks } from '@/hooks/useCustomTracks';

interface CreateCustomTrackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateCustomTrackDialog = ({ open, onOpenChange }: CreateCustomTrackDialogProps) => {
  const { createTrack } = useCustomTracks();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'novo',
    difficulty: 'iniciante',
    visibility: 'private' as 'private' | 'shared' | 'public',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createTrack.mutateAsync(formData);
    
    // Reset form and close dialog
    setFormData({
      title: '',
      description: '',
      level: 'novo',
      difficulty: 'iniciante',
      visibility: 'private',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Trilha Personalizada</DialogTitle>
          <DialogDescription>
            Crie sua própria trilha de estudos com conteúdos personalizados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Trilha *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Minha Jornada de Fé"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o objetivo desta trilha..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Nível</Label>
              <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="crescimento">Crescimento</SelectItem>
                  <SelectItem value="lider">Líder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Dificuldade</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibilidade</Label>
            <Select 
              value={formData.visibility} 
              onValueChange={(value: 'private' | 'shared' | 'public') => setFormData({ ...formData, visibility: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Privada (Apenas você)</SelectItem>
                <SelectItem value="shared">Compartilhada (Sua igreja)</SelectItem>
                <SelectItem value="public">Pública (Todos)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createTrack.isPending}>
              {createTrack.isPending ? 'Criando...' : 'Criar Trilha'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
