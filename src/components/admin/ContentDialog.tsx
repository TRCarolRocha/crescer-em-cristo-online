
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Video, FileText, BookOpen } from 'lucide-react';

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
    video_url: content?.video_url || '',
    texto: content?.texto || '',
    pdf_url: content?.pdf_url || ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar se pelo menos um tipo de conteúdo foi preenchido
    const hasVideo = formData.video_url.trim() !== '';
    const hasText = formData.texto.trim() !== '';
    const hasPdf = formData.pdf_url.trim() !== '';

    if (!hasVideo && !hasText && !hasPdf) {
      toast({
        title: "Erro de Validação",
        description: "É necessário preencher pelo menos um tipo de conteúdo (vídeo, texto ou PDF)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const dataToSave = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        ordem: formData.ordem,
        trilha_id: trilhaId,
        // Salvar apenas os campos preenchidos
        video_url: hasVideo ? formData.video_url : null,
        texto: hasText ? formData.texto : null,
        pdf_url: hasPdf ? formData.pdf_url : null
      };

      if (content?.id) {
        const { error } = await supabase
          .from('conteudos')
          .update(dataToSave)
          .eq('id', content.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Conteúdo atualizado com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('conteudos')
          .insert([dataToSave]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Conteúdo criado com sucesso"
        });
      }

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{content?.id ? 'Editar Conteúdo' : 'Novo Conteúdo'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
            
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
                placeholder="Digite o título do conteúdo"
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
                placeholder="Descrição breve do conteúdo"
              />
            </div>

            <div>
              <Label htmlFor="ordem">Ordem *</Label>
              <Input
                id="ordem"
                type="number"
                min="1"
                value={formData.ordem}
                onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          </div>

          <Separator />

          {/* Seção de Vídeo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Vídeo (Opcional)</h3>
            </div>
            
            <div>
              <Label htmlFor="video_url">URL do Vídeo</Label>
              <Input
                id="video_url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Cole aqui o link do YouTube, Vimeo ou outra plataforma de vídeo
              </p>
            </div>
          </div>

          <Separator />

          {/* Seção de Texto */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Conteúdo de Texto (Opcional)</h3>
            </div>
            
            <div>
              <Label htmlFor="texto">Texto da Lição</Label>
              <Textarea
                id="texto"
                value={formData.texto}
                onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
                rows={8}
                placeholder="Digite o conteúdo textual da lição..."
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Este texto será exibido como material de estudo
              </p>
            </div>
          </div>

          <Separator />

          {/* Seção de PDF */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Material PDF (Opcional)</h3>
            </div>
            
            <div>
              <Label htmlFor="pdf_url">URL do PDF</Label>
              <Input
                id="pdf_url"
                value={formData.pdf_url}
                onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                placeholder="https://exemplo.com/arquivo.pdf"
              />
              <p className="text-xs text-gray-500 mt-1">
                Link direto para download do material complementar em PDF
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Você pode preencher um, dois ou todos os tipos de conteúdo. 
              É obrigatório preencher pelo menos um tipo (vídeo, texto ou PDF).
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Conteúdo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContentDialog;
