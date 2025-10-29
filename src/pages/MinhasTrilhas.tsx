import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CustomTracksList } from '@/components/tracks/CustomTracksList';
import { CreateCustomTrackDialog } from '@/components/tracks/CreateCustomTrackDialog';
import { AccessGate } from '@/components/subscription/AccessGate';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';

const MinhasTrilhas = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { access } = useSubscriptionAccess();

  return (
    <AccessGate 
      requiredAccess="canCreateOwnTracks"
      fallback={
        <PageContainer>
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center space-y-4 max-w-md">
              <h2 className="text-2xl font-bold">Recurso Exclusivo do Plano Guia</h2>
              <p className="text-muted-foreground">
                Crie suas próprias trilhas personalizadas e compartilhe com seu grupo. 
                Upgrade para o plano <strong>Hodos Guia</strong> para ter acesso a este recurso.
              </p>
              <Button onClick={() => window.location.href = '/planos'}>
                Ver Planos
              </Button>
            </div>
          </div>
        </PageContainer>
      }
    >
      <PageContainer>
        <PageHeader 
          title="Minhas Trilhas" 
          description="Gerencie suas trilhas personalizadas"
        />

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Trilhas Criadas</h2>
              <p className="text-sm text-muted-foreground">
                Trilhas de estudo personalizadas criadas por você
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Trilha
            </Button>
          </div>

          <CustomTracksList />
        </div>

        <CreateCustomTrackDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen} 
        />
      </PageContainer>
    </AccessGate>
  );
};

export default MinhasTrilhas;
