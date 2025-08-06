
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
    const isCurrentDay = isToday(date);
    
    switch (status) {
      case 'completed':
        return <CheckCircle className={`h-4 w-4 text-green-500 ${isCurrentDay ? 'ring-2 ring-green-400 rounded-full' : ''}`} />;
      case 'missed':
        return <X className={`h-4 w-4 text-red-400 ${isCurrentDay ? 'ring-2 ring-red-400 rounded-full' : ''}`} />;
      case 'future':
        return <div className={`h-4 w-4 rounded-full border-2 border-gray-300 ${isCurrentDay ? 'ring-2 ring-blue-400' : ''}`} />;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg text-blue-900">Progresso Semanal</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center gap-1">
          {weekDays.map((date, index) => {
            const dayName = format(date, 'EEE', { locale: ptBR });
            const dayNumber = format(date, 'd');
            const isCurrentDay = isToday(date);
            
            return (
              <div
                key={index}
                className="flex flex-col items-center space-y-1 flex-1"
              >
                <div className={`text-xs font-medium uppercase ${isCurrentDay ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                  {dayName}
                </div>
                <div className={`text-sm font-bold ${isCurrentDay ? 'text-blue-800' : 'text-gray-700'}`}>
                  {dayNumber}
                </div>
                <div className="flex justify-center">
                  {getStatusIcon(date)}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-center items-center gap-4 mt-4 text-xs border-t pt-3">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-green-700">Completo</span>
          </div>
          <div className="flex items-center gap-1">
            <X className="h-3 w-3 text-red-400" />
            <span className="text-red-600">Perdido</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full border-2 border-gray-300" />
            <span className="text-gray-600">Futuro</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyDevotionalProgress;
