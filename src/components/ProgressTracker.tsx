
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Video, BookOpen, FileText, HelpCircle } from 'lucide-react';

interface Content {
  id: string;
  titulo: string;
  video_url?: string;
  texto?: string;
  pdf_url?: string;
}

interface UserContentProgress {
  watched_video: boolean;
  read_text: boolean;
  downloaded_pdf: boolean;
  answered_questions: boolean;
  completed: boolean;
  time_spent: number;
}

interface ProgressTrackerProps {
  contentId: string;
  progress?: UserContentProgress;
  content: Content;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ contentId, progress, content }) => {
  const getProgressSteps = () => {
    const steps = [];

    if (content.video_url) {
      steps.push({
        id: 'video',
        label: 'Assistir Vídeo',
        icon: Video,
        completed: progress?.watched_video || false
      });
    }

    if (content.texto) {
      steps.push({
        id: 'text',
        label: 'Ler Conteúdo',
        icon: BookOpen,
        completed: progress?.read_text || false
      });
    }

    if (content.pdf_url) {
      steps.push({
        id: 'pdf',
        label: 'Baixar Material',
        icon: FileText,
        completed: progress?.downloaded_pdf || false
      });
    }

    steps.push({
      id: 'questions',
      label: 'Responder Questionário',
      icon: HelpCircle,
      completed: progress?.answered_questions || false
    });

    return steps;
  };

  const steps = getProgressSteps();
  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-blue-900">Progresso do Módulo</CardTitle>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            {progressPercentage}% Concluído
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progressPercentage} className="h-3" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  step.completed 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <div className="flex-shrink-0">
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <Icon className={`h-4 w-4 ${step.completed ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${step.completed ? 'text-green-800' : 'text-gray-600'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {progress?.completed && (
          <div className="bg-green-100 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">Módulo Concluído!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Parabéns! Você completou todos os requisitos deste módulo.
            </p>
          </div>
        )}

        {!progress?.completed && totalSteps > 0 && (
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              Complete {totalSteps - completedSteps} de {totalSteps} etapas restantes para finalizar este módulo.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressTracker;
