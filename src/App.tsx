
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
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
import AuthPage from "./components/auth/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
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
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
