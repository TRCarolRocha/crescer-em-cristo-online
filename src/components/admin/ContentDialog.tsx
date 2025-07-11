
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Content {
  id?: string;
  titulo: string;
  descricao: string;
  ordem: number;
  pdf_url?: string;
  video_url?: string;
  texto?: string;
  trilha_id: string;
}

interface ContentDialogProps {
  content?: Content;
  trilhaId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ContentDialog: React.FC<ContentDialogProps> = ({ content, trilhaId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    titulo: content?.titulo || '',
    descricao: content?.descricao || '',
    ordem: content?.ordem || 1,
    pdf_url: content?.pdf_url || '',
    video_url: content?.video_url || '',
    texto: content?.texto || '',
    tipo: content?.video_url ? 'video' : content?.pdf_url ? 'pdf' : 'texto'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        ordem: formData.ordem,
        trilha_id: trilhaId,
        pdf_url: formData.tipo === 'pdf' ? formData.pdf_url : null,
        video_url: formData.tipo === 'video' ? formData.video_url : null,
        texto: formData.tipo === 'texto' ? formData.texto : null
      };

      if (content?.id) {
        const { error } = await supabase
          .from('conteudos')
          .update(dataToSave)
          .eq('id', content.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('conteudos')
          .insert([dataToSave]);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: content?.id ? "Conteúdo atualizado com sucesso" : "Conteúdo criado com sucesso"
      });

      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o conteúdo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{content?.id ? 'Editar Conteúdo' : 'Novo Conteúdo'}</DialogTitle>
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
              <Label htmlFor="ordem">Ordem</Label>
              <Input
                id="ordem"
                type="number"
                value={formData.ordem}
                onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="tipo">Tipo de Conteúdo</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="texto">Texto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.tipo === 'video' && (
            <div>
              <Label htmlFor="video_url">URL do Vídeo</Label>
              <Input
                id="video_url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          )}

          {formData.tipo === 'pdf' && (
            <div>
              <Label htmlFor="pdf_url">URL do PDF</Label>
              <Input
                id="pdf_url"
                value={formData.pdf_url}
                onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                placeholder="https://exemplo.com/arquivo.pdf"
              />
            </div>
          )}

          {formData.tipo === 'texto' && (
            <div>
              <Label htmlFor="texto">Conteúdo do Texto</Label>
              <Textarea
                id="texto"
                value={formData.texto}
                onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
                rows={6}
                placeholder="Digite o conteúdo da lição..."
              />
            </div>
          )}

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

export default ContentDialog;
