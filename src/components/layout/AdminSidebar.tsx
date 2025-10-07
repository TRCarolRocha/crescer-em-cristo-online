import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Building2, FileText, Home, Church } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { HeaderLogo } from '@/components/common/HeaderLogo';

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin, isChurchAdmin } = usePermissions();

  const superAdminItems = [
    { title: 'Dashboard Hodos', url: '/admin/hodos', icon: LayoutDashboard },
    { title: 'Gerenciar Igrejas', url: '/admin/hodos/igrejas', icon: Building2 },
    { title: 'Conteúdos Públicos', url: '/admin/hodos/conteudos', icon: FileText },
  ];

  const churchAdminItems = [
    { title: 'Dashboard Igreja', url: '/admin/igrejas/monte-hebrom', icon: Church },
  ];

  return (
    <Sidebar className="border-r border-purple-200 bg-white">
      <SidebarHeader
        className="p-4 border-b cursor-pointer hover:bg-purple-50/50 transition-colors"
        onClick={() => navigate('/')}
      >
        <div className="flex items-center gap-3">
          <HeaderLogo size="sm" />
          <div className="flex flex-col">
            <span className="font-bold text-lg bg-gradient-to-r from-[#7b2ff7] to-[#f107a3] bg-clip-text text-transparent">
              HODOS
            </span>
            <span className="text-xs text-muted-foreground">Administração</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Super Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {superAdminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      isActive={location.pathname === item.url}
                      className="w-full justify-start"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {(isSuperAdmin || isChurchAdmin) && (
          <SidebarGroup>
            <SidebarGroupLabel>Igreja</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {churchAdminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      isActive={location.pathname.includes('/admin/igrejas')}
                      className="w-full justify-start"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/')}
                  className="w-full justify-start"
                >
                  <Home className="mr-2 h-4 w-4" />
                  <span>Voltar ao Início</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
