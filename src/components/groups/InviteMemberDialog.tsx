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
import { Label } from '@/components/ui/label';
import { Loader2, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteCode: string;
  groupName: string;
}

export const InviteMemberDialog = ({
  open,
  onOpenChange,
  inviteCode,
  groupName
}: InviteMemberDialogProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const inviteLink = `${window.location.origin}/entrar-grupo/${inviteCode}`;

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copiado!",
        description: type === 'code' ? "Código copiado para a área de transferência" : "Link copiado para a área de transferência"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Convidar Membros</DialogTitle>
          <DialogDescription>
            Compartilhe o código ou link abaixo para adicionar membros ao grupo "{groupName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Código de convite */}
          <div className="space-y-2">
            <Label>Código de Convite</Label>
            <div className="flex gap-2">
              <Input
                value={inviteCode.toUpperCase()}
                readOnly
                className="font-mono text-lg tracking-wider text-center"
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(inviteCode.toUpperCase(), 'code')}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Link de convite */}
          <div className="space-y-2">
            <Label>Link de Convite</Label>
            <div className="flex gap-2">
              <Input
                value={inviteLink}
                readOnly
                className="text-sm"
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(inviteLink, 'link')}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Dica:</strong> Compartilhe o código ou link com as pessoas que você deseja convidar. 
              Elas poderão entrar no grupo usando esse convite.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
