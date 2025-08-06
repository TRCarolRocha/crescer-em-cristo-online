
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, X, Calendar } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeeklyDevotionalProgressProps {
  completedDates: string[]; // Array de datas no formato ISO
}

const WeeklyDevotionalProgress: React.FC<WeeklyDevotionalProgressProps> = ({ completedDates }) => {
  const today = new Date();
  const startWeek = startOfWeek(today, { weekStartsOn: 0 }); // Domingo
  
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    return addDays(startWeek, index);
  });

  const isDateCompleted = (date: Date): boolean => {
    return completedDates.some(completedDate => 
      isSameDay(new Date(completedDate), date)
    );
  };

  const getDayStatus = (date: Date) => {
    if (isDateCompleted(date)) {
      return 'completed';
    }
    if (date > today) {
      return 'future';
    }
    return 'missed';
  };

  const getStatusIcon = (date: Date) => {
    const status = getDayStatus(date);
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'missed':
        return <X className="h-5 w-5 text-red-400" />;
      case 'future':
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
      default:
        return null;
    }
  };

  const getStatusColor = (date: Date) => {
    const status = getDayStatus(date);
    
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'missed':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'future':
        return 'bg-gray-50 border-gray-200 text-gray-600';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg text-blue-900">Progresso Semanal</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, index) => {
            const dayName = format(date, 'EEE', { locale: ptBR });
            const dayNumber = format(date, 'd');
            const isCurrentDay = isToday(date);
            
            return (
              <div
                key={index}
                className={`
                  text-center p-3 rounded-lg border-2 transition-all
                  ${getStatusColor(date)}
                  ${isCurrentDay ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
                `}
              >
                <div className="text-xs font-medium uppercase mb-1">
                  {dayName}
                </div>
                <div className="text-sm font-bold mb-2">
                  {dayNumber}
                </div>
                <div className="flex justify-center">
                  {getStatusIcon(date)}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-center items-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-700">Completo</span>
          </div>
          <div className="flex items-center gap-1">
            <X className="h-4 w-4 text-red-400" />
            <span className="text-red-600">Perdido</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
            <span className="text-gray-600">Futuro</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyDevotionalProgress;
