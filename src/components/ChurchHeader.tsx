import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star } from "lucide-react";
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
}

const ChurchHeader = ({ church }: ChurchHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const churchName = church?.name || "MONTE HEBROM";
  const churchLogo = church?.logo_url || "/lovable-uploads/a989c536-6a58-44f9-a982-3a6b3847a288.png";
  const churchHeadline = church?.headline || "Lugar de Refúgio e Aliança";

  return (
    <div className="relative bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border-b border-blue-100">
      {/* User Menu no canto superior direito */}
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
      
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <img 
            src={churchLogo}
            alt={churchName} 
            className="h-16 w-16 object-contain" 
          />
          
          {/* Informações da Igreja */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold font-playfair text-blue-900">
              {churchName}
            </h1>
            {churchHeadline && (
              <p className="text-lg font-semibold text-blue-700 mt-1">
                {churchHeadline}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChurchHeader;
