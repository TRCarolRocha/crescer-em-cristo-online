
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChurchHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="text-center">
          {/* Logo da Igreja */}
          <div className="mb-8 flex justify-center">
            <img 
              src="/lovable-uploads/a989c536-6a58-44f9-a982-3a6b3847a288.png" 
              alt="Igreja Batista Missionária Ministério Monte Hebrom"
              className="h-32 w-32 md:h-40 md:w-40 object-contain"
            />
          </div>
          
          <h2 className="text-2xl md:text-3xl text-blue-800 font-semibold mb-2">
            Igreja Batista Missionária Ministério
          </h2>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-900 via-purple-800 to-indigo-900 bg-clip-text text-transparent mb-6">
            Monte Hebrom
          </h1>
          <p className="text-lg text-blue-700 mb-4 font-medium">
            Lugar de Refúgio e Aliança - Ibamonte, Rio de Janeiro
          </p>
          
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-8"></div>
          
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            Nossa plataforma digital de discipulado foi desenvolvida especialmente para fortalecer 
            nossa comunidade de fé através de trilhas personalizadas, mentoria e crescimento espiritual.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => navigate('/diagnostico')}
            >
              Iniciar Minha Jornada
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
            >
              Conhecer as Trilhas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChurchHeader;
