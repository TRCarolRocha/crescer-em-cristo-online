import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  level: z.string().min(1, 'Nível é obrigatório'),
  duration: z.string().optional(),
  difficulty: z.string().optional(),
  topics: z.string().optional(), // Comma-separated
});

type FormData = z.infer<typeof schema>;

interface CreatePublicTrackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePublicTrackDialog: React.FC<CreatePublicTrackDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [level, setLevel] = React.useState('novo');
  const [difficulty, setDifficulty] = React.useState('iniciante');
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      level: 'novo',
      difficulty: 'iniciante',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const topicsArray = data.topics ? data.topics.split(',').map(t => t.trim()) : [];
      
      const { error } = await supabase.from('discipleship_tracks').insert({
        title: data.title,
        description: data.description || null,
        level: data.level,
        duration: data.duration || null,
        difficulty: data.difficulty || null,
        topics: topicsArray,
        is_public: true,
        church_id: null,
        allowed_levels: ['novo', 'crescimento', 'lider'],
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Trilha criada!',
        description: 'Trilha pública criada com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['public-tracks'] });
      reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Trilha Pública</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register('description')} />
          </div>

          <div>
            <Label htmlFor="level">Nível</Label>
            <Select
              value={level}
              onValueChange={(value) => {
                setLevel(value);
                setValue('level', value);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="crescimento">Crescimento</SelectItem>
                <SelectItem value="lider">Líder</SelectItem>
              </SelectContent>
            </Select>
            {errors.level && <p className="text-sm text-destructive">{errors.level.message}</p>}
          </div>

          <div>
            <Label htmlFor="duration">Duração</Label>
            <Input id="duration" {...register('duration')} placeholder="Ex: 4 semanas" />
          </div>

          <div>
            <Label htmlFor="difficulty">Dificuldade</Label>
            <Select
              value={difficulty}
              onValueChange={(value) => {
                setDifficulty(value);
                setValue('difficulty', value);
              }}
            >
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

          <div>
            <Label htmlFor="topics">Tópicos (separados por vírgula)</Label>
            <Input id="topics" {...register('topics')} placeholder="Ex: Oração, Fé, Santidade" />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Criando...' : 'Criar Trilha'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
