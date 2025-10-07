import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

interface VisitorRouteProps {
  children: React.ReactNode;
  allowVisitors?: boolean;
}

/**
 * VisitorRoute: Componente de proteção de rotas
 * 
 * Bloqueia acesso de visitors a rotas específicas, redirecionando para /meu-espaco
 * 
 * @param allowVisitors - Se true, permite acesso de visitors. Padrão: false
 * 
 * @example
 * // Bloquear visitors de acessar comunicação
 * <Route path="/comunicacao" element={
 *   <VisitorRoute>
 *     <Comunicacao />
 *   </VisitorRoute>
 * } />
 * 
 * @example
 * // Permitir visitors em conteúdo público
 * <Route path="/devocional" element={
 *   <VisitorRoute allowVisitors={true}>
 *     <Devocional />
 *   </VisitorRoute>
 * } />
 */
const VisitorRoute: React.FC<VisitorRouteProps> = ({ children, allowVisitors = false }) => {
  const { permissionLevel, loading } = usePermissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se é visitor e a rota não permite visitors, redireciona
  if (permissionLevel === 'visitor' && !allowVisitors) {
    return <Navigate to="/meu-espaco" replace />;
  }

  return <>{children}</>;
};

export default VisitorRoute;
