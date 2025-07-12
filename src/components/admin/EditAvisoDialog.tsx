
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Aviso {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  ativo: boolean;
  ordem: number;
  imagem_url: string;
}

interface EditAvisoDialogProps {
  aviso: Aviso;
  onClose: () => void;
  onSuccess: () => void;
}

const EditAvisoDialog: React.FC<EditAvisoDialogProps> = ({ aviso, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    titulo: aviso.titulo || '',
    descricao: aviso.descricao || '',
    categoria: aviso.categoria || '',
    imagem_url: aviso.imagem_url || '',
    ativo: aviso.ativo,
    ordem: aviso.ordem || 1
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Salvando aviso:', aviso.id, 'com dados:', formData);

      const updateData = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        categoria: formData.categoria,
        imagem_url: formData.imagem_url,
        ativo: formData.ativo,
        ordem: formData.ordem,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('avisos')
        .update(updateData)
        .eq('id', aviso.id)
        .select();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Aviso atualizado com sucesso:', data);

      toast({
        title: "Sucesso",
        description: "Aviso atualizado com sucesso"
      });

      onSuccess();
    } catch (error) {
      console.error('Erro ao atualizar aviso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o aviso",
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
          <DialogTitle>Editar Aviso</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                id="categoria"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="ordem">Ordem</Label>
              <Input
                id="ordem"
                type="number"
                value={formData.ordem}
                onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="imagem_url">URL da Imagem</Label>
            <Input
              id="imagem_url"
              value={formData.imagem_url}
              onChange={(e) => setFormData({ ...formData, imagem_url: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
            />
            <Label htmlFor="ativo">Ativo</Label>
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

export default EditAvisoDialog;
