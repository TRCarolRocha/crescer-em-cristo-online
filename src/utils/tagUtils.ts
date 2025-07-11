
// Cores para as tags de ministérios/departamentos
const TAG_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#EC4899', // pink
  '#6B7280', // gray
];

export const getTagColor = (tagName: string): string => {
  // Gera uma cor consistente baseada no nome da tag
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
};

export const getTagName = (tagId: string, tags: { id: string; nome: string }[]): string => {
  const tag = tags.find(t => t.id === tagId);
  return tag?.nome || 'Tag desconhecida';
};
