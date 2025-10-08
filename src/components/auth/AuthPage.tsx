import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { HeaderLogo } from '@/components/common/HeaderLogo';
import { GradientButton } from '@/components/common/GradientButton';

const AuthPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    
    if (error) {
      toast({
        title: "Erro no Login",
        description: error.message === 'Invalid login credentials' ? "Email ou senha incorretos" : error.message,
        variant: "destructive"
      });
      setLoading(false);
    } else {
      toast({
        title: "Login realizado!",
        description: "Bem-vindo"
      });
      
      // Fetch user roles and church, then redirect
      setTimeout(async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          // Get user roles
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', currentUser.id);

          const roles = rolesData?.map(r => r.role) || [];

          // Get user profile with church
          const { data: profile } = await supabase
            .from('profiles')
            .select('church_id, churches(slug)')
            .eq('id', currentUser.id)
            .single();

          const churchSlug = (profile?.churches as any)?.slug || 'monte-hebrom';

          // Redirect based on role
          if (roles.includes('super_admin')) {
            navigate('/admin/hodos');
          } else if (roles.includes('admin')) {
            navigate(`/admin/igrejas/${churchSlug}`);
          } else if (profile?.church_id) {
            navigate(`/igreja/${churchSlug}`);
          } else {
            navigate('/');
          }
        }
        setLoading(false);
      }, 500);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Por favor, verifique as senhas digitadas",
        variant: "destructive"
      });
      return;
    }
    if (signupForm.password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    const { error } = await signUp(signupForm.email, signupForm.password, signupForm.fullName);
    if (error) {
      toast({
        title: "Erro no Cadastro",
        description: error.message === 'User already registered' ? "Este email já está cadastrado" : error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu email para confirmar a conta"
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-fuchsia-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Nome HODOS */}
        <div className="text-center mb-8 flex flex-col items-center">
          <HeaderLogo size="lg" className="mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            HODOS
          </h1>
          <p className="text-purple-200 text-lg font-light">Hub de Discipulado Digital</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-md border border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Acesso à Plataforma</CardTitle>
            <CardDescription className="text-purple-200">
              Entre em sua conta ou cadastre-se para começar sua jornada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/20">
                <TabsTrigger value="login" className="data-[state=active]:bg-white/90 data-[state=active]:text-purple-900">Entrar</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-white/90 data-[state=active]:text-purple-900">Cadastrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-white">Email</Label>
                    <Input 
                      id="login-email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={loginForm.email} 
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-white">Senha</Label>
                    <div className="relative">
                      <Input 
                        id="login-password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Sua senha" 
                        value={loginForm.password} 
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} 
                        required 
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" 
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <GradientButton type="submit" className="w-full" disabled={loading}>
                    {loading ? "Entrando..." : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Entrar
                      </>
                    )}
                  </GradientButton>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-white">Nome Completo</Label>
                    <Input 
                      id="signup-name" 
                      type="text" 
                      placeholder="Seu nome completo" 
                      value={signupForm.fullName} 
                      onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={signupForm.email} 
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white">Senha</Label>
                    <div className="relative">
                      <Input 
                        id="signup-password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Mínimo 6 caracteres" 
                        value={signupForm.password} 
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} 
                        required 
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" 
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-white">Confirmar Senha</Label>
                    <Input 
                      id="signup-confirm" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Confirme sua senha" 
                      value={signupForm.confirmPassword} 
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })} 
                      required 
                    />
                  </div>
                  <GradientButton type="submit" className="w-full" disabled={loading}>
                    {loading ? "Cadastrando..." : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Criar Conta
                      </>
                    )}
                  </GradientButton>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="text-white hover:text-purple-200 hover:bg-white/10"
          >
            ← Voltar ao início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
