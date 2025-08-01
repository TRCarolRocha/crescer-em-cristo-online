
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, ArrowRight, MessageCircle } from 'lucide-react';

const ChurchHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCommunityClick = () => {
    navigate('/comunicacao');
  };

  const handleDevotionalClick = () => {
    navigate('/devocional');
  };

  return (
    <div className="relative min-h-[60vh] md:min-h-[65vh] bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.03\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-white/20 rounded-full animate-bounce delay-100"></div>
      <div className="absolute top-32 right-16 w-3 h-3 bg-blue-300/30 rounded-full animate-bounce delay-300"></div>
      <div className="absolute bottom-40 left-20 w-1 h-1 bg-purple-300/40 rounded-full animate-bounce delay-500"></div>
      
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto animate-fade-in">
        {/* Church Name */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-2 sm:mb-4 leading-tight tracking-tight font-display">
            Monte Hebrom
          </h1>
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <div className="h-px bg-gradient-to-r from-transparent via-white/60 to-transparent w-16 sm:w-20"></div>
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-white/80" />
            <div className="h-px bg-gradient-to-r from-transparent via-white/60 to-transparent w-16 sm:w-20"></div>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-blue-100 font-medium tracking-wide">
            Lugar de Refúgio e Aliança
          </p>
        </div>

        {/* Subtitle */}
        <div className="mb-6 sm:mb-8 max-w-4xl mx-auto">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100/90 leading-relaxed font-light">
            Um lugar onde corações são transformados, 
            <span className="block mt-1 font-medium text-white/95">
              vidas são restauradas e propósitos são descobertos
            </span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 max-w-2xl mx-auto">
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">500+</div>
            <div className="text-xs sm:text-sm text-blue-100">Membros</div>
          </div>
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">15</div>
            <div className="text-xs sm:text-sm text-blue-100">Anos</div>
          </div>
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 col-span-2 md:col-span-1">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">1000+</div>
            <div className="text-xs sm:text-sm text-blue-100">Vidas Alcançadas</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-lg mx-auto">
          <Button
            onClick={handleCommunityClick}
            size="lg"
            className="w-full sm:w-auto bg-white text-blue-900 hover:bg-blue-50 font-semibold px-6 sm:px-8 py-3 text-base sm:text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
          >
            <Users className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
            Conhecer Nossa Comunidade
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          {user && (
            <Button
              onClick={handleDevotionalClick}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-6 sm:px-8 py-3 text-base sm:text-lg rounded-xl backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
            >
              <Heart className="mr-2 h-5 w-5" />
              Devocional de Hoje
            </Button>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="mt-10 sm:mt-12 animate-bounce">
          <div className="mx-auto w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChurchHeader;
