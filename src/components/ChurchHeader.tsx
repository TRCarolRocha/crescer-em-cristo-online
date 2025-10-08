import { Button } from "@/components/ui/button";
import { Paintbrush } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "./auth/UserMenu";

interface Church {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  headline: string | null;
  description: string | null;
  primary_color: string;
  secondary_color: string;
}

interface ChurchHeaderProps {
  church?: Church;
  showCustomizeButton?: boolean;
  onCustomize?: () => void;
}

const ChurchHeader = ({ church, showCustomizeButton = false, onCustomize }: ChurchHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const churchName = church?.name || "MONTE HEBROM";
  const churchLogo = church?.logo_url || "/lovable-uploads/a989c536-6a58-44f9-a982-3a6b3847a288.png";
  const churchHeadline = church?.headline || "Lugar de Refúgio e Aliança";

  return (
    <div className="relative bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border-b border-blue-100">
      {/* UserMenu no canto superior direito */}
      <div className="absolute top-4 right-4 z-10">
        {user ? (
          <UserMenu />
        ) : (
          <Button 
            variant="outline" 
            onClick={() => navigate('/auth')} 
            className="bg-white/90 backdrop-blur-sm border-blue-200/40 hover:bg-white/95"
          >
            Entrar
          </Button>
        )}
      </div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Logo */}
          <img 
            src={churchLogo}
            alt={churchName} 
            className="h-12 w-12 sm:h-16 sm:w-16 object-contain flex-shrink-0" 
          />
          
          {/* Informações da Igreja */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold font-playfair text-blue-900 truncate">
              {churchName}
            </h1>
            {churchHeadline && (
              <p className="text-sm sm:text-base md:text-lg font-semibold text-blue-700 mt-0.5 sm:mt-1 truncate">
                {churchHeadline}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Botão Personalizar no canto inferior direito */}
      {showCustomizeButton && onCustomize && (
        <button
          onClick={onCustomize}
          className="absolute bottom-4 right-4 p-3 rounded-full bg-gradient-to-r from-[#7b2ff7] to-[#f107a3] text-white shadow-lg hover:shadow-xl transition-all hover:scale-110"
          aria-label="Personalizar igreja"
        >
          <Paintbrush className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default ChurchHeader;
