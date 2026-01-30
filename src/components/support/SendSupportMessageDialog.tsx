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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, Loader2, Headphones } from 'lucide-react';

interface SendSupportMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (subject: string, content: string) => Promise<void>;
  isLoading?: boolean;
}

export const SendSupportMessageDialog = ({
  open,
  onOpenChange,
  onSend,
  isLoading = false
}: SendSupportMessageDialogProps) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;

    await onSend(subject.trim(), content.trim());
    setSubject('');
    setContent('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#7b2ff7] to-[#f107a3] flex items-center justify-center">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle>Falar com Suporte Hodos</DialogTitle>
              <DialogDescription>
                Envie sua dúvida ou solicitação diretamente para nossa equipe
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto</Label>
            <Input
              id="subject"
              placeholder="Ex: Dúvida sobre meu plano"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Descreva sua dúvida ou solicitação..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px]"
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
            <Button 
              type="submit" 
              disabled={!subject.trim() || !content.trim() || isLoading}
              className="bg-gradient-to-r from-[#7b2ff7] to-[#f107a3] hover:opacity-90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
