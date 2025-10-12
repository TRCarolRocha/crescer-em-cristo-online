import React from 'react';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { EmailTemplateEditor } from './EmailTemplateEditor';

export const EmailTemplates = () => {
  const { templates, isLoading } = useEmailTemplates();
  const [editTemplate, setEditTemplate] = React.useState<any>(null);

  const templateNames: Record<string, string> = {
    'welcome-individual': 'Boas-vindas - Individual',
    'welcome-church': 'Boas-vindas - Igreja',
    'rejection': 'Rejeição de Pagamento',
    'expiration-warning': 'Aviso de Expiração',
    'renewal-reminder': 'Lembrete de Renovação',
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <div className="grid gap-4">
        {templates?.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {templateNames[template.template_key] || template.template_key}
                <Button size="icon" variant="ghost" onClick={() => setEditTemplate(template)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>Assunto: {template.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Variáveis disponíveis: {Array.isArray(template.variables) ? template.variables.join(', ') : 'Nenhuma'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {editTemplate && (
        <EmailTemplateEditor
          template={editTemplate}
          open={!!editTemplate}
          onOpenChange={(open) => !open && setEditTemplate(null)}
        />
      )}
    </>
  );
};
