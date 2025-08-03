
import React from "react";
import ChurchHeader from "@/components/ChurchHeader";
import StatsSection from "@/components/StatsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import { useAuth } from "@/contexts/AuthContext";
import DevocionalNotification from "@/components/DevocionalNotification";
import CarrosselAvisos from "@/components/CarrosselAvisos";
import BirthdaySection from "@/components/BirthdaySection";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <ChurchHeader />
      
      {/* Notificação de Devocional - Design mais discreto para usuários logados */}
      {user && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-6 px-4">
          <div className="max-w-4xl mx-auto">
            <DevocionalNotification />
          </div>
        </div>
      )}
      
      {/* Seção "Pronto para Crescer?" - Restaurada ao design original */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Pronto para Crescer?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Descubra como nossa comunidade pode ajudar você em sua jornada de fé. 
            Temos recursos, pessoas e oportunidades esperando por você.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-blue-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="text-4xl mb-4">📖</div>
              <h3 className="text-xl font-semibold mb-3">Estudos Bíblicos</h3>
              <p className="text-gray-600">Aprofunde seu conhecimento da Palavra</p>
            </div>
            <div className="bg-green-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-3">Grupos Pequenos</h3>
              <p className="text-gray-600">Conecte-se com outros membros</p>
            </div>
            <div className="bg-purple-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-xl font-semibold mb-3">Ministério Musical</h3>
              <p className="text-gray-600">Use seus talentos para adorar</p>
            </div>
            <div className="bg-orange-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-xl font-semibold mb-3">Ação Social</h3>
              <p className="text-gray-600">Faça a diferença na comunidade</p>
            </div>
          </div>
        </div>
      </section>

      {/* Layout em duas colunas para usuários logados - Aniversários e Avisos */}
      {user ? (
        <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Coluna principal - Avisos */}
              <div className="lg:col-span-2">
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    📢 Últimas Novidades
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Fique por dentro dos eventos, atividades e novidades da nossa comunidade
                  </p>
                </div>
                <CarrosselAvisos />
              </div>
              
              {/* Sidebar - Aniversários */}
              <div className="lg:col-span-1">
                <BirthdaySection />
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Para usuários não logados - apenas avisos centralizados */
        <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                📢 Últimas Novidades
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Fique por dentro dos eventos, atividades e novidades da nossa comunidade
              </p>
            </div>
            <CarrosselAvisos />
          </div>
        </section>
      )}

      {/* Seções existentes mantidas */}
      <StatsSection />
      <TestimonialsSection />
    </div>
  );
};

export default Index;
