import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSpiritualLevelInfo } from '@/utils/diagnosticLevels';
import { Calendar, TrendingUp, Award, Trophy } from 'lucide-react';
import type { LevelProgression, Achievement } from '@/hooks/useSpiritualProgress';

interface SpiritualJourneyTimelineProps {
  progressHistory: LevelProgression[];
  achievements: Achievement[];
  currentLevel: string;
}

export const SpiritualJourneyTimeline: React.FC<SpiritualJourneyTimelineProps> = ({
  progressHistory,
  achievements,
  currentLevel
}) => {
  // Combine and sort timeline events
  const timelineEvents = [
    ...progressHistory.map(progression => ({
      type: 'level_progression' as const,
      date: new Date(progression.promoted_at),
      data: progression
    })),
    ...achievements.slice(0, 10).map(achievement => ({
      type: 'achievement' as const,
      date: new Date(achievement.earned_at),
      data: achievement
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hoje';
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 7) return `${diffInDays} dias atrás`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} meses atrás`;
    return `${Math.floor(diffInDays / 365)} anos atrás`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Jornada Espiritual
        </CardTitle>
        <CardDescription>
          Acompanhe seu progresso e conquistas ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {timelineEvents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum evento na sua jornada ainda.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Complete atividades para começar a construir sua história!
            </p>
          </div>
        ) : (
          <div className="relative space-y-6">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
            
            {timelineEvents.map((event, index) => (
              <div key={index} className="relative flex items-start gap-4">
                {/* Timeline dot */}
                <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                  event.type === 'level_progression' 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-secondary/10 border-secondary'
                }`}>
                  {event.type === 'level_progression' ? (
                    <TrendingUp className="h-5 w-5 text-primary" />
                  ) : (
                    <Trophy className="h-5 w-5 text-secondary-foreground" />
                  )}
                </div>

                {/* Event content */}
                <div className="flex-1 min-w-0">
                  <div className="rounded-lg border bg-card p-4 shadow-sm">
                    {event.type === 'level_progression' ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="text-xs">
                              Novo Nível
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(event.date)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {getTimeAgo(event.date)}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="font-semibold">
                            Promovido para {getSpiritualLevelInfo(event.data.to_level as any)?.label}
                          </h4>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              {event.data.points_at_promotion} pontos
                            </span>
                            
                            {event.data.time_in_previous_level_months && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {event.data.time_in_previous_level_months} meses no nível anterior
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              Conquista
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(event.date)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {getTimeAgo(event.date)}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="font-semibold">{event.data.achievement_title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {event.data.achievement_description}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-primary">
                            <Award className="h-3 w-3" />
                            +{event.data.points_awarded} pontos
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current status */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>Atualmente no nível: </span>
            <Badge variant="outline">
              {getSpiritualLevelInfo(currentLevel as any)?.label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};