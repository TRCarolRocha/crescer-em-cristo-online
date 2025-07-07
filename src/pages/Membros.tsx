
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Users, Phone, MapPin, Calendar, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Membros = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const membros = [
    {
      id: 1,
      nome: "Pastor João Silva",
      nascimento: "1975-03-15",
      telefone: "(21) 99999-1111",
      endereco: "Rua das Flores, 123 - Ibamonte",
      ministerio: "Pastor Principal",
      departamento: "Liderança",
      relacionamentos: [],
      foto: "/api/placeholder/80/80"
    },
    {
      id: 2,
      nome: "Irmã Maria Santos",
      nascimento: "1980-07-22",
      telefone: "(21) 99999-2222",
      endereco: "Av. Central, 456 - Ibamonte",
      ministerio: "Líder",
      departamento: "Ministério das Mulheres",
      relacionamentos: [
        { tipo: "esposa", membroId: 3, nome: "José Santos" },
        { tipo: "mãe", membroId: 4, nome: "Ana Santos" }
      ],
      foto: "/api/placeholder/80/80"
    },
    {
      id: 3,
      nome: "José Santos",
      nascimento: "1978-11-10",
      telefone: "(21) 99999-3333",
      endereco: "Av. Central, 456 - Ibamonte",
      ministerio: "Diácono",
      departamento: "Administração",
      relacionamentos: [
        { tipo: "esposo", membroId: 2, nome: "Maria Santos" },
        { tipo: "pai", membroId: 4, nome: "Ana Santos" }
      ],
      foto: "/api/placeholder/80/80"
    },
    {
      id: 4,
      nome: "Ana Santos",
      nascimento: "2010-05-18",
      telefone: "",
      endereco: "Av. Central, 456 - Ibamonte",
      ministerio: "Participante",
      departamento: "Departamento Infantil",
      relacionamentos: [
        { tipo: "filha", membroId: 2, nome: "Maria Santos" },
        { tipo: "filha", membroId: 3, nome: "José Santos" }
      ],
      foto: "/api/placeholder/80/80"
    },
    {
      id: 5,
      nome: "Alex Oliveira",
      nascimento: "1985-12-03",
      telefone: "(21) 99999-4444",
      endereco: "Rua do Campo, 789 - Ibamonte",
      ministerio: "Professor",
      departamento: "Departamento Infantil",
      relacionamentos: [],
      foto: "/api/placeholder/80/80"
    },
    {
      id: 6,
      nome: "Alessandra Costa",
      nascimento: "1982-09-14",
      telefone: "(21) 99999-5555",
      endereco: "Rua da Paz, 321 - Ibamonte",
      ministerio: "Líder",
      departamento: "Ministério das Mulheres",
      relacionamentos: [
        { tipo: "esposa", membroId: 7, nome: "Flávio Costa" },
        { tipo: "mãe", membroId: 8, nome: "Maria Eduarda Costa" }
      ],
      foto: "/api/placeholder/80/80"
    },
    {
      id: 7,
      nome: "Flávio Costa",
      nascimento: "1980-01-25",
      telefone: "(21) 99999-6666",
      endereco: "Rua da Paz, 321 - Ibamonte",
      ministerio: "Músico",
      departamento: "Ministério de Música",
      relacionamentos: [
        { tipo: "esposo", membroId: 6, nome: "Alessandra Costa" },
        { tipo: "pai", membroId: 8, nome: "Maria Eduarda Costa" }
      ],
      foto: "/api/placeholder/80/80"
    },
    {
      id: 8,
      nome: "Maria Eduarda Costa",
      nascimento: "2015-08-30",
      telefone: "",
      endereco: "Rua da Paz, 321 - Ibamonte",
      ministerio: "Participante",
      departamento: "Departamento Infantil",
      relacionamentos: [
        { tipo: "filha", membroId: 6, nome: "Alessandra Costa" },
        { tipo: "filha", membroId: 7, nome: "Flávio Costa" }
      ],
      foto: "/api/placeholder/80/80"
    }
  ];

  const filteredMembros = membros.filter(membro => 
    membro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    membro.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    membro.ministerio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calcularIdade = (nascimento: string) => {
    const hoje = new Date();
    const dataNasc = new Date(nascimento);
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const mes = hoje.getMonth() - dataNasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNasc.getDate())) {
      idade--;
    }
    return idade;
  };

  const getMinisterioColor = (ministerio: string) => {
    const cores = {
      "Pastor Principal": "bg-purple-100 text-purple-800",
      "Líder": "bg-blue-100 text-blue-800",
      "Diácono": "bg-green-100 text-green-800",
      "Professor": "bg-orange-100 text-orange-800",
      "Músico": "bg-pink-100 text-pink-800",
      "Participante": "bg-gray-100 text-gray-800"
    };
    return cores[ministerio as keyof typeof cores] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Membros da Igreja</h1>
            <p className="text-gray-600 mt-2">Gerenciamento de membros da Monte Hebrom</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/')} variant="outline">
              Voltar ao Início
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Membro
            </Button>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{membros.length}</div>
              <div className="text-sm text-gray-600">Total de Membros</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {membros.filter(m => m.relacionamentos.some(r => r.tipo === 'esposo' || r.tipo === 'esposa')).length}
              </div>
              <div className="text-sm text-gray-600">Casados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {membros.filter(m => calcularIdade(m.nascimento) < 18).length}
              </div>
              <div className="text-sm text-gray-600">Crianças/Jovens</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {membros.filter(m => m.ministerio !== 'Participante').length}
              </div>
              <div className="text-sm text-gray-600">Em Ministérios</div>
            </CardContent>
          </Card>
        </div>

        {/* Busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nome, ministério ou departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Membros */}
        <div className="grid gap-6">
          {filteredMembros.map((membro) => (
            <Card key={membro.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={membro.foto}
                    alt={membro.nome}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{membro.nome}</h3>
                      <Badge className={getMinisterioColor(membro.ministerio)}>
                        {membro.ministerio} - {membro.departamento}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                        {calcularIdade(membro.nascimento)} anos
                      </div>
                      {membro.telefone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-green-600" />
                          {membro.telefone}
                        </div>
                      )}
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-red-600" />
                        {membro.endereco}
                      </div>
                    </div>

                    {membro.relacionamentos.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Relacionamentos:</h4>
                        <div className="flex flex-wrap gap-2">
                          {membro.relacionamentos.map((rel, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {rel.tipo} de {rel.nome}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Membros;
