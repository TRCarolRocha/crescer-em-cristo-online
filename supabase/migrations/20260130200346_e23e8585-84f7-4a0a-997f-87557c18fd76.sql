-- FASE 2.2: Gestão de Pequenos Grupos (Hodos Guia)

-- Tabela principal de pequenos grupos
CREATE TABLE small_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  leader_id uuid REFERENCES auth.users(id) NOT NULL,
  max_members integer DEFAULT 10,
  invite_code text UNIQUE DEFAULT encode(gen_random_bytes(4), 'hex'),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Membros do grupo
CREATE TABLE small_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES small_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('member', 'co-leader')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Trilhas atribuídas ao grupo
CREATE TABLE small_group_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES small_groups(id) ON DELETE CASCADE NOT NULL,
  track_id uuid REFERENCES discipleship_tracks(id) ON DELETE CASCADE NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  due_date date,
  UNIQUE(group_id, track_id)
);

-- Índices para performance
CREATE INDEX idx_small_groups_leader ON small_groups(leader_id);
CREATE INDEX idx_small_groups_invite ON small_groups(invite_code);
CREATE INDEX idx_small_group_members_group ON small_group_members(group_id);
CREATE INDEX idx_small_group_members_user ON small_group_members(user_id);
CREATE INDEX idx_small_group_tracks_group ON small_group_tracks(group_id);

-- Trigger para limitar membros a 10
CREATE OR REPLACE FUNCTION check_small_group_member_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count integer;
  max_limit integer;
BEGIN
  -- Obter o limite máximo do grupo
  SELECT max_members INTO max_limit FROM small_groups WHERE id = NEW.group_id;
  
  -- Contar membros atuais (excluindo o líder que não está na tabela de membros)
  SELECT COUNT(*) INTO current_count FROM small_group_members WHERE group_id = NEW.group_id;
  
  IF current_count >= max_limit THEN
    RAISE EXCEPTION 'O grupo atingiu o limite máximo de % membros', max_limit;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_small_group_member_limit
BEFORE INSERT ON small_group_members
FOR EACH ROW
EXECUTE FUNCTION check_small_group_member_limit();

-- Habilitar RLS
ALTER TABLE small_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE small_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE small_group_tracks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para small_groups

-- Líderes podem ver seus próprios grupos
CREATE POLICY "Leaders can view own groups"
ON small_groups FOR SELECT
USING (leader_id = auth.uid());

-- Membros podem ver grupos que participam
CREATE POLICY "Members can view their groups"
ON small_groups FOR SELECT
USING (
  id IN (SELECT group_id FROM small_group_members WHERE user_id = auth.uid())
);

-- Usuários podem criar grupos (verificação de plano feita na aplicação)
CREATE POLICY "Users can create groups"
ON small_groups FOR INSERT
WITH CHECK (leader_id = auth.uid());

-- Líderes podem atualizar seus grupos
CREATE POLICY "Leaders can update own groups"
ON small_groups FOR UPDATE
USING (leader_id = auth.uid());

-- Líderes podem deletar seus grupos
CREATE POLICY "Leaders can delete own groups"
ON small_groups FOR DELETE
USING (leader_id = auth.uid());

-- Políticas RLS para small_group_members

-- Qualquer um pode ver membros de grupos que participa
CREATE POLICY "Group participants can view members"
ON small_group_members FOR SELECT
USING (
  group_id IN (
    SELECT id FROM small_groups WHERE leader_id = auth.uid()
    UNION
    SELECT group_id FROM small_group_members WHERE user_id = auth.uid()
  )
);

-- Líderes podem adicionar membros
CREATE POLICY "Leaders can add members"
ON small_group_members FOR INSERT
WITH CHECK (
  group_id IN (SELECT id FROM small_groups WHERE leader_id = auth.uid())
  OR user_id = auth.uid() -- Usuário pode se adicionar (ao entrar via convite)
);

-- Líderes podem remover membros ou membros podem sair
CREATE POLICY "Leaders can remove members or self leave"
ON small_group_members FOR DELETE
USING (
  group_id IN (SELECT id FROM small_groups WHERE leader_id = auth.uid())
  OR user_id = auth.uid()
);

-- Líderes podem atualizar role dos membros
CREATE POLICY "Leaders can update member roles"
ON small_group_members FOR UPDATE
USING (
  group_id IN (SELECT id FROM small_groups WHERE leader_id = auth.uid())
);

-- Políticas RLS para small_group_tracks

-- Participantes podem ver trilhas do grupo
CREATE POLICY "Participants can view group tracks"
ON small_group_tracks FOR SELECT
USING (
  group_id IN (
    SELECT id FROM small_groups WHERE leader_id = auth.uid()
    UNION
    SELECT group_id FROM small_group_members WHERE user_id = auth.uid()
  )
);

-- Líderes podem gerenciar trilhas do grupo
CREATE POLICY "Leaders can manage group tracks"
ON small_group_tracks FOR INSERT
WITH CHECK (
  group_id IN (SELECT id FROM small_groups WHERE leader_id = auth.uid())
);

CREATE POLICY "Leaders can update group tracks"
ON small_group_tracks FOR UPDATE
USING (
  group_id IN (SELECT id FROM small_groups WHERE leader_id = auth.uid())
);

CREATE POLICY "Leaders can delete group tracks"
ON small_group_tracks FOR DELETE
USING (
  group_id IN (SELECT id FROM small_groups WHERE leader_id = auth.uid())
);