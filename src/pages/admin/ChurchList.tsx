import { Building2, Users, ArrowRight, Eye, Settings, Power, Church } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientButton } from '@/components/common/GradientButton';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useChurches } from '@/hooks/useChurches';
import { Badge } from '@/components/ui/badge';

const ChurchList = () => {
  const navigate = useNavigate();
  const { churches, loading } = useChurches();

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
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </Card>
            ))
          ) : churches.length === 0 ? (
            // Empty state
            <div className="col-span-full text-center py-12">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma igreja cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Comece cadastrando a primeira igreja da plataforma
              </p>
              <GradientButton onClick={() => navigate('/admin/hodos')}>
                Cadastrar Igreja
              </GradientButton>
            </div>
          ) : (
            churches.map((church) => (
              <Card key={church.id} className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#7b2ff7]/20 bg-gradient-to-br from-white to-purple-50/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {church.logo_url ? (
                      <img 
                        src={church.logo_url} 
                        alt={church.name}
                        className="h-16 w-16 rounded-full object-cover shadow-md"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#7b2ff7] to-[#f107a3] flex items-center justify-center shadow-md">
                        <Church className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {church.name.length > 20 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 truncate">@{church.slug}</span>
                        </div>
                      ) : (
                        <CardTitle className="text-lg font-bold truncate">{church.name}</CardTitle>
                      )}
                      {church.name.length <= 20 && (
                        <p className="text-sm text-muted-foreground truncate">@{church.slug}</p>
                      )}
                      <Badge 
                        variant={church.is_active ? "default" : "secondary"}
                        className="mt-2 bg-gradient-to-r from-[#7b2ff7] to-[#f107a3]"
                      >
                        {church.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/igreja/${church.slug}`)}
                      className="w-full hover:bg-purple-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Ver Página</span>
                      <span className="sm:hidden">Ver</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/igrejas/${church.slug}`)}
                      className="w-full hover:bg-purple-50"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Dashboard</span>
                      <span className="sm:hidden">Admin</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChurchList;
