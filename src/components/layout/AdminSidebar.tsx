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
import { LayoutDashboard, Building2, FileText, Home, Church, ArrowLeft } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { HeaderLogo } from '@/components/common/HeaderLogo';
import { useChurches } from '@/hooks/useChurches';
import { useChurch } from '@/contexts/ChurchContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin, isChurchAdmin } = usePermissions();
  const { churches, loading: churchesLoading } = useChurches();
  const { church: userChurch } = useChurch();

  // Determinar quais igrejas exibir
  const displayChurches = isSuperAdmin 
    ? churches // Super admin vê todas
    : userChurch 
      ? [userChurch] // Admin vê apenas a sua
      : []; // Nenhuma igreja

  const superAdminItems = [
    { title: 'Dashboard Hodos', url: '/admin/hodos', icon: LayoutDashboard },
    { title: 'Gerenciar Igrejas', url: '/admin/hodos/igrejas', icon: Building2 },
    { title: 'Conteúdos Públicos', url: '/admin/hodos/conteudos', icon: FileText },
  ];


  return (
    <Sidebar className="border-r border-purple-200 bg-white">
      <SidebarHeader
        className="p-4 border-b cursor-pointer hover:bg-purple-50/50 transition-colors"
        onClick={() => navigate('/meu-espaco')}
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
            <SidebarGroupLabel>
              {isSuperAdmin ? 'Igrejas' : 'Minha Igreja'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {churchesLoading ? (
                <div className="px-2 space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : displayChurches.length === 0 ? (
                <div className="px-2 py-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Nenhuma igreja cadastrada
                  </p>
                  {isSuperAdmin && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate('/admin/hodos/igrejas')}
                      className="w-full"
                    >
                      + Cadastrar Igreja
                    </Button>
                  )}
                </div>
              ) : (
                <SidebarMenu>
                  {displayChurches.map((church) => (
                    <SidebarMenuItem key={church.id}>
                      <SidebarMenuButton
                        onClick={() => navigate(`/admin/igrejas/${church.slug}`)}
                        isActive={location.pathname === `/admin/igrejas/${church.slug}`}
                        className="w-full justify-start"
                      >
                        <Church className="mr-2 h-4 w-4" />
                        <span className="truncate">{church.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/meu-espaco')}
                  className="w-full justify-start"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span>Meu Espaço</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/')}
                  className="w-full justify-start"
                >
                  <Home className="mr-2 h-4 w-4" />
                  <span>Página Inicial</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
