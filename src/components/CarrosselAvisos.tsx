
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, BookOpen, Gift, Users, Coffee, PartyPopper } from 'lucide-react';
import Autoplay from "embla-carousel-autoplay";

interface Aviso {
  id: string;
  titulo: string;
  descricao: string;
  imagem_url?: string;
  categoria: string;
  ordem: number;
}

const CarrosselAvisos = () => {
  const { user } = useAuth();
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAviso, setSelectedAviso] = useState<Aviso | null>(null);

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
      case 'culto': case 'cultos': return <Calendar className="h-4 w-4" />;
      case 'estudo': case 'estudos': return <BookOpen className="h-4 w-4" />;
      case 'sorteio': return <Gift className="h-4 w-4" />;
      case 'saída': case 'saídas': return <Users className="h-4 w-4" />;
      case 'cantina': return <Coffee className="h-4 w-4" />;
      case 'evento': case 'eventos': return <PartyPopper className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'culto': case 'cultos': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'estudo': case 'estudos': return 'bg-green-100 text-green-800 border-green-200';
      case 'sorteio': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'saída': case 'saídas': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cantina': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'evento': case 'eventos': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAvisoClick = (aviso: Aviso) => {
    if (user) {
      setSelectedAviso(aviso);
    }
  };

  if (loading) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
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
    <>
      <div className="py-8 md:py-16 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Avisos em Destaque</h2>
            <p className="text-sm sm:text-base md:text-xl text-gray-600">Fique por dentro das novidades da nossa igreja</p>
            {!user && (
              <p className="text-xs sm:text-sm text-blue-600 mt-2">
                Faça login para ver mais detalhes dos avisos
              </p>
            )}
          </div>

          <Carousel 
            className="w-full max-w-5xl mx-auto"
            plugins={[
              Autoplay({
                delay: 4000,
                stopOnInteraction: true,
              }),
            ]}
          >
            <CarouselContent>
              {avisos.map((aviso) => (
                <CarouselItem key={aviso.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card 
                    className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                    onClick={() => handleAvisoClick(aviso)}
                  >
                    {aviso.imagem_url && (
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img 
                          src={aviso.imagem_url} 
                          alt={aviso.titulo}
                          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className={`${getCategoryColor(aviso.categoria)} border`}>
                            <div className="flex items-center gap-1">
                              {getCategoryIcon(aviso.categoria)}
                              <span className="font-medium">{aviso.categoria}</span>
                            </div>
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    <CardContent className="p-4">
                      {!aviso.imagem_url && (
                        <div className="mb-3">
                          <Badge className={getCategoryColor(aviso.categoria)}>
                            <div className="flex items-center gap-1">
                              {getCategoryIcon(aviso.categoria)}
                              <span>{aviso.categoria}</span>
                            </div>
                          </Badge>
                        </div>
                      )}
                      
                      <h3 className="font-semibold text-lg mb-2 text-gray-900 line-clamp-2">
                        {aviso.titulo}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {aviso.descricao}
                      </p>
                      
                      {!user && (
                        <div className="mt-3 text-xs text-blue-600 font-medium">
                          Clique para ver detalhes (login necessário)
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </div>

      {/* Modal de Detalhes (só aparece se usuário estiver logado) */}
      {selectedAviso && user && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedAviso(null)}
        >
          <Card 
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedAviso.imagem_url && (
              <div className="relative">
                <img 
                  src={selectedAviso.imagem_url} 
                  alt={selectedAviso.titulo}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                <button
                  onClick={() => setSelectedAviso(null)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-all"
                >
                  ×
                </button>
              </div>
            )}
            <CardContent className="p-6">
              {!selectedAviso.imagem_url && (
                <div className="flex justify-between items-start mb-4">
                  <Badge className={getCategoryColor(selectedAviso.categoria)}>
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(selectedAviso.categoria)}
                      <span>{selectedAviso.categoria}</span>
                    </div>
                  </Badge>
                  <button
                    onClick={() => setSelectedAviso(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
              )}
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedAviso.titulo}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {selectedAviso.descricao}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default CarrosselAvisos;
