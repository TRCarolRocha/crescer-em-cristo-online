

# Plano de Implementação - Fases 2.2 a 4

## Resumo Executivo

Com base na análise do código atual e nas respostas do usuário, vamos implementar:

1. **Fase 2.2**: Gestão de Pequenos Grupos (Hodos Guia) - Até 10 pessoas
2. **Fase 2.3**: Dashboard de Progresso do Grupo
3. **Fase 3**: Sistema Financeiro Básico (Hodos Farol) - Tracking de dízimos/ofertas
4. **Fase 4**: Chat Direto com Super Admin

---

## FASE 2.2: Gestão de Pequenos Grupos (Hodos Guia)

### Objetivo
Permitir que usuários do plano **Hodos Guia** criem e gerenciem pequenos grupos de até 10 pessoas, acompanhando o progresso espiritual de cada membro.

### 2.2.1 - Modificações no Banco de Dados

**Criar tabela `small_groups`:**

```sql
CREATE TABLE small_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  leader_id uuid REFERENCES auth.users(id) NOT NULL,
  max_members integer DEFAULT 10,
  invite_code text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE small_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES small_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('member', 'co-leader')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE small_group_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES small_groups(id) ON DELETE CASCADE,
  track_id uuid REFERENCES discipleship_tracks(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  due_date date,
  UNIQUE(group_id, track_id)
);
```

**Políticas RLS:**
- Líder pode gerenciar seu grupo
- Membros podem ver o grupo que participam
- Limite de 10 membros por grupo (validado por trigger)

### 2.2.2 - Componentes de Interface

**Novos arquivos:**
1. `src/pages/MeuGrupo.tsx` - Página principal de gestão do grupo
2. `src/components/groups/CreateSmallGroupDialog.tsx` - Dialog para criar grupo
3. `src/components/groups/SmallGroupMembers.tsx` - Lista de membros
4. `src/components/groups/InviteMemberDialog.tsx` - Convidar por código/link
5. `src/components/groups/AssignTrackDialog.tsx` - Atribuir trilha ao grupo
6. `src/hooks/useSmallGroup.ts` - Hook para gerenciar grupos

**Funcionalidades:**
- Criar grupo com nome e descrição
- Gerar código de convite único
- Adicionar/remover membros
- Promover membro a co-líder
- Atribuir trilhas para o grupo estudar

### 2.2.3 - Rotas

```tsx
<Route path="/meu-grupo" element={
  <AccessGate requiredAccess="canCreateSmallGroup">
    <MeuGrupo />
  </AccessGate>
} />
<Route path="/entrar-grupo/:inviteCode" element={<JoinGroup />} />
```

---

## FASE 2.3: Dashboard de Progresso do Grupo

### Objetivo
Exibir o progresso de todos os membros do grupo em trilhas atribuídas, permitindo ao líder acompanhar a jornada espiritual de cada um.

### 2.3.1 - Modificações no Banco de Dados

**Criar view para progresso do grupo:**

```sql
CREATE VIEW small_group_progress AS
SELECT 
  sgm.group_id,
  sgm.user_id,
  p.full_name,
  p.avatar_url,
  sgt.track_id,
  dt.title as track_title,
  COUNT(up.id) FILTER (WHERE up.completed = true) as completed_contents,
  COUNT(c.id) as total_contents,
  ROUND(
    (COUNT(up.id) FILTER (WHERE up.completed = true)::decimal / 
     NULLIF(COUNT(c.id), 0)) * 100, 
    2
  ) as progress_percentage
FROM small_group_members sgm
JOIN profiles p ON p.id = sgm.user_id
JOIN small_group_tracks sgt ON sgt.group_id = sgm.group_id
JOIN discipleship_tracks dt ON dt.id = sgt.track_id
LEFT JOIN conteudos c ON c.trilha_id = sgt.track_id
LEFT JOIN user_progress up ON up.user_id = sgm.user_id AND up.content_id = c.id
GROUP BY sgm.group_id, sgm.user_id, p.full_name, p.avatar_url, sgt.track_id, dt.title;
```

