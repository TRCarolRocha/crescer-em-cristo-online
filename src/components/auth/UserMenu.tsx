
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, Shield } from 'lucide-react';
import { getUserProfile } from '@/utils/adminUtils';
import { usePermissions } from '@/hooks/usePermissions';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isSuperAdmin, isChurchAdmin } = usePermissions();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const profile = await getUserProfile();
        setUserProfile(profile);
      }
    };
    fetchUserProfile();
  }, [user]);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserDisplayName = () => {
    return userProfile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const isAdmin = isSuperAdmin || isChurchAdmin;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userProfile?.avatar_url || user.user_metadata?.avatar_url} alt={getUserDisplayName()} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/perfil')}>
          <User className="mr-2 h-4 w-4" />
          <span>Meu Perfil</span>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate('/admin')}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Painel Admin</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
