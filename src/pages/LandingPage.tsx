import { BookOpen, Users, Building2, Calendar, MessageCircle, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { GradientButton } from "@/components/common/GradientButton";
import { HeaderLogo } from "@/components/common/HeaderLogo";
const LandingPage = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLElement>(null);
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  const features = [{
    icon: BookOpen,
    title: "Devocionais Diários",
    description: "Reflexões profundas para fortalecer sua caminhada espiritual"
  }, {
    icon: Map,
    title: "Trilhas de Discipulado",
    description: "Jornadas personalizadas para cada etapa da sua fé"
  }, {
    icon: Users,
    title: "Comunidade Conectada",
    description: "Grupos e comunicação para fortalecer laços espirituais"
  }, {
    icon: Calendar,
    title: "Agenda de Eventos",
    description: "Acompanhe cultos, eventos e atividades da sua igreja"
  }, {
    icon: MessageCircle,
    title: "Comunicação Interna",
    description: "Canal direto entre membros e liderança"
  }, {
    icon: Building2,
    title: "Gestão Multi-Igrejas",
    description: "Plataforma completa para administradores e líderes"
  }];
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#7b2ff720_1px,transparent_1px),linear-gradient(to_bottom,#f107a320_1px,transparent_1px)] bg-[size:40px_40px] animate-[grid-flow_20s_linear_infinite]" />

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          {/* Palavra HODOS gigante com gradiente */}
          <h1 style={{
          letterSpacing: '0.05em'
        }} className="text-7xl font-bold font-playfair md:text-9xl">
            HODOS
          </h1>
          
          <p className="text-2xl md:text-3xl font-light text-purple-200 max-w-3xl mx-auto">
            Hub de Discipulado Digital
          </p>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Uma plataforma completa para transformar a jornada espiritual da sua comunidade
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <GradientButton onClick={() => navigate("/planos")} className="px-8 py-4 text-lg">
              Ver Planos
            </GradientButton>
            <button onClick={() => navigate("/auth")} className="px-8 py-4 border-2 border-purple-400/50 backdrop-blur-sm rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-purple-400 transform hover:scale-105 transition-all duration-300">
              Entrar
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="relative z-10 px-6 py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#7b2ff7] to-[#f107a3]">
            Recursos Principais
          </h2>
          <p className="text-center text-slate-300 mb-16 max-w-2xl mx-auto">
            Tudo que sua igreja precisa em uma única plataforma
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => <div key={index} className="p-8 rounded-2xl border-2 border-purple-500/30 bg-white/10 backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:border-purple-400 group cursor-pointer" style={{
            animationDelay: `${index * 0.1}s`,
            animation: "fade-in 0.5s ease-out forwards"
          }}>
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-[#7b2ff7] to-[#f107a3]">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-purple-200 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-purple-500/20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-lg mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#7b2ff7] to-[#f107a3]">
                Sobre o Hodos
              </h4>
              <p className="text-slate-400 text-sm">
                Plataforma de discipulado digital que conecta igrejas e transforma vidas.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#7b2ff7] to-[#f107a3]">
                Planos
              </h4>
              <button onClick={() => navigate('/planos')} className="text-slate-400 hover:text-purple-400 transition-colors text-sm block">
                Ver todos os planos
              </button>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#7b2ff7] to-[#f107a3]">
                Conteúdos Públicos
              </h4>
              <p className="text-slate-400 text-sm">
                Devocionais e trilhas disponíveis para todos.
              </p>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-purple-500/20">
            <p className="text-slate-400 text-sm">
              © 2024 Hodos. Transformando vidas através do discipulado digital.
            </p>
            <div className="mt-4 flex justify-center gap-6">
              <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm">
                Sobre
              </a>
              <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm">
                Contato
              </a>
              <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm">
                Privacidade
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default LandingPage;