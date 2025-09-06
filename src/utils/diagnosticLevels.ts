export const DIAGNOSTIC_LEVELS = [
  { 
    value: 'novo', 
    label: 'Novo na Fé',
    emoji: '🌱',
    description: 'Você está no início da sua jornada espiritual',
    percentage: { min: 0, max: 49 }
  },
  { 
    value: 'crescimento', 
    label: 'Em Crescimento',
    emoji: '🌿',
    description: 'Você está crescendo espiritualmente',
    percentage: { min: 50, max: 79 }
  },
  { 
    value: 'lider', 
    label: 'Líder Maduro',
    emoji: '🌳',
    description: 'Você demonstra maturidade espiritual avançada',
    percentage: { min: 80, max: 100 }
  }
] as const;

export type DiagnosticLevel = typeof DIAGNOSTIC_LEVELS[number]['value'];

export const getDiagnosticLevelByPercentage = (percentage: number): DiagnosticLevel => {
  if (percentage >= 80) return 'lider';
  if (percentage >= 50) return 'crescimento';
  return 'novo';
};

export const getDiagnosticLevelInfo = (level: DiagnosticLevel) => {
  return DIAGNOSTIC_LEVELS.find(l => l.value === level);
};

export const getDiagnosticLevelDisplay = (level: DiagnosticLevel) => {
  const info = getDiagnosticLevelInfo(level);
  return info ? `${info.emoji} ${info.label}` : level;
};