import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, Loader2 } from 'lucide-react';
import { SupportMessage } from '@/hooks/useSupportMessages';

interface ReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: SupportMessage | null;
  onReply: (parentId: string, content: string) => Promise<void>;
  isLoading?: boolean;
}

export const ReplyDialog = ({
  open,
  onOpenChange,
  message,
  onReply,
  isLoading = false
}: ReplyDialogProps) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !content.trim()) return;

    await onReply(message.id, content.trim());
    setContent('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Responder Mensagem</DialogTitle>
          <DialogDescription>
            Responda à mensagem de {message?.remetente?.full_name || 'usuário'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mensagem Original */}
          {message && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Mensagem original:
              </p>
              {message.subject && (
                <p className="font-semibold text-sm mb-1">{message.subject}</p>
              )}
              <p className="text-sm text-muted-foreground">{message.conteudo}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reply">Sua resposta</Label>
            <Textarea
              id="reply"
              placeholder="Digite sua resposta..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!content.trim() || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Resposta
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