### 2.3.2 - Componentes de Interface

**Novos arquivos:**
1. `src/components/groups/GroupProgressDashboard.tsx` - Dashboard principal
2. `src/components/groups/MemberProgressCard.tsx` - Card de progresso individual
3. `src/components/groups/TrackProgressChart.tsx` - Gráfico de progresso da trilha

**Funcionalidades:**
- Visualizar progresso de cada membro
- Comparar progresso entre membros
- Ver trilhas em andamento e concluídas
- Notificar membros sobre tarefas pendentes

---

## FASE 3: Sistema Financeiro Básico (Hodos Farol)

### Objetivo
Criar um sistema simples de tracking de dízimos e ofertas para igrejas do plano **Hodos Farol**, com estrutura escalável para futuras funcionalidades.

### 3.1 - Estrutura do Banco de Dados

**Tabelas principais:**

```sql
-- Categorias de transações financeiras
CREATE TABLE church_financial_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid REFERENCES churches(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Transações financeiras
CREATE TABLE church_financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid REFERENCES churches(id) ON DELETE CASCADE,
  category_id uuid REFERENCES church_financial_categories(id),
  type text NOT NULL CHECK (type IN ('dizimo', 'oferta', 'campanha', 'outro_income', 'despesa')),
  amount decimal(10,2) NOT NULL,
  description text,
  contributor_name text, -- Nome opcional do contribuinte
  is_anonymous boolean DEFAULT false,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  recorded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_transactions_church ON church_financial_transactions(church_id);
CREATE INDEX idx_transactions_date ON church_financial_transactions(transaction_date);
CREATE INDEX idx_transactions_type ON church_financial_transactions(type);
```

**Políticas RLS:**
- Apenas admins de igrejas Farol podem acessar
- Dados isolados por igreja

### 3.2 - Componentes de Interface

**Novos arquivos:**
1. `src/pages/admin/ChurchFinances.tsx` - Página principal financeira
2. `src/components/finances/FinanceDashboard.tsx` - Dashboard com métricas
3. `src/components/finances/TransactionList.tsx` - Lista de transações
4. `src/components/finances/AddTransactionDialog.tsx` - Adicionar transação
5. `src/components/finances/FinanceReports.tsx` - Relatórios básicos
6. `src/hooks/useChurchFinances.ts` - Hook para operações financeiras

**Funcionalidades iniciais:**
- Registrar dízimos e ofertas
- Listar transações com filtros (data, tipo)
- Dashboard com totais do mês
- Relatório mensal simples

**Preparação para escalabilidade:**
- Campo `type` extensível para incluir despesas futuras
- Tabela de categorias para organização
- Estrutura pronta para múltiplas contas bancárias

### 3.3 - Rotas e Proteção

```tsx
<Route path="/admin/igrejas/:churchSlug/financeiro" element={
  <ChurchAdminRoute>
    <AccessGate requiredAccess="canManageFinances">
      <ChurchFinances />
    </AccessGate>
  </ChurchAdminRoute>
} />
```

---

## FASE 4: Chat Direto com Super Admin

### Objetivo
Permitir que qualquer usuário envie mensagens diretamente para o Super Admin (suporte Hodos), com inbox dedicada para gerenciamento.

### 4.1 - Modificações no Banco de Dados

**Atualizar tabela `mensagens`:**

```sql
ALTER TABLE mensagens
ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'church_leadership' 
  CHECK (message_type IN ('church_leadership', 'super_admin_support')),
ADD COLUMN IF NOT EXISTS parent_message_id uuid REFERENCES mensagens(id),
ADD COLUMN IF NOT EXISTS read_at timestamptz,
ADD COLUMN IF NOT EXISTS replied_at timestamptz,
ADD COLUMN IF NOT EXISTS subject text;

CREATE INDEX idx_mensagens_type ON mensagens(message_type);
CREATE INDEX idx_mensagens_destinatario ON mensagens(destinatario_id);
```

