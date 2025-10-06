import { Home, BookOpen, Map, Calendar, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { icon: Home, label: 'Início', url: '/igreja/monte-hebrom' },
  { icon: BookOpen, label: 'Devocional', url: '/devocional' },
  { icon: Map, label: 'Trilhas', url: '/trilhas' },
  { icon: Calendar, label: 'Agenda', url: '/agenda' },
  { icon: MessageCircle, label: 'Chat', url: '/comunicacao' },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-200 md:hidden z-50 shadow-lg">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.url)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-purple-500'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
