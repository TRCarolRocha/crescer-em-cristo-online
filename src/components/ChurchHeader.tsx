
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "./auth/UserMenu";

const ChurchHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-[85vh] sm:min-h-[80vh] lg:min-h-[75vh] flex items-center">
      {/* Background decorative elements com animações */}
      <div className="absolute inset-0">
        <div className="absolute top-12 sm:top-16 left-4 sm:left-8 w-48 sm:w-64 h-48 sm:h-64 bg-blue-200/25 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-12 sm:bottom-16 right-4 sm:right-8 w-64 sm:w-80 h-64 sm:h-80 bg-purple-200/25 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 sm:w-72 h-60 sm:h-72 bg-indigo-200/20 rounded-full blur-3xl animate-glow"></div>
        
        {/* Elementos decorativos adicionais */}
        <div className="absolute top-16 sm:top-20 right-16 sm:right-20 animate-pulse">
          <Star className="h-3 sm:h-4 w-3 sm:w-4 text-blue-400/60" />
        </div>
        <div className="absolute bottom-24 sm:bottom-32 left-12 sm:left-16 animate-pulse" style={{ animationDelay: '1s' }}>
          <Star className="h-2 sm:h-3 w-2 sm:w-3 text-purple-400/60" />
        </div>
        <div className="absolute top-32 sm:top-40 left-1/4 sm:left-1/3 animate-pulse" style={{ animationDelay: '3s' }}>
          <Star className="h-2 w-2 text-indigo-400/60" />
        </div>
      </div>

      {/* User Menu no canto superior direito */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10">
        {user ? (
          <UserMenu />
        ) : (
          <Button 
            variant="outline" 
            onClick={() => navigate('/auth')} 
            className="bg-white/90 backdrop-blur-sm border-blue-200/40 hover:bg-white/95 transition-all duration-300 font-inter text-sm sm:text-base px-3 sm:px-4 py-2"
          >
            Entrar
          </Button>
        )}
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <div className="text-center">
          {/* Subtítulo da igreja - mais elegante */}
          <div className="mb-8 sm:mb-12">
            <div className="relative inline-flex items-center justify-center">
              {/* Background decorativo mais sutil */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/8 via-purple-600/8 to-blue-600/8 rounded-full blur-xl scale-110 animate-glow"></div>
              
              {/* Container principal com design mais moderno */}
              <div className="relative bg-white/80 backdrop-blur-md border border-blue-200/40 rounded-full px-4 sm:px-8 py-2 sm:py-3 shadow-xl shadow-blue-100/20">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm md:text-base font-semibold font-inter text-blue-900 tracking-[0.12em] uppercase bg-gradient-to-r from-blue-700 via-purple-700 to-blue-700 bg-clip-text text-transparent">
                    Igreja Batista Missionária Ministério
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Logo e Nome da Igreja lado a lado com logo aumentada */}
          <div className="mb-10 sm:mb-14 flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-10 lg:gap-16">
            {/* Logo com tamanho aumentado e proporção melhorada */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-2xl scale-110 animate-glow"></div>
                <img 
                  src="/lovable-uploads/a989c536-6a58-44f9-a982-3a6b3847a288.png" 
                  alt="Igreja Batista Missionária Ministério Monte Hebrom" 
                  className="relative h-32 w-32 sm:h-40 sm:w-40 md:h-52 md:w-52 lg:h-60 lg:w-60 xl:h-64 xl:w-64 object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105" 
                />
              </div>
            </div>
            
            {/* Nome da Igreja com nova tipografia */}
            <div className="text-center lg:text-left">
              <h1 className="font-playfair tracking-tight">
                <span className="block text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent">
                  MONTE
                </span>
                <span className="block text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold bg-gradient-to-r from-purple-800 via-blue-800 to-indigo-900 bg-clip-text text-transparent -mt-2 sm:-mt-3 lg:-mt-4">
                  HEBROM
                </span>
              </h1>
            </div>
          </div>
          
          {/* NÍVEL 1: Slogan Principal Unificado */}
          <div className="mb-8 sm:mb-10">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl px-6 sm:px-8 py-4 sm:py-6 mx-auto max-w-2xl border border-blue-100/50 shadow-lg">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold font-playfair text-blue-900 mb-2">
                Lugar de Refúgio e Aliança
              </p>
              <p className="text-lg sm:text-xl font-semibold font-inter text-blue-700 tracking-wide">
                IBAMONTE
              </p>
            </div>
          </div>

          {/* NÍVEL 2: Mensagem Inspiracional Combinada */}
          <div className="mb-8 sm:mb-10 max-w-4xl mx-auto">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold font-inter bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              "Onde Vidas São Transformadas pelo Poder da Palavra"
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-medium font-inter text-blue-700">
              Crescendo em Cristo • Unidos em Propósito • Avivados para Servir
            </p>
          </div>
          
          {/* NÍVEL 3: Descrição da Plataforma Simplificada */}
          <div className="mb-10 sm:mb-12 max-w-3xl mx-auto">
            <p className="text-base sm:text-lg md:text-xl font-inter text-gray-700 leading-relaxed bg-white/40 backdrop-blur-sm rounded-xl px-6 py-4 border border-gray-200/50">
              Plataforma de discipulado que fortalece nossa comunidade e capacita cada membro para 
              <span className="font-semibold text-blue-800"> proclamar o Evangelho</span> com paixão e propósito.
            </p>
          </div>
          
          {/* Call-to-actions estratégicos */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 sm:px-0">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-inter font-semibold px-8 py-4 text-base sm:text-lg" 
              onClick={() => navigate('/comunicacao')}
            >
              💬 Conhecer Nossa Comunidade
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto border-2 border-blue-300 hover:border-blue-400 bg-white/90 hover:bg-white text-blue-800 hover:text-blue-900 backdrop-blur-sm transition-all duration-300 font-inter font-semibold px-8 py-4 text-base sm:text-lg shadow-md hover:shadow-lg" 
              onClick={() => navigate('/devocional')}
            >
              📖 Acessar Devocionais
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChurchHeader;
