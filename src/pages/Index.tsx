
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
      
      {/* Notificação de Devocional para usuários logados */}
      {user && (
        <div className="bg-white py-4 px-4">
          <div className="max-w-6xl mx-auto">
            <DevocionalNotification />
          </div>
        </div>
      )}
      
      {/* Seção "Pronto para Crescer?" */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Pronto para Crescer?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Descubra como nossa comunidade pode ajudar você em sua jornada de fé. 
            Temos recursos, pessoas e oportunidades esperando por você.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl">
              <div className="text-3xl mb-4">📖</div>
              <h3 className="font-semibold mb-2">Estudos Bíblicos</h3>
              <p className="text-sm text-gray-600">Aprofunde seu conhecimento da Palavra</p>
            </div>
            <div className="bg-green-50 p-6 rounded-xl">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="font-semibold mb-2">Grupos Pequenos</h3>
              <p className="text-sm text-gray-600">Conecte-se com outros membros</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl">
              <div className="text-3xl mb-4">🎵</div>
              <h3 className="font-semibold mb-2">Ministério Musical</h3>
              <p className="text-sm text-gray-600">Use seus talentos para adorar</p>
            </div>
            <div className="bg-orange-50 p-6 rounded-xl">
              <div className="text-3xl mb-4">❤️</div>
              <h3 className="font-semibold mb-2">Ação Social</h3>
              <p className="text-sm text-gray-600">Faça a diferença na comunidade</p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Avisos */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              📢 Últimas Novidades
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Fique por dentro dos eventos, atividades e novidades da nossa comunidade
            </p>
          </div>
          <CarrosselAvisos />
        </div>
      </section>

      {/* Seção de Aniversários para usuários logados */}
      {user && (
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="text-center lg:text-left mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Nossa Comunidade
                  </h2>
                  <p className="text-lg text-gray-600">
                    Celebramos juntos cada momento especial da vida de nossos membros
                  </p>
                </div>
              </div>
              <div className="lg:col-span-1">
                <BirthdaySection />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Seções existentes */}
      <StatsSection />
      <TestimonialsSection />
    </div>
  );
};

export default Index;
