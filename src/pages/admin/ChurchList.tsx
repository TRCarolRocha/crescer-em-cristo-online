import { Building2, Users, ArrowRight, Eye, Settings, Power } from 'lucide-react';
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
              <Card
                key={church.id}
                className="hover:shadow-lg transition-all group overflow-hidden"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {church.logo_url ? (
                        <img 
                          src={church.logo_url} 
                          alt={church.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#7b2ff7] to-[#f107a3] flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{church.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          @{church.slug}
                        </p>
                      </div>
                    </div>
                    <Badge variant={church.is_active ? "default" : "secondary"}>
                      {church.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/igreja/${church.slug}`)}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Página
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/igrejas/${church.slug}`)}
                      className="w-full"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Dashboard
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
