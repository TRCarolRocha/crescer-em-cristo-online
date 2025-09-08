export const SPIRITUAL_LEVELS = [
  { 
    value: 'novo', 
    label: 'Novo na Fé',
    emoji: '🌱',
    description: 'Você está no início da sua jornada espiritual',
    percentage: { min: 0, max: 19 },
    minPoints: 0,
    minTimeMonths: 0
  },
  { 
    value: 'aprendiz', 
    label: 'Aprendiz',
    emoji: '🌾',
    description: 'Aprendendo os fundamentos da fé',
    percentage: { min: 20, max: 39 },
    minPoints: 200,
    minTimeMonths: 6
  },
  { 
    value: 'crescimento', 
    label: 'Em Crescimento',
    emoji: '🌿',
    description: 'Crescendo consistentemente na fé',
    percentage: { min: 40, max: 59 },
    minPoints: 500,
    minTimeMonths: 12
  },
  { 
    value: 'consolidado', 
    label: 'Consolidado',
    emoji: '🌳',
    description: 'Consolidando conhecimento e práticas espirituais',
    percentage: { min: 60, max: 79 },
    minPoints: 1000,
    minTimeMonths: 18
  },
  { 
    value: 'mentor', 
    label: 'Mentor',
    emoji: '🌺',
    description: 'Capacitado para orientar outros na fé',
    percentage: { min: 80, max: 89 },
    minPoints: 1800,
    minTimeMonths: 24
  },
  { 
    value: 'lider_maduro', 
    label: 'Líder Maduro',
    emoji: '🌟',
    description: 'Liderança madura e discipulado ativo',
    percentage: { min: 90, max: 100 },
    minPoints: 3000,
    minTimeMonths: 36
  }
] as const;

// Backward compatibility
export const DIAGNOSTIC_LEVELS = SPIRITUAL_LEVELS;

export type SpiritualLevel = typeof SPIRITUAL_LEVELS[number]['value'];
export type DiagnosticLevel = SpiritualLevel; // Backward compatibility

export const getSpiritualLevelByPercentage = (percentage: number): SpiritualLevel => {
  if (percentage >= 90) return 'lider_maduro';
  if (percentage >= 80) return 'mentor';
  if (percentage >= 60) return 'consolidado';
  if (percentage >= 40) return 'crescimento';
  if (percentage >= 20) return 'aprendiz';
  return 'novo';
};

export const getSpiritualLevelByPoints = (points: number): SpiritualLevel => {
  if (points >= 3000) return 'lider_maduro';
  if (points >= 1800) return 'mentor';
  if (points >= 1000) return 'consolidado';
  if (points >= 500) return 'crescimento';
  if (points >= 200) return 'aprendiz';
  return 'novo';
};

// Backward compatibility
export const getDiagnosticLevelByPercentage = getSpiritualLevelByPercentage;

export const getSpiritualLevelInfo = (level: SpiritualLevel) => {
  return SPIRITUAL_LEVELS.find(l => l.value === level);
};

export const getSpiritualLevelDisplay = (level: SpiritualLevel) => {
  const info = getSpiritualLevelInfo(level);
  return info ? `${info.emoji} ${info.label}` : level;
};

export const getNextSpiritualLevel = (currentLevel: SpiritualLevel): SpiritualLevel | null => {
  const currentIndex = SPIRITUAL_LEVELS.findIndex(l => l.value === currentLevel);
  if (currentIndex === -1 || currentIndex === SPIRITUAL_LEVELS.length - 1) return null;
  return SPIRITUAL_LEVELS[currentIndex + 1].value;
};

export const getProgressToNextLevel = (points: number, currentLevel: SpiritualLevel): { current: number, target: number, percentage: number } => {
  const nextLevel = getNextSpiritualLevel(currentLevel);
  if (!nextLevel) {
    return { current: points, target: points, percentage: 100 };
  }
  
  const nextLevelInfo = getSpiritualLevelInfo(nextLevel);
  const currentLevelInfo = getSpiritualLevelInfo(currentLevel);
  
  if (!nextLevelInfo || !currentLevelInfo) {
    return { current: points, target: points, percentage: 100 };
  }
  
  const pointsInCurrentLevel = points - currentLevelInfo.minPoints;
  const pointsNeededForNext = nextLevelInfo.minPoints - currentLevelInfo.minPoints;
  const percentage = Math.min(100, (pointsInCurrentLevel / pointsNeededForNext) * 100);
  
  return {
    current: pointsInCurrentLevel,
    target: pointsNeededForNext,
    percentage: Math.round(percentage)
  };
};

// Backward compatibility functions
export const getDiagnosticLevelInfo = getSpiritualLevelInfo;
export const getDiagnosticLevelDisplay = getSpiritualLevelDisplay;