import { Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const HodosHomeButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Não mostrar na própria landing page
  if (location.pathname === '/') return null;

  return (
    <Button
      variant="ghost"
      size="lg"
      onClick={() => navigate('/')}
      className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7b2ff7] to-[#f107a3]"
    >
      <Home className="mr-2 h-5 w-5 text-[#7b2ff7]" />
      HODOS
    </Button>
  );
};
