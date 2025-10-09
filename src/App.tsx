
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ChurchProvider } from "@/contexts/ChurchContext";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChurchSidebar } from "@/components/layout/ChurchSidebar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import LandingPage from "./pages/LandingPage";
import ChurchHomePage from "./pages/ChurchHomePage";
import IndividualDashboard from "./pages/IndividualDashboard";
import Comunicacao from "./pages/Comunicacao";
import FaleComLideranca from "./pages/FaleComLideranca";
import Agenda from "./pages/Agenda";
import Devocional from "./pages/Devocional";
import HistoricoDevocional from "./pages/HistoricoDevocional";
import Trilhas from "./pages/Trilhas";
import Diagnostico from "./pages/Diagnostico";
import Progresso from "./pages/Progresso";
import Membros from "./pages/Membros";
import Perfil from "./pages/Perfil";
import Admin from "./pages/Admin";
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard";
import ChurchAdminDashboard from "./pages/admin/ChurchAdminDashboard";
import ChurchList from "./pages/admin/ChurchList";
import PublicContent from "./pages/admin/PublicContent";
import AuthPage from "./components/auth/AuthPage";
import Planos from "./pages/Planos";
import AssinaturaFree from "./pages/assinatura/AssinaturaFree";
import AssinaturaIndividual from "./pages/assinatura/AssinaturaIndividual";
import AssinaturaIgreja from "./pages/assinatura/AssinaturaIgreja";
import DiagnosticoPublico from "./pages/DiagnosticoPublico";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import SuperAdminRoute from "./components/SuperAdminRoute";
import ChurchAdminRoute from "./components/ChurchAdminRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [churchSlug, setChurchSlug] = useState<string | null>(null);
  const [checkingRoles, setCheckingRoles] = useState(true);

  useEffect(() => {
    const checkUserRoles = async () => {
      if (!user) {
        setCheckingRoles(false);
        return;
      }

      try {
        // Buscar roles do usuário
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role, church_id, churches(slug)')
          .eq('user_id', user.id);

        if (!rolesError && rolesData) {
          setRoles(rolesData.map(r => r.role));

          // Se for admin, buscar slug da igreja
          const adminRole = rolesData.find(r => r.role === 'admin');
          if (adminRole?.churches?.slug) {
            setChurchSlug(adminRole.churches.slug);
          }
        }

        // Se não é admin, buscar igreja do perfil (para member/lider)
        if (!rolesData?.some(r => r.role === 'admin')) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('church_id, churches(slug)')
            .eq('id', user.id)
            .single();

          if (profileData?.churches?.slug) {
            setChurchSlug(profileData.churches.slug);
          }
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      } finally {
        setCheckingRoles(false);
      }
    };

    checkUserRoles();
  }, [user]);

  if (loading || checkingRoles) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    // Todos os usuários autenticados vão para /meu-espaco por padrão
    return <Navigate to="/meu-espaco" replace />;
  }

  return <LandingPage />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ChurchProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Super Admin Routes */}
              <Route path="/admin/hodos" element={
                <SuperAdminRoute>
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <AdminSidebar />
                      <main className="flex-1">
                        <SuperAdminDashboard />
                      </main>
                    </div>
                  </SidebarProvider>
                </SuperAdminRoute>
              } />
              <Route path="/admin/hodos/igrejas" element={
                <SuperAdminRoute>
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <AdminSidebar />
                      <main className="flex-1">
                        <ChurchList />
                      </main>
                    </div>
                  </SidebarProvider>
                </SuperAdminRoute>
              } />
              <Route path="/admin/hodos/conteudos" element={
                <SuperAdminRoute>
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <AdminSidebar />
                      <main className="flex-1">
                        <PublicContent />
                      </main>
                    </div>
                  </SidebarProvider>
                </SuperAdminRoute>
              } />
              
              {/* Church Admin Routes */}
              <Route path="/admin/igrejas/:churchSlug" element={
                <ChurchAdminRoute>
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <AdminSidebar />
                      <main className="flex-1">
                        <ChurchAdminDashboard />
                      </main>
                    </div>
                  </SidebarProvider>
                </ChurchAdminRoute>
              } />
              
              {/* Church Routes with Sidebar */}
              <Route path="/igreja/:churchSlug" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                      <ChurchSidebar />
                      <main className="flex-1">
                        <ChurchHomePage />
                      </main>
                      <BottomNav />
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              {/* Individual User Space */}
            <Route path="/meu-espaco" element={
                <ProtectedRoute>
                  <IndividualDashboard />
                </ProtectedRoute>
              } />
            <Route path="/diagnostico" element={<Diagnostico />} />
            <Route path="/diagnostico-publico" element={<DiagnosticoPublico />} />
            <Route path="/planos" element={<Planos />} />
            <Route path="/assinatura/free" element={<AssinaturaFree />} />
            <Route path="/assinatura/individual" element={<AssinaturaIndividual />} />
            <Route path="/assinatura/igreja" element={<AssinaturaIgreja />} />
            <Route path="/fale-com-lideranca" element={
              <ProtectedRoute>
                <FaleComLideranca />
              </ProtectedRoute>
            } />
            <Route path="/devocional" element={
              <ProtectedRoute>
                <Devocional />
              </ProtectedRoute>
            } />
            <Route path="/historico-devocional" element={
              <ProtectedRoute>
                <HistoricoDevocional />
              </ProtectedRoute>
            } />
            <Route path="/perfil" element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } />
            <Route path="/trilhas" element={
              <ProtectedRoute>
                <Trilhas />
              </ProtectedRoute>
            } />
            <Route path="/progresso" element={
              <ProtectedRoute>
                <Progresso />
              </ProtectedRoute>
            } />
            <Route path="/agenda" element={
              <ProtectedRoute>
                <Agenda />
              </ProtectedRoute>
            } />
            <Route path="/membros" element={
              <ProtectedRoute>
                <Membros />
              </ProtectedRoute>
            } />
            <Route path="/comunicacao" element={
              <ProtectedRoute>
                <Comunicacao />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </ChurchProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
