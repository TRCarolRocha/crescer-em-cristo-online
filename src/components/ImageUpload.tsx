
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  selectedImage: string | null;
  onRemoveImage: () => void;
}

const ImageUpload = ({ onImageUploaded, selectedImage, onRemoveImage }: ImageUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('message-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('message-images')
        .getPublicUrl(fileName);

      onImageUploaded(urlData.publicUrl);
      
      toast({
        title: "Sucesso!",
        description: "Imagem carregada com sucesso."
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da imagem.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {selectedImage ? (
        <div className="relative">
          <img
            src={selectedImage}
            alt="Imagem selecionada"
            className="max-w-full h-auto max-h-64 rounded-lg object-cover"
          />
          <Button
            onClick={onRemoveImage}
            size="sm"
            variant="destructive"
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          variant="outline"
          size="sm"
          className="text-gray-600 hover:text-blue-600"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          {uploading ? "Carregando..." : "Adicionar Foto"}
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;
