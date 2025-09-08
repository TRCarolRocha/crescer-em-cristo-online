import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSpiritualProgress } from '@/hooks/useSpiritualProgress';
import { 
  getSpiritualLevelInfo, 
  getNextSpiritualLevel, 
  getProgressToNextLevel,
  SPIRITUAL_LEVELS 
} from '@/utils/diagnosticLevels';
import { Trophy, Target, Calendar, TrendingUp, Star, Award } from 'lucide-react';
import { SpiritualJourneyTimeline } from './SpiritualJourneyTimeline';
import { AchievementSystem } from './AchievementSystem';

export const SpiritualProgressDashboard: React.FC = () => {
  const { progressData, achievements, progressHistory, loading } = useSpiritualProgress();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted/20 rounded-lg animate-pulse" />
        <div className="h-64 bg-muted/20 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!progressData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Dados de progresso não encontrados.</p>
        </CardContent>
      </Card>
    );
  }

  const currentLevelInfo = getSpiritualLevelInfo(progressData.level_current as any);
  const nextLevel = getNextSpiritualLevel(progressData.level_current as any);
  const progress = getProgressToNextLevel(progressData.points_total, progressData.level_current as any);

  const levelStartedAt = new Date(progressData.level_started_at);
  const monthsInLevel = Math.floor((Date.now() - levelStartedAt.getTime()) / (1000 * 60 * 60 * 24 * 30.44));

  const recentAchievements = achievements.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Current Level Overview */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{currentLevelInfo?.emoji}</span>
            <div>
              <h2 className="text-xl font-bold">{currentLevelInfo?.label}</h2>
              <CardDescription className="text-sm">
                {currentLevelInfo?.description}
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-4 w-4 text-primary mr-1" />
                <span className="font-semibold text-lg">{progressData.points_total}</span>
              </div>
              <p className="text-sm text-muted-foreground">Pontos Totais</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-4 w-4 text-primary mr-1" />
                <span className="font-semibold text-lg">{monthsInLevel}</span>
              </div>
              <p className="text-sm text-muted-foreground">Meses no Nível</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-4 w-4 text-primary mr-1" />
                <span className="font-semibold text-lg">{achievements.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Conquistas</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-4 w-4 text-primary mr-1" />
                <span className="font-semibold text-lg">{progressData.streak_multiplier}x</span>
              </div>
              <p className="text-sm text-muted-foreground">Multiplicador</p>
            </div>
          </div>

          {nextLevel && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progresso para {getSpiritualLevelInfo(nextLevel)?.label}</span>
                <span className="text-sm text-muted-foreground">{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {progress.current} / {progress.target} pontos até o próximo nível
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Points Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Diagnósticos</p>
                <p className="text-2xl font-bold text-primary">{progressData.points_diagnostics}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Trilhas</p>
                <p className="text-2xl font-bold text-primary">{progressData.points_tracks}</p>
              </div>
              <Trophy className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Devocionais</p>
                <p className="text-2xl font-bold text-primary">{progressData.points_devotionals}</p>
              </div>
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Grupos</p>
                <p className="text-2xl font-bold text-primary">{progressData.points_groups}</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed View */}
      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="timeline">Jornada</TabsTrigger>
          <TabsTrigger value="levels">Níveis</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <AchievementSystem achievements={recentAchievements} />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <SpiritualJourneyTimeline 
            progressHistory={progressHistory} 
            achievements={achievements}
            currentLevel={progressData.level_current}
          />
        </TabsContent>

        <TabsContent value="levels" className="space-y-4">
          <div className="grid gap-4">
            {SPIRITUAL_LEVELS.map((level, index) => {
              const isCurrentLevel = level.value === progressData.level_current;
              const isUnlocked = progressData.points_total >= level.minPoints;
              const isNext = level.value === nextLevel;

              return (
                <Card 
                  key={level.value} 
                  className={`relative transition-all ${
                    isCurrentLevel ? 'ring-2 ring-primary shadow-lg' : 
                    isUnlocked ? 'border-green-500/50 bg-green-50/30' : 
                    'opacity-60'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{level.emoji}</span>
                        <div>
                          <h3 className="font-semibold">{level.label}</h3>
                          <p className="text-sm text-muted-foreground">{level.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          {isCurrentLevel && <Badge variant="default">Atual</Badge>}
                          {isNext && <Badge variant="secondary">Próximo</Badge>}
                          {isUnlocked && !isCurrentLevel && !isNext && <Badge variant="outline">Desbloqueado</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {level.minPoints} pontos • {level.minTimeMonths} meses
                        </p>
                      </div>
                    </div>

                    {isNext && (
                      <div className="mt-4 space-y-2">
                        <Progress value={progress.percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Faltam {level.minPoints - progressData.points_total} pontos para desbloquear
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};