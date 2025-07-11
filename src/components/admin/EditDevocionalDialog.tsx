
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Devocional {
  id: string;
  tema: string;
  data: string;
  versiculo: string;
  referencia: string;
  texto_central: string;
  pergunta_1: string;
  pergunta_2: string;
  pergunta_3: string;
}

interface EditDevocionalDialogProps {
  devocional: Devocional;
  onClose: () => void;
  onSuccess: () => void;
}

const EditDevocionalDialog: React.FC<EditDevocionalDialogProps> = ({ devocional, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    data: devocional.data || '',
    tema: devocional.tema || '',
    texto_central: devocional.texto_central || '',
    versiculo: devocional.versiculo || '',
    referencia: devocional.referencia || '',
    pergunta_1: devocional.pergunta_1 || '',
    pergunta_2: devocional.pergunta_2 || '',
    pergunta_3: devocional.pergunta_3 || ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('devocionais')
        .update(formData)
        .eq('id', devocional.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Devocional atualizado com sucesso"
      });

      onSuccess();
    } catch (error) {
      console.error('Erro ao atualizar devocional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o devocional",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Devocional</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="tema">Tema</Label>
              <Input
                id="tema"
                value={formData.tema}
                onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="texto_central">Texto Central</Label>
            <Textarea
              id="texto_central"
              value={formData.texto_central}
              onChange={(e) => setFormData({ ...formData, texto_central: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="versiculo">Versículo</Label>
              <Textarea
                id="versiculo"
                value={formData.versiculo}
                onChange={(e) => setFormData({ ...formData, versiculo: e.target.value })}
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="referencia">Referência</Label>
              <Input
                id="referencia"
                value={formData.referencia}
                onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="pergunta_1">Pergunta de Reflexão 1</Label>
              <Textarea
                id="pergunta_1"
                value={formData.pergunta_1}
                onChange={(e) => setFormData({ ...formData, pergunta_1: e.target.value })}
                rows={2}
                required
              />
            </div>
            <div>
              <Label htmlFor="pergunta_2">Pergunta de Reflexão 2</Label>
              <Textarea
                id="pergunta_2"
                value={formData.pergunta_2}
                onChange={(e) => setFormData({ ...formData, pergunta_2: e.target.value })}
                rows={2}
                required
              />
            </div>
            <div>
              <Label htmlFor="pergunta_3">Pergunta de Reflexão 3</Label>
              <Textarea
                id="pergunta_3"
                value={formData.pergunta_3}
                onChange={(e) => setFormData({ ...formData, pergunta_3: e.target.value })}
                rows={2}
                required
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

export default EditDevocionalDialog;
