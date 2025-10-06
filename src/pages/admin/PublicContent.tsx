import { FileText, BookOpen, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientButton } from '@/components/common/GradientButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

const PublicContent = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7b2ff7] to-[#f107a3] bg-clip-text text-transparent">
              Conteúdos Públicos
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie devocionais e trilhas disponíveis para todos
            </p>
          </div>
          <GradientButton onClick={() => navigate('/admin/hodos')}>
            Voltar ao Dashboard
          </GradientButton>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="devotionals" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="devotionals">
              <BookOpen className="h-4 w-4 mr-2" />
              Devocionais
            </TabsTrigger>
            <TabsTrigger value="tracks">
              <FileText className="h-4 w-4 mr-2" />
              Trilhas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="devotionals" className="space-y-4">
            <div className="flex justify-end">
              <GradientButton>
                <Plus className="h-4 w-4 mr-2" />
                Novo Devocional
              </GradientButton>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Devocionais Públicos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nenhum devocional público cadastrado ainda.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracks" className="space-y-4">
            <div className="flex justify-end">
              <GradientButton>
                <Plus className="h-4 w-4 mr-2" />
                Nova Trilha
              </GradientButton>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Trilhas Públicas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nenhuma trilha pública cadastrada ainda.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PublicContent;
