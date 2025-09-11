import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSpiritualProgress } from '@/hooks/useSpiritualProgress';
import { getSpiritualLevelInfo, getNextSpiritualLevel, getProgressToNextLevel, type SpiritualLevel } from '@/utils/diagnosticLevels';

interface ProgressSummaryCardProps {
  className?: string;
}

export const ProgressSummaryCard: React.FC<ProgressSummaryCardProps> = ({ className }) => {
  const navigate = useNavigate();
  const { progressData, achievements, loading } = useSpiritualProgress();

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!progressData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Inicie Sua Jornada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Complete o diagnóstico para começar a acompanhar seu progresso espiritual
          </p>
          <Button onClick={() => navigate('/progresso')} variant="outline" className="w-full">
            Ver Progresso
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentLevel = getSpiritualLevelInfo(progressData.level_current as SpiritualLevel);
  const nextLevelValue = getNextSpiritualLevel(progressData.level_current as SpiritualLevel);
  const nextLevel = nextLevelValue ? getSpiritualLevelInfo(nextLevelValue) : null;
  const progressToNext = getProgressToNextLevel(progressData.points_total, progressData.level_current as SpiritualLevel);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Seu Progresso Espiritual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="secondary" className="mb-2">
              {currentLevel?.emoji} {currentLevel?.label}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {progressData.points_total} pontos totais
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {achievements?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">conquistas</p>
          </div>
        </div>

        {nextLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Próximo nível: {nextLevel.label}</span>
              <span>{progressToNext.percentage}%</span>
            </div>
            <Progress value={progressToNext.percentage} className="h-2" />
          </div>
        )}

        <Button 
          onClick={() => navigate('/progresso')} 
          className="w-full"
          variant="default"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Ver Progresso Completo
        </Button>
      </CardContent>
    </Card>
  );
};