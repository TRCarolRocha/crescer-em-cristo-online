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
import { useEmailTemplates } from '@/hooks/useEmailTemplates';

const templateSchema = z.object({
  subject: z.string().min(5, 'Assunto deve ter pelo menos 5 caracteres'),
  html_content: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres'),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface EmailTemplateEditorProps {
  template: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  template,
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const { updateTemplate } = useEmailTemplates();
  const { register, handleSubmit, formState: { errors } } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      subject: template.subject,
      html_content: template.html_content,
    },
  });

  const onSubmit = async (data: TemplateFormData) => {
    try {
      await updateTemplate({
        id: template.id,
        subject: data.subject,
        html_content: data.html_content,
      });

      toast({
        title: 'Template atualizado!',
        description: 'O template de email foi salvo com sucesso.',
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const variables = JSON.parse(template.variables as string);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Template de Email</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto do Email</Label>
            <Input id="subject" {...register('subject')} />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="html_content">Conteúdo HTML</Label>
            <Textarea
              id="html_content"
              {...register('html_content')}
              rows={15}
              className="font-mono text-sm"
            />
            {errors.html_content && (
              <p className="text-sm text-destructive">{errors.html_content.message}</p>
            )}
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Variáveis Disponíveis:</p>
            <div className="flex flex-wrap gap-2">
              {variables.map((v: string) => (
                <code key={v} className="bg-background px-2 py-1 rounded text-xs">
                  {`{{${v}}}`}
                </code>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Template</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