**Políticas RLS:**
- Usuários podem enviar mensagens para super_admin_support
- Super Admin pode ver todas as mensagens deste tipo
- Usuários podem ver apenas suas próprias mensagens

### 4.2 - Componentes de Interface

**Modificar arquivo existente:**
`src/pages/FaleComLideranca.tsx`
- Adicionar opção "Falar com Suporte Hodos"
- Separar em abas: "Liderança da Igreja" e "Suporte Hodos"

**Novos arquivos:**
1. `src/pages/admin/SupportInbox.tsx` - Inbox do Super Admin
2. `src/components/support/MessageThread.tsx` - Thread de conversa
3. `src/components/support/ReplyDialog.tsx` - Responder mensagem
4. `src/components/support/SupportMessageCard.tsx` - Card de mensagem
5. `src/hooks/useSupportMessages.ts` - Hook para mensagens

**Funcionalidades:**
- Usuário escolhe enviar para liderança ou suporte Hodos
- Super Admin vê inbox com todas as mensagens
- Resposta direta na thread
- Marcar como lida/resolvida
- Badge de notificação no sidebar

### 4.3 - Rotas

```tsx
<Route path="/admin/hodos/mensagens" element={
  <SuperAdminRoute>
    <SupportInbox />
  </SuperAdminRoute>
} />
```

---

## Cronograma de Implementação

| Fase | Descrição | Tempo Estimado |
|------|-----------|----------------|
| 2.2 | Pequenos Grupos | 4-6 horas |
| 2.3 | Dashboard Progresso | 2-3 horas |
| 3 | Sistema Financeiro | 4-6 horas |
| 4 | Chat Super Admin | 3-4 horas |

**Total: 13-19 horas de trabalho (2-3 dias)**

---

## Ordem Recomendada de Implementação

1. **Fase 4** (Chat Super Admin) - Mais rápido e útil imediatamente
2. **Fase 2.2** (Pequenos Grupos) - Diferenciador do Hodos Guia
3. **Fase 2.3** (Dashboard Progresso) - Complemento do 2.2
4. **Fase 3** (Financeiro) - Feature premium para Farol

---

## Detalhes Técnicos

### Arquivos a serem criados:

**Fase 2.2 (Grupos):**
```
src/pages/MeuGrupo.tsx
src/pages/JoinGroup.tsx
src/components/groups/CreateSmallGroupDialog.tsx
src/components/groups/SmallGroupMembers.tsx
src/components/groups/InviteMemberDialog.tsx
src/components/groups/AssignTrackDialog.tsx
src/hooks/useSmallGroup.ts
```

**Fase 2.3 (Dashboard):**
```
src/components/groups/GroupProgressDashboard.tsx
src/components/groups/MemberProgressCard.tsx
src/components/groups/TrackProgressChart.tsx
```

**Fase 3 (Financeiro):**
```
src/pages/admin/ChurchFinances.tsx
src/components/finances/FinanceDashboard.tsx
src/components/finances/TransactionList.tsx
src/components/finances/AddTransactionDialog.tsx
src/components/finances/FinanceReports.tsx
src/hooks/useChurchFinances.ts
```

**Fase 4 (Chat):**
```
src/pages/admin/SupportInbox.tsx
src/components/support/MessageThread.tsx
src/components/support/ReplyDialog.tsx
src/components/support/SupportMessageCard.tsx
src/hooks/useSupportMessages.ts
```

### Arquivos a serem modificados:

- `src/App.tsx` - Novas rotas
- `src/pages/FaleComLideranca.tsx` - Opção suporte Hodos
- `src/pages/admin/SuperAdminDashboard.tsx` - Link para inbox
- `src/components/layout/AdminSidebar.tsx` - Badge de mensagens
- `src/pages/IndividualDashboard.tsx` - Link para "Meu Grupo"

