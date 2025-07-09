
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Video, FileText, ChevronRight } from 'lucide-react';

interface Conteudo {
  id: string;
  titulo: string;
  descricao: string;
  texto: string;
  video_url?: string;
  pdf_url?: string;
  ordem: number;
}

interface ConteudoTrilhaProps {
  trilhaId: string;
  trilhaTitulo: string;
}

const ConteudoTrilha = ({ trilhaId, trilhaTitulo }: ConteudoTrilhaProps) => {
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [conteudoSelecionado, setConteudoSelecionado] = useState<Conteudo | null>(null);

  useEffect(() => {
    fetchConteudos();
  }, [trilhaId]);

  const fetchConteudos = async () => {
    try {
      const { data, error } = await supabase
        .from('conteudos')
        .select('*')
        .eq('trilha_id', trilhaId)
        .order('ordem', { ascending: true });

      if (error) throw error;
      setConteudos(data || []);
      if (data && data.length > 0) {
        setConteudoSelecionado(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (conteudos.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Nenhum conteúdo disponível para esta trilha ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{trilhaTitulo}</h2>
        <p className="text-gray-600">Conteúdo estruturado para seu crescimento espiritual</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Lista de conteúdos */}
        <div className="lg:col-span-1">
          <h3 className="font-semibold text-gray-900 mb-3">Módulos</h3>
          <div className="space-y-2">
            {conteudos.map((conteudo) => (
              <Button
                key={conteudo.id}
                variant={conteudoSelecionado?.id === conteudo.id ? "default" : "ghost"}
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => setConteudoSelecionado(conteudo)}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {conteudo.ordem}
                  </Badge>
                  <span className="truncate">{conteudo.titulo}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Conteúdo selecionado */}
        <div className="lg:col-span-3">
          {conteudoSelecionado && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>Módulo {conteudoSelecionado.ordem}</Badge>
                </div>
                <CardTitle className="text-xl">{conteudoSelecionado.titulo}</CardTitle>
                <CardDescription>{conteudoSelecionado.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Vídeo */}
                {conteudoSelecionado.video_url && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Video className="h-4 w-4" />
                      Vídeo Explicativo
                    </div>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <iframe
                        src={conteudoSelecionado.video_url}
                        className="w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                        title={conteudoSelecionado.titulo}
                      />
                    </div>
                  </div>
                )}

                {/* Texto */}
                {conteudoSelecionado.texto && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <BookOpen className="h-4 w-4" />
                      Conteúdo de Estudo
                    </div>
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {conteudoSelecionado.texto}
                      </div>
                    </div>
                  </div>
                )}

                {/* PDF */}
                {conteudoSelecionado.pdf_url && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <FileText className="h-4 w-4" />
                      Material Complementar
                    </div>
                    <Button variant="outline" asChild>
                      <a 
                        href={conteudoSelecionado.pdf_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Baixar PDF
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConteudoTrilha;
