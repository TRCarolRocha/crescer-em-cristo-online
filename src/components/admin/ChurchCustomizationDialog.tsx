import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";

interface Church {
  id: string;
  name: string;
  logo_url: string | null;
  headline: string | null;
  description: string | null;
  primary_color: string;
  secondary_color: string;
}

interface ChurchCustomizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  church: Church;
  onSuccess?: () => void;
}

export const ChurchCustomizationDialog = ({
  open,
  onOpenChange,
  church,
  onSuccess,
}: ChurchCustomizationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: church.name,
    logo_url: church.logo_url || "",
    headline: church.headline || "",
    description: church.description || "",
    primary_color: church.primary_color,
    secondary_color: church.secondary_color,
  });

  useEffect(() => {
    setFormData({
      name: church.name,
      logo_url: church.logo_url || "",
      headline: church.headline || "",
      description: church.description || "",
      primary_color: church.primary_color,
      secondary_color: church.secondary_color,
    });
  }, [church]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("churches")
        .update({
          name: formData.name,
          logo_url: formData.logo_url || null,
          headline: formData.headline || null,
          description: formData.description || null,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
        })
        .eq("id", church.id);

      if (error) throw error;

      toast.success("Personalização salva com sucesso!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error updating church:", error);
      toast.error(error.message || "Erro ao salvar personalização");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personalizar Igreja</DialogTitle>
          <DialogDescription>
            Customize a aparência e informações da sua igreja
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Igreja</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Logo da Igreja</Label>
            <ImageUpload
              onImageUploaded={(url) => setFormData({ ...formData, logo_url: url })}
              selectedImage={formData.logo_url}
              onRemoveImage={() => setFormData({ ...formData, logo_url: "" })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="headline">Slogan/Headline</Label>
            <Input
              id="headline"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="Ex: Lugar de Refúgio e Aliança"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição da igreja..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary_color">Cor Secundária</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
