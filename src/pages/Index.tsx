
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, BookOpen, Heart, MessageSquare, Phone, Mail, Clock, Star } from "lucide-react";
import ChurchHeader from "@/components/ChurchHeader";
import StatsSection from "@/components/StatsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CarrosselAvisos from "@/components/CarrosselAvisos";
import AvisosDestaque from "@/components/AvisosDestaque";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('agenda_eventos')
        .select('*')
        .gte('data_inicio', today)
        .eq('status', true)
        .order('data_inicio', { ascending: true })
        .limit(3);

      if (error) throw error;
      setUpcomingEvents(data || []);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ChurchHeader />
      
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Avisos em Carrossel */}
        <section>
          <CarrosselAvisos />
        </section>

        {/* Avisos em Destaque */}
        <section>
          <AvisosDestaque />
        </section>

        {/* Seção de Ações Rápidas */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate('/devocional')}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Devocional Diário</h3>
              <p className="text-gray-600 text-sm">Momento de reflexão e crescimento espiritual</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate('/trilhas')}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Trilhas de Discipulado</h3>
              <p className="text-gray-600 text-sm">Caminhos estruturados para seu crescimento</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate('/diagnostico')}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Diagnóstico Espiritual</h3>
              <p className="text-gray-600 text-sm">Descubra seu momento espiritual atual</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate('/fale-com-lideranca')}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fale com a Liderança</h3>
              <p className="text-gray-600 text-sm">Entre em contato conosco</p>
            </CardContent>
          </Card>
        </section>

        {/* Agenda da Igreja */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent">
              Agenda da Igreja
            </h2>
            <Button variant="outline" onClick={() => navigate('/agenda')}>
              Ver Agenda Completa
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!loading && upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        {formatDate(event.data_inicio)}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{event.titulo}</CardTitle>
                    <CardDescription>{event.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      {event.local && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.local}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum evento programado no momento</p>
              </div>
            )}
          </div>
        </section>

        {/* Estatísticas */}
        <StatsSection />

        {/* Testemunhos */}
        <TestimonialsSection />

        {/* Contato */}
        <section className="bg-white/80 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent">
            Entre em Contato
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <span>(21) 99999-9999</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <span>contato@montehebrom.com.br</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>Rua das Flores, 123 - Ibamonte, RJ</span>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Horários de Culto</h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4" />
                  <span>Domingo: 9h e 19h</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4" />
                  <span>Quarta-feira: 19h30</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4" />
                  <span>Sexta-feira: 19h30</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
