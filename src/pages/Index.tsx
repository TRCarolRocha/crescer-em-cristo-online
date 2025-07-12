
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ChurchHeader from '@/components/ChurchHeader';
import AvisosDestaque from '@/components/AvisosDestaque';
import TestimonialsSection from '@/components/TestimonialsSection';
import StatsSection from '@/components/StatsSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, BookOpen, Heart, MessageSquare, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AgendaEvento {
  id: string;
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  local: string;
  status: boolean;
}

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState<AgendaEvento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEventos();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('agenda_eventos')
        .select('*')
        .eq('status', true)
        .gte('data_inicio', new Date().toISOString().split('T')[0])
        .order('data_inicio', { ascending: true })
        .limit(3);

      if (error) throw error;
      setEventos(data || []);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ChurchHeader />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Bem-vindo à Igreja Monte Hebrom
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Um lugar de fé, esperança e amor. Junte-se à nossa comunidade e cresça espiritualmente conosco.
          </p>
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-3">
                <User className="mr-2 h-5 w-5" />
                Entrar na Comunidade
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/diagnostico-publico')} className="text-lg px-8 py-3">
                <BookOpen className="mr-2 h-5 w-5" />
                Começar Diagnóstico
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Button size="lg" onClick={() => navigate('/devocional')} className="text-lg px-6 py-3">
                <Heart className="mr-2 h-5 w-5" />
                Devocional Diário
              </Button>
              <Button size="lg" onClick={() => navigate('/trilhas')} className="text-lg px-6 py-3">
                <BookOpen className="mr-2 h-5 w-5" />
                Trilhas de Estudo
              </Button>
              <Button size="lg" onClick={() => navigate('/diagnostico')} className="text-lg px-6 py-3">
                <Users className="mr-2 h-5 w-5" />
                Diagnóstico Espiritual
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Avisos em Destaque */}
      <AvisosDestaque />

      {/* Agenda da Igreja - Apenas para usuários logados */}
      {user && (
        <section className="py-16 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Agenda da Igreja</h2>
              <p className="text-lg text-gray-600">Próximos eventos e atividades</p>
            </div>

            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : eventos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventos.map((evento) => (
                  <Card key={evento.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <Calendar className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          {formatDate(evento.data_inicio)}
                          {evento.data_fim && evento.data_fim !== evento.data_inicio && (
                            <> até {formatDate(evento.data_fim)}</>
                          )}
                        </span>
                      </div>
                      <CardTitle className="text-xl">{evento.titulo}</CardTitle>
                      <CardDescription>{evento.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {evento.local && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{evento.local}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum evento próximo
                </h3>
                <p className="text-gray-600">
                  Novos eventos serão anunciados em breve
                </p>
              </div>
            )}

            <div className="text-center mt-8">
              <Button asChild variant="outline">
                <Link to="/agenda">Ver Agenda Completa</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Features para usuários logados */}
      {user && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Recursos da Comunidade</h2>
              <p className="text-lg text-gray-600">Ferramentas para seu crescimento espiritual</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/devocional')}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Devocional Diário</h3>
                  <p className="text-gray-600 text-sm">Reflexões diárias para fortalecer sua fé</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/trilhas')}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Trilhas de Estudo</h3>
                  <p className="text-gray-600 text-sm">Estudos estruturados para aprofundar conhecimento</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/comunicacao')}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Comunicação</h3>
                  <p className="text-gray-600 text-sm">Conecte-se com outros membros da igreja</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/membros')}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Membros</h3>
                  <p className="text-gray-600 text-sm">Conheça outros membros da comunidade</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Stats */}
      <StatsSection />
    </div>
  );
};

export default Index;
