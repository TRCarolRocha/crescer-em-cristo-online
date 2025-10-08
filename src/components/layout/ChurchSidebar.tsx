import { useState, useEffect } from 'react';
import { Home, BookOpen, Map, Calendar, MessageCircle, ArrowLeft, Settings } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { HeaderLogo } from '@/components/common/HeaderLogo';
import { useChurch } from '@/contexts/ChurchContext';
import { usePermissions } from '@/hooks/usePermissions';

const menuItems = [
  { title: 'Início', icon: Home, url: '/igreja/monte-hebrom' },
  { title: 'Devocionais', icon: BookOpen, url: '/devocional' },
  { title: 'Trilhas', icon: Map, url: '/trilhas' },
  { title: 'Agenda', icon: Calendar, url: '/agenda' },
  { title: 'Comunicação', icon: MessageCircle, url: '/comunicacao' },
];

export function ChurchSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { churchSlug } = useParams();
  const { church } = useChurch();
  const { isSuperAdmin, isChurchAdmin, canManageChurch } = usePermissions();
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    const checkManagement = async () => {
      if (!church?.id) return;
      const hasAccess = await canManageChurch(church.id);
      setCanManage(hasAccess || isSuperAdmin);
    };
    checkManagement();
  }, [church, canManageChurch, isSuperAdmin]);

  return (
    <Sidebar className="border-r border-purple-200 bg-white">
      <SidebarHeader 
        className="p-4 border-b cursor-pointer hover:bg-purple-50/50 transition-colors"
        onClick={() => navigate('/')}
      >
        <div className="flex items-center gap-3">
          <HeaderLogo size="sm" />
          <div className="flex flex-col">
            <span className="font-bold text-sm bg-gradient-to-r from-[#7b2ff7] to-[#f107a3] bg-clip-text text-transparent">
              HODOS
            </span>
            {church && (
              <span className="text-xs text-muted-foreground">{church.name}</span>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Botão Meu Espaço */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/meu-espaco')}
                  className="hover:bg-purple-50 hover:text-purple-600"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  <span>Meu Espaço</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      className={`hover:bg-purple-50 hover:text-purple-600 ${
                        isActive ? 'bg-purple-100 text-purple-700 font-semibold' : ''
                      }`}
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Admin Management Link */}
              {canManage && churchSlug && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate(`/admin/igrejas/${churchSlug}`)}
                    className="hover:bg-purple-50 hover:text-purple-600"
                  >
                    <Settings className="mr-2 h-5 w-5" />
                    <span>Gerenciar Igreja</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
