
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChurchHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen flex items-center">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200/15 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="text-center">
          {/* Subtítulo menor e mais sutil */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 text-xs md:text-sm font-medium text-blue-600/80 tracking-[0.2em] uppercase">
              <Sparkles className="h-3 w-3" />
              Igreja Batista Missionária
              <Sparkles className="h-3 w-3" />
            </span>
          </div>
          
          {/* Logo e Nome da Igreja lado a lado */}
          <div className="mb-8 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-2xl scale-110"></div>
                <img 
                  src="/lovable-uploads/a989c536-6a58-44f9-a982-3a6b3847a288.png" 
                  alt="Igreja Batista Missionária Ministério Monte Hebrom"
                  className="relative h-32 w-32 md:h-40 md:w-40 lg:h-48 lg:w-48 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
            
            {/* Nome da Igreja */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent block">
                  MONTE
                </span>
                <span className="bg-gradient-to-r from-purple-800 via-blue-800 to-indigo-900 bg-clip-text text-transparent block -mt-2 lg:-mt-4">
                  HEBROM
                </span>
              </h1>
            </div>
          </div>
          
          {/* Slogan */}
          <div className="mb-12">
            <p className="text-xl md:text-2xl font-semibold text-blue-800 mb-2">
              Lugar de Refúgio e Aliança
            </p>
            <p className="text-lg text-gray-600 font-medium">
              Ibamonte • Rio de Janeiro
            </p>
          </div>
          
          {/* Descrição mais concisa */}
          <div className="max-w-4xl mx-auto mb-16">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
              Plataforma digital de discipulado desenvolvida para 
              <span className="font-semibold text-blue-800"> fortalecer nossa comunidade de fé</span>
            </p>
            <p className="text-base md:text-lg text-gray-600">
              Trilhas personalizadas • Mentoria • Crescimento espiritual • Transformação contínua
            </p>
          </div>
          
          {/* Botões de ação principais */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              size="lg" 
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 px-12 py-6 text-xl font-bold rounded-full border-0"
              onClick={() => navigate('/diagnostico')}
            >
              Iniciar Minha Jornada
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-3 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 px-12 py-6 text-xl font-bold rounded-full shadow-xl hover:shadow-2xl bg-white/90 backdrop-blur-sm"
            >
              Conhecer as Trilhas
            </Button>
          </div>
          
          {/* Scroll indicator */}
          <div className="flex justify-center">
            <div className="animate-bounce">
              <div className="w-8 h-12 border-3 border-blue-400 rounded-full flex justify-center bg-white/20 backdrop-blur-sm">
                <div className="w-1.5 h-3 bg-blue-600 rounded-full mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChurchHeader;
