# Sistema de Roles e Permissões - Hodos

Este documento define as permissões e restrições de cada role (papel) no sistema Hodos.

## Roles Disponíveis

### 1. `visitor` (Visitante)
**Descrição:** Usuário logado sem vínculo de igreja. Acesso limitado a conteúdo público.

**Características:**
- Usuário autenticado mas sem `church_id` definido
- Não possui registro na tabela `user_roles` OU possui role `visitor`
- Acesso apenas a conteúdos marcados como `is_public = true`

**Redirecionamento inicial:** `/meu-espaco` (área pública)

---

### 2. `member` (Membro)
**Descrição:** Membro comum de uma igreja. Acesso completo às funcionalidades da igreja.

**Características:**
- Vinculado a uma igreja (`profiles.church_id` definido)
- Pode participar de grupos, eventos, comunicação
- Acesso de leitura e escrita em conteúdos da igreja

**Redirecionamento inicial:** `/igreja/:slug` (página da igreja)

---

### 3. `lider` (Líder)
**Descrição:** Papel intermediário entre member e admin. Gerencia grupos/ministérios específicos.

**Características:**
- Vinculado a uma igreja (`profiles.church_id` definido)
- **NÃO** possui acesso à área `/admin`
- Pode gerenciar apenas grupos/ministérios vinculados a ele
- Pode visualizar estatísticas/relatórios do seu escopo

**Permissões específicas:**
- ✅ Ver lista de membros do seu grupo/ministério
- ✅ Editar conteúdos (trilhas, devocionais) vinculados ao seu grupo/ministério
- ✅ Ver relatórios e estatísticas do seu grupo
- ❌ Criar eventos gerais da igreja
- ❌ Acessar painel administrativo `/admin`
- ❌ Ver membros de outros grupos/ministérios
- ❌ Editar configurações da igreja

**Redirecionamento inicial:** `/igreja/:slug` (página da igreja)

---

### 4. `admin` (Administrador da Igreja)
**Descrição:** Administrador de uma igreja específica. Gerencia todos os aspectos da igreja.

**Características:**
- Pode ter `user_roles.church_id` específico (admin de UMA igreja)
- Pode ter `user_roles.church_id = NULL` (admin GLOBAL - gerencia todas as igrejas)
- Acesso total à área `/admin/igrejas/:slug` da(s) igreja(s) sob sua gestão

**Permissões específicas:**
- ✅ Criar, editar, deletar eventos
- ✅ Gerenciar membros (adicionar, remover, editar)
- ✅ Gerenciar grupos e ministérios
- ✅ Criar e editar trilhas, devocionais, avisos
- ✅ Ver relatórios e estatísticas completas da igreja
- ✅ Configurar personalização da igreja (logo, cores)
- ❌ Criar novas igrejas (apenas super_admin)
- ❌ Gerenciar outras igrejas (exceto se admin global)

**Redirecionamento inicial:** `/admin/igrejas/:slug` (painel da igreja)

---

### 5. `super_admin` (Super Administrador)
**Descrição:** Administrador geral do Hodos. Acesso irrestrito à plataforma completa.

**Características:**
- Acesso global a todas as igrejas
- Pode criar, editar, deletar igrejas
- Gerencia conteúdos públicos da plataforma
- Gerencia admins globais

**Permissões específicas:**
- ✅ Todas as permissões de `admin`
- ✅ Criar e gerenciar igrejas
- ✅ Gerenciar admins globais
- ✅ Acessar área `/admin/hodos` (dashboard geral)
- ✅ Gerenciar conteúdos públicos (devocionais, trilhas)

**Redirecionamento inicial:** `/admin/hodos` (dashboard Hodos)

---

## Tabela Comparativa de Permissões

