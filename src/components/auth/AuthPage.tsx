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
      
      // Fetch user church and redirect
      setTimeout(async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('church_id, churches(slug)')
            .eq('id', currentUser.id)
            .single();

          if (profile?.churches?.slug) {
            navigate(`/igreja/${(profile.churches as any).slug}`);
          } else {
            navigate('/meu-espaco');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Nome da Igreja */}
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/a989c536-6a58-44f9-a982-3a6b3847a288.png" 
            alt="Monte Hebrom" 
            className="h-20 w-20 mx-auto mb-4 drop-shadow-lg object-cover" 
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent">
            MONTE HEBROM
          </h1>
          <p className="text-gray-600">Lugar de Refúgio e Aliança</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Acesso à Plataforma</CardTitle>
            <CardDescription>
              Entre em sua conta ou cadastre-se para começar sua jornada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
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
                    <Label htmlFor="login-password">Senha</Label>
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
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Entrando..." : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Entrar
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome Completo</Label>
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
                    <Label htmlFor="signup-email">Email</Label>
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
                    <Label htmlFor="signup-password">Senha</Label>
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
                    <Label htmlFor="signup-confirm">Confirmar Senha</Label>
                    <Input 
                      id="signup-confirm" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Confirme sua senha" 
                      value={signupForm.confirmPassword} 
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })} 
                      required 
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Cadastrando..." : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Criar Conta
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="text-gray-600 hover:text-gray-900"
          >
            ← Voltar ao início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
