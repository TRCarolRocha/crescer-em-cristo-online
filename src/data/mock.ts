// Mock data for dashboards and statistics

export const mockSuperAdminStats = {
  totalChurches: 12,
  activeUsers: 347,
  publicContent: 45,
  newChurchesThisMonth: 3,
  engagementRate: 82,
};

export const mockChurchStats = {
  activeDiscipleships: 8,
  totalMembers: 156,
  engagement: 78,
  contentPublished: 23,
  eventsThisMonth: 5,
};

export const mockChurches = [
  {
    id: '1',
    slug: 'monte-hebrom',
    name: 'Igreja Monte Hebrom',
    logo_url: null,
    members: 156,
    status: 'active',
    created_at: '2024-01-15',
  },
  {
    id: '2',
    slug: 'nova-alianca',
    name: 'Igreja Nova Aliança',
    logo_url: null,
    members: 89,
    status: 'active',
    created_at: '2024-02-20',
  },
  {
    id: '3',
    slug: 'cidade-alta',
    name: 'Igreja Cidade Alta',
    logo_url: null,
    members: 234,
    status: 'active',
    created_at: '2023-11-10',
  },
];

export const mockRecentActivities = [
  {
    id: '1',
    type: 'new_church',
    description: 'Nova igreja cadastrada: Comunidade Resgate',
    timestamp: '2024-03-15T10:30:00Z',
  },
  {
    id: '2',
    type: 'new_content',
    description: 'Novo devocional publicado: "Fé e Esperança"',
    timestamp: '2024-03-14T15:20:00Z',
  },
  {
    id: '3',
    type: 'new_user',
    description: '15 novos usuários cadastrados hoje',
    timestamp: '2024-03-14T09:10:00Z',
  },
];

export const mockChurchRecentContent = [
  {
    id: '1',
    title: 'Trilha: Fundamentos da Fé',
    type: 'track',
    published_at: '2024-03-10',
    views: 45,
  },
  {
    id: '2',
    title: 'Devocional: Graça Abundante',
    type: 'devotional',
    published_at: '2024-03-12',
    views: 78,
  },
];

export const mockEngagementData = [
  { month: 'Jan', value: 65 },
  { month: 'Fev', value: 72 },
  { month: 'Mar', value: 82 },
  { month: 'Abr', value: 78 },
  { month: 'Mai', value: 85 },
  { month: 'Jun', value: 90 },
];
