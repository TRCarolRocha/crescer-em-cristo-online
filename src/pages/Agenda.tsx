
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Agenda = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const eventos = [
    {
      id: 1,
      titulo: "Culto de Domingo",
      data: "2024-01-07",
      hora: "10:00",
      local: "Templo Principal",
      tipo: "culto",
      descricao: "Culto dominical com pregação e adoração",
      responsavel: "Pastor João"
    },
    {
      id: 2,
      titulo: "Ensaio do Coral",
      data: "2024-01-08",
      hora: "19:30",
      local: "Sala de Música",
      tipo: "ensaio",
      descricao: "Ensaio para apresentação do próximo domingo",
      responsavel: "Ministério de Música"
    },
    {
      id: 3,
      titulo: "Estudo Bíblico",
      data: "2024-01-09",
      hora: "19:00",
      local: "Sala de Estudos",
      tipo: "estudo",
      descricao: "Estudo do livro de Romanos - Capítulo 8",
      responsavel: "Pastor Auxiliar"
    },
    {
      id: 4,
      titulo: "Evangelismo no Bairro",
      data: "2024-01-10",
      hora: "14:00",
      local: "Praça Central",
      tipo: "evangelismo",
      descricao: "Ação evangelística com distribuição de folhetos",
      responsavel: "Ministério de Evangelismo"
    },
    {
      id: 5,
      titulo: "Confraternização dos Jovens",
      data: "2024-01-12",
      hora: "18:00",
      local: "Salão Social",
      tipo: "comunhao",
      descricao: "Noite de jogos e comunhão entre os jovens",
      responsavel: "Ministério de Jovens"
    }
  ];

  const tipoColors = {
    culto: "bg-blue-100 text-blue-800",
    ensaio: "bg-purple-100 text-purple-800",
    estudo: "bg-green-100 text-green-800",
    evangelismo: "bg-orange-100 text-orange-800",
    comunhao: "bg-pink-100 text-pink-800"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agenda da Igreja</h1>
            <p className="text-gray-600 mt-2">Programações e eventos da Monte Hebrom</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/')} variant="outline">
              Voltar ao Início
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </div>
        </div>

        {/* Calendário e Eventos */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Lista de Eventos */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Próximos Eventos</h2>
            {eventos.map((evento) => (
              <Card key={evento.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{evento.titulo}</h3>
                      <p className="text-gray-600 text-sm mt-1">{evento.descricao}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${tipoColors[evento.tipo as keyof typeof tipoColors]}`}>
                      {evento.tipo}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                      {new Date(evento.data).toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-green-600" />
                      {evento.hora}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-red-600" />
                      {evento.local}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-purple-600" />
                      {evento.responsavel}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar com Filtros */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Filtrar por Tipo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(tipoColors).map(([tipo, color]) => (
                  <div key={tipo} className="flex items-center space-x-2">
                    <input type="checkbox" id={tipo} className="rounded" />
                    <label htmlFor={tipo} className="text-sm capitalize">{tipo}</label>
                    <span className={`px-2 py-1 rounded text-xs ${color}`}>
                      {eventos.filter(e => e.tipo === tipo).length}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas do Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total de Eventos</span>
                    <span className="font-semibold">{eventos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cultos</span>
                    <span className="font-semibold">{eventos.filter(e => e.tipo === 'culto').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Estudos</span>
                    <span className="font-semibold">{eventos.filter(e => e.tipo === 'estudo').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agenda;
