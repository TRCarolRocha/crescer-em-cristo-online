import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const planSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  price_monthly: z.number().min(0, 'Preço deve ser positivo'),
  max_members: z.number().optional(),
  max_admins: z.number().optional(),
});

type PlanFormData = z.infer<typeof planSchema>;

interface EditPlanDialogProps {
  plan: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPlanDialog: React.FC<EditPlanDialogProps> = ({
  plan,
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: plan.name,
      description: plan.description || '',
      price_monthly: Number(plan.price_monthly),
      max_members: plan.max_members || undefined,
      max_admins: plan.max_admins || undefined,
    },
  });

  const onSubmit = async (data: PlanFormData) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update(data)
        .eq('id', plan.id);

      if (error) throw error;

      toast({
        title: 'Plano atualizado!',
        description: 'As alterações foram salvas com sucesso.',
      });

      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Plano: {plan.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Plano</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...register('description')} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_monthly">Preço Mensal (R$)</Label>
              <Input
                id="price_monthly"
                type="number"
                step="0.01"
                {...register('price_monthly', { valueAsNumber: true })}
              />
              {errors.price_monthly && (
                <p className="text-sm text-destructive">{errors.price_monthly.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_members">Máx. Membros</Label>
              <Input
                id="max_members"
                type="number"
                {...register('max_members', { valueAsNumber: true })}
                placeholder="Ilimitado"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_admins">Máx. Admins</Label>
              <Input
                id="max_admins"
                type="number"
                {...register('max_admins', { valueAsNumber: true })}
                placeholder="Ilimitado"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
