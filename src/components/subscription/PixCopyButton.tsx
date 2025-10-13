import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface PixCopyButtonProps {
  pixCode: string;
}

export const PixCopyButton: React.FC<PixCopyButtonProps> = ({ pixCode }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast({
        title: 'Código copiado!',
        description: 'Cole no seu app de pagamentos'
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Tente selecionar e copiar manualmente',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="bg-muted rounded-lg p-4 space-y-2">
      <p className="text-sm font-semibold">Pix Copia e Cola:</p>
      <div className="flex gap-2">
        <Input 
          value={pixCode}
          readOnly
          className="font-mono text-xs"
        />
        <Button 
          size="sm"
          onClick={copyToClipboard}
          variant={copied ? "default" : "outline"}
          className="shrink-0"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
