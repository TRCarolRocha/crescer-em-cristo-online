import { Building2, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientButton } from '@/components/common/GradientButton';
import { useNavigate } from 'react-router-dom';
import { mockChurches } from '@/data/mock';

const ChurchList = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7b2ff7] to-[#f107a3] bg-clip-text text-transparent">
              Igrejas Cadastradas
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie todas as igrejas da plataforma
            </p>
          </div>
          <GradientButton onClick={() => navigate('/admin/hodos')}>
            Voltar ao Dashboard
          </GradientButton>
        </div>

        {/* Churches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockChurches.map((church) => (
            <Card
              key={church.id}
              className="hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => navigate(`/admin/igrejas/${church.slug}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#7b2ff7] to-[#f107a3] flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{church.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        @{church.slug}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-[#7b2ff7] transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{church.members} membros</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      church.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {church.status === 'active' ? 'Ativa' : 'Inativa'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Desde {new Date(church.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChurchList;
