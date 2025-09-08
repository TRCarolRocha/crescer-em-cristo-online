import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Target, Calendar, Users, BookOpen, Heart } from 'lucide-react';
import type { Achievement } from '@/hooks/useSpiritualProgress';

interface AchievementSystemProps {
  achievements: Achievement[];
}

const getAchievementIcon = (type: string) => {
  switch (type) {
    case 'diagnostic':
      return <Target className="h-4 w-4" />;
    case 'track':
      return <BookOpen className="h-4 w-4" />;
    case 'devotional':
      return <Heart className="h-4 w-4" />;
    case 'group':
      return <Users className="h-4 w-4" />;
    default:
      return <Trophy className="h-4 w-4" />;
  }
};

const getAchievementColor = (type: string) => {
  switch (type) {
    case 'diagnostic':
      return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
    case 'track':
      return 'bg-green-500/10 text-green-700 border-green-500/20';
    case 'devotional':
      return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
    case 'group':
      return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
    default:
      return 'bg-primary/10 text-primary border-primary/20';
  }
};

export const AchievementSystem: React.FC<AchievementSystemProps> = ({ achievements }) => {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    const type = achievement.achievement_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const achievementStats = {
    total: achievements.length,
    totalPoints: achievements.reduce((sum, a) => sum + a.points_awarded, 0),
    types: Object.keys(groupedAchievements).length,
    recent: achievements.filter(a => {
      const earnedDate = new Date(a.earned_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return earnedDate >= weekAgo;
    }).length
  };

  return (
    <div className="space-y-6">
      {/* Achievement Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-primary">{achievementStats.total}</p>
              </div>
              <Trophy className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Pontos</p>
                <p className="text-2xl font-bold text-primary">{achievementStats.totalPoints}</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Categorias</p>
                <p className="text-2xl font-bold text-primary">{achievementStats.types}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Esta Semana</p>
                <p className="text-2xl font-bold text-primary">{achievementStats.recent}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Conquistas Recentes
          </CardTitle>
          <CardDescription>
            Suas conquistas mais recentes na jornada espiritual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {achievements.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma conquista ainda.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Complete atividades para ganhar suas primeiras conquistas!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getAchievementColor(achievement.achievement_type)}`}>
                      {getAchievementIcon(achievement.achievement_type)}
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="font-semibold">{achievement.achievement_title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {achievement.achievement_description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(achievement.earned_at)}
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="text-primary border-primary/50">
                    +{achievement.points_awarded} pts
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Categories */}
      {Object.keys(groupedAchievements).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conquistas por Categoria</CardTitle>
            <CardDescription>
              Distribuição das suas conquistas por tipo de atividade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {Object.entries(groupedAchievements).map(([type, typeAchievements]) => (
                <div
                  key={type}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getAchievementColor(type)}`}>
                      {getAchievementIcon(type)}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{type}</p>
                      <p className="text-sm text-muted-foreground">
                        {typeAchievements.length} conquista{typeAchievements.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {typeAchievements.reduce((sum, a) => sum + a.points_awarded, 0)} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};