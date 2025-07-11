import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Heart, MessageSquare, Settings } from 'lucide-react';
import AdminMembros from '@/components/admin/AdminMembros';
import AdminTrilhas from '@/components/admin/AdminTrilhas';
import AdminDevocionais from '@/components/admin/AdminDevocionais';
import AdminAvisos from '@/components/admin/AdminAvisos';
import AdminAgenda from '@/components/admin/AdminAgenda';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('membros');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600 mt-2">Gestão da Igreja Monte Hebrom</p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            Voltar ao Início
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="membros" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Membros
            </TabsTrigger>
            <TabsTrigger value="trilhas" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Trilhas
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

          <TabsContent value="membros" className="mt-6">
            <AdminMembros />
          </TabsContent>

          <TabsContent value="trilhas" className="mt-6">
            <AdminTrilhas />
          </TabsContent>

          <TabsContent value="devocionais" className="mt-6">
            <AdminDevocionais />
          </TabsContent>

          <TabsContent value="avisos" className="mt-6">
            <AdminAvisos />
          </TabsContent>

          <TabsContent value="agenda" className="mt-6">
            <AdminAgenda />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
