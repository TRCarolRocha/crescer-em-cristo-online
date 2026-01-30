import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Loader2, Check, X } from 'lucide-react';
import { useSmallGroup } from '@/hooks/useSmallGroup';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const JoinGroup = () => {
  const { inviteCode: urlCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [code, setCode] = useState(urlCode || '');
  const [groupInfo, setGroupInfo] = useState<{ name: string; memberCount: number; maxMembers: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { joinGroup } = useSmallGroup();

  useEffect(() => {
    if (urlCode) {
      fetchGroupInfo(urlCode);
    }
  }, [urlCode]);

  const fetchGroupInfo = async (inviteCode: string) => {
    setLoading(true);
    setError('');
    try {
      const { data: group, error: groupError } = await supabase
        .from('small_groups')
        .select('id, name, max_members')
        .eq('invite_code', inviteCode.toLowerCase())
        .eq('is_active', true)
        .single();

      if (groupError || !group) {
        setError('Código de convite inválido');
        setGroupInfo(null);
        return;
      }

      // Contar membros
      const { count } = await supabase
        .from('small_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id);

      setGroupInfo({
        name: group.name,
        memberCount: count || 0,
        maxMembers: group.max_members
      });
    } catch (err) {
      setError('Erro ao buscar informações do grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (code.trim()) {
      fetchGroupInfo(code.trim());
    }
  };

  const handleJoin = async () => {
    if (!code.trim()) return;

    try {
      await joinGroup.mutateAsync(code.trim());
      navigate('/meu-espaco');
    } catch (err) {
      // Error handled by hook
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 text-teal-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Entrar em um Grupo</h2>
            <p className="text-muted-foreground mb-6">
              Você precisa estar logado para entrar em um grupo.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/auth')} className="w-full">
                Fazer Login
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Entrar em um Grupo</h2>
            <p className="text-muted-foreground mt-2">
              Digite o código de convite para entrar em um grupo de estudo
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de Convite</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  placeholder="Ex: ABC123"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="font-mono text-center tracking-wider"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={!code.trim() || loading}
                  variant="outline"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <X className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {groupInfo && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-teal-600" />
                  <p className="font-medium text-teal-900">Grupo encontrado!</p>
                </div>
                <p className="text-lg font-semibold">{groupInfo.name}</p>
                <p className="text-sm text-teal-700">
                  {groupInfo.memberCount}/{groupInfo.maxMembers} membros
                </p>

                {groupInfo.memberCount >= groupInfo.maxMembers ? (
                  <p className="text-sm text-red-600 mt-2">
                    Este grupo está cheio
                  </p>
                ) : (
                  <Button 
                    onClick={handleJoin}
                    disabled={joinGroup.isPending}
                    className="w-full mt-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90"
                  >
                    {joinGroup.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar no Grupo'
                    )}
                  </Button>
                )}
              </div>
            )}

            <Button 
              onClick={() => navigate('/meu-espaco')} 
              variant="outline" 
              className="w-full"
            >
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinGroup;
