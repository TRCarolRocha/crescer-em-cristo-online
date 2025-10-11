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
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  data: z.string().min(1, 'Data é obrigatória'),
  tema: z.string().min(1, 'Tema é obrigatório'),
  versiculo: z.string().min(1, 'Versículo é obrigatório'),
  referencia: z.string().min(1, 'Referência é obrigatória'),
  texto_central: z.string().min(1, 'Texto central é obrigatório'),
  pergunta_1: z.string().min(1, 'Pergunta 1 é obrigatória'),
  pergunta_2: z.string().min(1, 'Pergunta 2 é obrigatória'),
  pergunta_3: z.string().min(1, 'Pergunta 3 é obrigatória'),
});

type FormData = z.infer<typeof schema>;

interface CreatePublicDevotionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePublicDevotionalDialog: React.FC<CreatePublicDevotionalDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase.from('devocionais').insert({
        ...data,
        is_public: true,
        church_id: null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Devocional criado!',
        description: 'Devocional público criado com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['public-devocionais'] });
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
          <DialogTitle>Criar Devocional Público</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="data">Data</Label>
            <Input id="data" type="date" {...register('data')} />
            {errors.data && <p className="text-sm text-destructive">{errors.data.message}</p>}
          </div>

          <div>
            <Label htmlFor="tema">Tema</Label>
            <Input id="tema" {...register('tema')} />
            {errors.tema && <p className="text-sm text-destructive">{errors.tema.message}</p>}
          </div>

          <div>
            <Label htmlFor="versiculo">Versículo</Label>
            <Textarea id="versiculo" {...register('versiculo')} />
            {errors.versiculo && <p className="text-sm text-destructive">{errors.versiculo.message}</p>}
          </div>

          <div>
            <Label htmlFor="referencia">Referência</Label>
            <Input id="referencia" {...register('referencia')} placeholder="Ex: João 3:16" />
            {errors.referencia && <p className="text-sm text-destructive">{errors.referencia.message}</p>}
          </div>

          <div>
            <Label htmlFor="texto_central">Texto Central</Label>
            <Textarea id="texto_central" {...register('texto_central')} rows={5} />
            {errors.texto_central && <p className="text-sm text-destructive">{errors.texto_central.message}</p>}
          </div>

          <div>
            <Label htmlFor="pergunta_1">Pergunta 1</Label>
            <Input id="pergunta_1" {...register('pergunta_1')} />
            {errors.pergunta_1 && <p className="text-sm text-destructive">{errors.pergunta_1.message}</p>}
          </div>

          <div>
            <Label htmlFor="pergunta_2">Pergunta 2</Label>
            <Input id="pergunta_2" {...register('pergunta_2')} />
            {errors.pergunta_2 && <p className="text-sm text-destructive">{errors.pergunta_2.message}</p>}
          </div>

          <div>
            <Label htmlFor="pergunta_3">Pergunta 3</Label>
            <Input id="pergunta_3" {...register('pergunta_3')} />
            {errors.pergunta_3 && <p className="text-sm text-destructive">{errors.pergunta_3.message}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Criando...' : 'Criar Devocional'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
