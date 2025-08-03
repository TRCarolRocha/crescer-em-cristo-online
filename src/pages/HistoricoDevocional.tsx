
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Calendar, CheckCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DevocionalHistorico {
  id: string;
  devocional: {
    id: string;
    data: string;
    tema: string;
    versiculo: string;
    referencia: string;
  };
  completado: boolean;
  resposta_1: string;
  resposta_2: string;
  resposta_3: string;
  oracao: string;
  gratidao: string;
  aprendizado: string;
  created_at: string;
}

const HistoricoDevocional = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [historico, setHistorico] = useState<DevocionalHistorico[]>([]);
  const [selectedDevocional, setSelectedDevocional] = useState<DevocionalHistorico | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHistorico();
    }
  }, [user]);

  const fetchHistorico = async () => {
    try {
      const { data, error } = await supabase
        .from('devocional_historico')
        .select(`
          *,
          devocional:devocionais(id, data, tema, versiculo, referencia)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setHistorico(data as DevocionalHistorico[]);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedDevocional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={() => setSelectedDevocional(null)} 
            variant="ghost" 
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Histórico
          </Button>

          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {new Date(selectedDevocional.devocional.data + 'T00:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'America/Sao_Paulo'
                  })}
                </span>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                {selectedDevocional.devocional.tema}
              </CardTitle>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-lg font-medium text-gray-900 mb-2">
                  "{selectedDevocional.devocional.versiculo}"
                </p>
                <p className="text-blue-600 font-semibold">
                  {selectedDevocional.devocional.referencia}
                </p>
              </div>
            </CardHeader>
          </Card>

          {/* Minhas Respostas */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Minhas Reflexões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedDevocional.resposta_1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reflexão 1:
                  </label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-700">{selectedDevocional.resposta_1}</p>
                  </div>
                </div>
              )}

              {selectedDevocional.resposta_2 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reflexão 2:
                  </label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-700">{selectedDevocional.resposta_2}</p>
                  </div>
                </div>
              )}

              {selectedDevocional.resposta_3 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reflexão 3:
                  </label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-700">{selectedDevocional.resposta_3}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Diário de Bordo */}
          <Card>
            <CardHeader>
              <CardTitle>Meu Diário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedDevocional.oracao && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Oração:
                  </label>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-gray-700">{selectedDevocional.oracao}</p>
                  </div>
                </div>
              )}

              {selectedDevocional.gratidao && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gratidão:
                  </label>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-gray-700">{selectedDevocional.gratidao}</p>
                  </div>
                </div>
              )}

              {selectedDevocional.aprendizado && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aprendizado:
                  </label>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-gray-700">{selectedDevocional.aprendizado}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={() => navigate('/')} 
            variant="ghost"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar à Home
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-playfair text-gray-900 mb-2">
            Meu Histórico Devocional
          </h1>
          <p className="text-gray-600">
            Acompanhe sua jornada espiritual e revisite suas reflexões
          </p>
        </div>

        {historico.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent>
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ainda não há devocionais no seu histórico
              </h2>
              <p className="text-gray-600 mb-4">
                Comece sua jornada devocional hoje mesmo!
              </p>
              <Button onClick={() => navigate('/devocional')}>
                Fazer Devocional de Hoje
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {historico.map((item) => (
              <Card key={item.id} className="transition-all duration-200 hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-600 font-medium">
                          {new Date(item.devocional.data + 'T00:00:00').toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            timeZone: 'America/Sao_Paulo'
                          })}
                        </span>
                        {item.completado && (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Concluído
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.devocional.tema}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {item.devocional.referencia}
                      </p>
                      
                      <p className="text-sm text-gray-500">
                        Feito em {new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedDevocional(item)}
                      className="ml-4"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricoDevocional;
