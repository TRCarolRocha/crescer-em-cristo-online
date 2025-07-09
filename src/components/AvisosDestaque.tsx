
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, BookOpen, Gift, Users } from 'lucide-react';

interface Aviso {
  id: string;
  titulo: string;
  descricao: string;
  imagem_url?: string;
  categoria: string;
  ordem: number;
}

const AvisosDestaque = () => {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvisos();
  }, []);

  const fetchAvisos = async () => {
    try {
      const { data, error } = await supabase
        .from('avisos')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw error;
      setAvisos(data || []);
    } catch (error) {
      console.error('Erro ao carregar avisos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'culto': return <Calendar className="h-5 w-5" />;
      case 'estudo': return <BookOpen className="h-5 w-5" />;
      case 'sorteio': return <Gift className="h-5 w-5" />;
      case 'saída': return <Users className="h-5 w-5" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'culto': return 'bg-blue-100 text-blue-800';
      case 'estudo': return 'bg-green-100 text-green-800';
      case 'sorteio': return 'bg-purple-100 text-purple-800';
      case 'saída': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Avisos em Destaque</h2>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (avisos.length === 0) {
    return null;
  }

  return (
    <div className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Avisos em Destaque</h2>
          <p className="text-xl text-gray-600">Fique por dentro das novidades da nossa igreja</p>
        </div>

        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {avisos.map((aviso) => (
              <CarouselItem key={aviso.id} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getCategoryColor(aviso.categoria)}>
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(aviso.categoria)}
                          <span>{aviso.categoria}</span>
                        </div>
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{aviso.titulo}</CardTitle>
                    <CardDescription>{aviso.descricao}</CardDescription>
                  </CardHeader>
                  {aviso.imagem_url && (
                    <CardContent>
                      <img 
                        src={aviso.imagem_url} 
                        alt={aviso.titulo}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </CardContent>
                  )}
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export default AvisosDestaque;
