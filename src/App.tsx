
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ChurchProvider } from "@/contexts/ChurchContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChurchSidebar } from "@/components/layout/ChurchSidebar";
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
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import SuperAdminRoute from "./components/SuperAdminRoute";
import ChurchAdminRoute from "./components/ChurchAdminRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/igreja/monte-hebrom" replace />;
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
                  <SuperAdminDashboard />
                </SuperAdminRoute>
              } />
              <Route path="/admin/hodos/igrejas" element={
                <SuperAdminRoute>
                  <ChurchList />
                </SuperAdminRoute>
              } />
              <Route path="/admin/hodos/conteudos" element={
                <SuperAdminRoute>
                  <PublicContent />
                </SuperAdminRoute>
              } />
              
              {/* Church Admin Routes */}
              <Route path="/admin/igrejas/:churchSlug" element={
                <ChurchAdminRoute>
                  <ChurchAdminDashboard />
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
