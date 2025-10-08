import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Heart, MessageSquare, Settings, UsersIcon, Eye } from 'lucide-react';
import AdminMembros from '@/components/admin/AdminMembros';
import AdminGrupos from '@/components/admin/AdminGrupos';
import AdminTrilhas from '@/components/admin/AdminTrilhas';
import AdminVisibilidadeTrilhas from '@/components/admin/AdminVisibilidadeTrilhas';
import AdminDevocionais from '@/components/admin/AdminDevocionais';
import AdminAvisos from '@/components/admin/AdminAvisos';
import AdminAgenda from '@/components/admin/AdminAgenda';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('membros');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10 -mx-4 px-3 sm:px-4 py-3 mb-4 md:mb-8 md:relative md:bg-transparent md:backdrop-blur-none md:border-0">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 sm:gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg md:text-3xl font-bold text-gray-900 truncate">Administrativo</h1>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5 sm:mt-1 truncate">Gestão da Igreja Monte Hebrom</p>
            </div>
            <Button onClick={() => navigate('/')} variant="outline" size="sm" className="md:h-auto flex-shrink-0">
              ← Voltar
            </Button>
          </div>
        </div>

        {/* Mobile: Select dropdown */}
        <div className="md:hidden mb-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full max-w-full text-sm z-50">
              <SelectValue placeholder="Selecione uma seção" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-white">
              <SelectItem value="membros" className="text-sm">👥 Membros</SelectItem>
              <SelectItem value="grupos" className="text-sm">👨‍👩‍👧‍👦 Grupos</SelectItem>
              <SelectItem value="trilhas" className="text-sm">📚 Trilhas</SelectItem>
              <SelectItem value="visibilidade" className="text-sm">👁️ Visibilidade</SelectItem>
              <SelectItem value="devocionais" className="text-sm">❤️ Devocionais</SelectItem>
              <SelectItem value="avisos" className="text-sm">💬 Avisos</SelectItem>
              <SelectItem value="agenda" className="text-sm">⚙️ Agenda</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden md:grid md:grid-cols-7 w-full">
            <TabsTrigger value="membros" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Membros
            </TabsTrigger>
            <TabsTrigger value="grupos" className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4" />
              Grupos
            </TabsTrigger>
            <TabsTrigger value="trilhas" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Trilhas
            </TabsTrigger>
            <TabsTrigger value="visibilidade" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visibilidade
            </TabsTrigger>
            <TabsTrigger value="devocionais" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Devocionais
            </TabsTrigger>
            <TabsTrigger value="avisos" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Avisos
            </TabsTrigger>
            <TabsTrigger value="agenda" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Agenda
            </TabsTrigger>
          </TabsList>

          <TabsContent value="membros" className="mt-4 md:mt-6">
            <AdminMembros />
          </TabsContent>

          <TabsContent value="grupos" className="mt-4 md:mt-6">
            <AdminGrupos />
          </TabsContent>

          <TabsContent value="trilhas" className="mt-4 md:mt-6">
            <AdminTrilhas />
          </TabsContent>

          <TabsContent value="visibilidade" className="mt-4 md:mt-6">
            <AdminVisibilidadeTrilhas />
          </TabsContent>

          <TabsContent value="devocionais" className="mt-4 md:mt-6">
            <AdminDevocionais />
          </TabsContent>

          <TabsContent value="avisos" className="mt-4 md:mt-6">
            <AdminAvisos />
          </TabsContent>

          <TabsContent value="agenda" className="mt-4 md:mt-6">
            <AdminAgenda />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
