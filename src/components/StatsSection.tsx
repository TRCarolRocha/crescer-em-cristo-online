
const StatsSection = () => {
  return (
    <div className="py-16 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Nossa Comunidade Monte Hebrom
          </h2>
          <p className="text-gray-600">Crescendo juntos na fé e no discipulado</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">150+</div>
            <div className="text-gray-600">Membros Ativos</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">8</div>
            <div className="text-gray-600">Pequenos Grupos</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-600 mb-2">15</div>
            <div className="text-gray-600">Trilhas Disponíveis</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">20+</div>
            <div className="text-gray-600">Líderes Capacitados</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
