
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChurchHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200/15 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="text-center">
          {/* Logo da Igreja com melhor proporção */}
          <div className="mb-12 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-xl"></div>
              <img 
                src="/lovable-uploads/a989c536-6a58-44f9-a982-3a6b3847a288.png" 
                alt="Igreja Batista Missionária Ministério Monte Hebrom"
                className="relative h-28 w-28 md:h-36 md:w-36 lg:h-40 lg:w-40 object-contain drop-shadow-lg"
              />
            </div>
          </div>
          
          {/* Títulos com tipografia moderna */}
          <div className="space-y-4 mb-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600 tracking-wider uppercase">
                Igreja Batista Missionária
              </span>
              <Sparkles className="h-4 w-4 text-blue-600" />
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent">
                Monte
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-800 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                Hebrom
              </span>
            </h1>
            
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-400"></div>
              <p className="text-lg md:text-xl text-blue-700 font-medium tracking-wide">
                Lugar de Refúgio e Aliança
              </p>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-purple-400"></div>
            </div>
            
            <p className="text-base text-gray-600 mt-2">
              Ibamonte, Rio de Janeiro
            </p>
          </div>
          
          {/* Descrição elegante */}
          <div className="max-w-4xl mx-auto mb-12">
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-light mb-4">
              Nossa plataforma digital de discipulado foi desenvolvida especialmente para
              <span className="font-medium text-blue-800"> fortalecer nossa comunidade de fé</span>
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Através de trilhas personalizadas, mentoria e crescimento espiritual, 
              conectamos corações em uma jornada de transformação contínua.
            </p>
          </div>
          
          {/* Botões modernos */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-medium rounded-full"
              onClick={() => navigate('/diagnostico')}
            >
              Iniciar Minha Jornada
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl"
            >
              Conhecer as Trilhas
            </Button>
          </div>
          
          {/* Indicador de scroll sutil */}
          <div className="mt-16 flex justify-center">
            <div className="animate-bounce">
              <div className="w-6 h-10 border-2 border-blue-300 rounded-full flex justify-center">
                <div className="w-1 h-2 bg-blue-600 rounded-full mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChurchHeader;