| Ação | visitor | member | lider | admin | super_admin |
|------|---------|--------|-------|-------|-------------|
| **Conteúdo Público** |
| Ver devocionais públicos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver trilhas públicas | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Igreja - Visualização** |
| Ver devocionais da igreja | ❌ | ✅ | ✅ | ✅ | ✅ |
| Ver eventos da igreja | ❌ | ✅ | ✅ | ✅ | ✅ |
| Ver agenda | ❌ | ✅ | ✅ | ✅ | ✅ |
| Ver avisos | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Participação** |
| Criar posts/comentários | ❌ | ✅ | ✅ | ✅ | ✅ |
| Participar de grupos | ❌ | ✅ | ✅ | ✅ | ✅ |
| Inscrever-se em eventos | ❌ | ✅ | ✅ | ✅ | ✅ |
| Fazer trilhas | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Gestão de Grupos** |
| Gerenciar próprio grupo/ministério | ❌ | ❌ | ✅ | ✅ | ✅ |
| Ver membros do próprio grupo | ❌ | ❌ | ✅ | ✅ | ✅ |
| Editar conteúdo do próprio grupo | ❌ | ❌ | ✅ | ✅ | ✅ |
| Ver estatísticas do próprio grupo | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Administração da Igreja** |
| Criar eventos | ❌ | ❌ | ❌ | ✅ | ✅ |
| Editar eventos | ❌ | ❌ | ❌ | ✅ | ✅ |
| Ver todos os membros | ❌ | ❌ | ❌ | ✅ | ✅ |
| Gerenciar membros | ❌ | ❌ | ❌ | ✅ | ✅ |
| Criar/editar trilhas | ❌ | ❌ | ❌ | ✅ | ✅ |
| Criar/editar devocionais | ❌ | ❌ | ❌ | ✅ | ✅ |
| Ver relatórios completos | ❌ | ❌ | ❌ | ✅ | ✅ |
| Acessar /admin | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Super Administração** |
| Criar igrejas | ❌ | ❌ | ❌ | ❌ | ✅ |
| Gerenciar qualquer igreja | ❌ | ❌ | ❌ | ❌ | ✅ |
| Gerenciar conteúdo público | ❌ | ❌ | ❌ | ❌ | ✅ |
| Acessar /admin/hodos | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Regras de Vínculo

### `profiles.church_id` vs `user_roles.church_id`

**Regra crítica:** `profiles.church_id` **SEMPRE** deve ser igual a `user_roles.church_id`

- **`profiles.church_id`**: Igreja à qual o usuário pertence como membro
- **`user_roles.church_id`**: Igreja sobre a qual o usuário tem permissões administrativas

**Exceções:**
- `super_admin`: Não precisa ter `church_id` definido (acesso global)
- `admin` global: Pode ter `user_roles.church_id = NULL` (gerencia todas as igrejas)
- `visitor`: Não tem `church_id` em nenhuma tabela

---

## Fluxo de Redirecionamento

```
Usuário faz login
      |
      v
Sistema verifica roles em user_roles
      |
      ├─> super_admin? → /admin/hodos
      |
      ├─> admin? → /admin/igrejas/:slug (ou /admin/hodos/igrejas se não tiver igreja)
      |
      ├─> member/lider? → /igreja/:slug (ou /meu-espaco se não tiver igreja)
      |
      └─> visitor (ou sem role)? → /meu-espaco (conteúdo público)
```

---

## Proteção de Rotas

### Componentes de Proteção

1. **`ProtectedRoute`**: Requer usuário autenticado
2. **`AdminRoute`**: Requer role `admin` OU `super_admin`
3. **`SuperAdminRoute`**: Requer role `super_admin`
4. **`ChurchAdminRoute`**: Requer permissão específica para gerenciar a igreja
5. **`VisitorRoute`**: Bloqueia ou permite visitors baseado em prop

### Exemplos de Uso

```tsx
// Bloquear visitors de acessar comunicação
<Route path="/comunicacao" element={
  <VisitorRoute>
    <Comunicacao />
  </VisitorRoute>
} />

// Permitir visitors em devocionais públicos
<Route path="/devocional" element={
  <VisitorRoute allowVisitors={true}>
    <Devocional />
  </VisitorRoute>
} />

// Apenas admins da igreja específica
<Route path="/admin/igrejas/:slug" element={
  <ChurchAdminRoute>
    <ChurchAdminDashboard />
  </ChurchAdminRoute>
} />
```

---

## Funções SQL Auxiliares

### `is_admin()`
Verifica se usuário atual é `admin` OU `super_admin`

### `is_super_admin()`
Verifica se usuário atual é `super_admin`

### `is_lider()`
Verifica se usuário atual é `lider`

### `is_church_admin(p_church_id uuid)`
Verifica se usuário pode gerenciar igreja específica:
- `super_admin`: Sempre true
- `admin` com `church_id = NULL`: Sempre true (admin global)
- `admin` com `church_id = p_church_id`: True para essa igreja

### `is_group_leader(p_user_id uuid)`
Verifica se usuário tem role `lider`

### `get_user_church_id(p_user_id uuid)`
Retorna o `church_id` do perfil do usuário

---

## Notas Importantes

1. **Segurança:** Roles são armazenadas APENAS em `user_roles` (nunca em `profiles`)
2. **Usuários sem role:** Tratados automaticamente como `visitor`
3. **Admin global:** `user_roles.church_id = NULL` + `role = 'admin'` = gerencia todas as igrejas
4. **RLS Policies:** Todas as políticas devem usar as funções SQL auxiliares, nunca consultar `profiles.role`

---

## Changelog

- **v1.0** (2025-01-07): Normalização completa do sistema de roles
  - Adicionada role `visitor`
  - Removida coluna `profiles.role` (depreciada)
  - Criadas funções SQL auxiliares
  - Documentação inicial
