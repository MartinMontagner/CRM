import moment from 'moment-timezone';
import { useMemo } from 'react';

export const useDateFormatting = () => {
  const formatters = useMemo(() => ({
    formatMessageTimestamp: (utcDateString: string): string => {
      
      const parsedUTC = moment.utc(utcDateString);
      
      const local = parsedUTC.local();
      
      const result = local.format('HH:mm');
      
      return result;
    },

    formatMessageTime: (dateString: string): string => {
      const localMoment = moment.utc(dateString).local();
      const now = moment();
      
      if (localMoment.isSame(now, 'day')) {
        return localMoment.format('HH:mm');
      }
      
      if (localMoment.isSame(now.clone().subtract(1, 'day'), 'day')) {
        return 'Ayer';
      }
      
      if (localMoment.isSame(now, 'week')) {
        // Mapeo manual de días a español
        const dayNames = {
          'Monday': 'Lunes',
          'Tuesday': 'Martes',
          'Wednesday': 'Miércoles',
          'Thursday': 'Jueves',
          'Friday': 'Viernes',
          'Saturday': 'Sábado',
          'Sunday': 'Domingo'
        };
        
        const englishDay = localMoment.format('dddd');
        return dayNames[englishDay as keyof typeof dayNames] || englishDay;
      }
      
      return localMoment.format('DD/MM/YY');
    },

    formatDateSeparator: (utcDateString: string): string => {
      const localMoment = moment.utc(utcDateString).local();
      const now = moment();
      
      if (localMoment.isSame(now, 'day')) {
        return 'Hoy';
      }
      
      if (localMoment.isSame(now.clone().subtract(1, 'day'), 'day')) {
        return 'Ayer';
      }
      
      return localMoment.format('DD/MM/YYYY');
    }
  }), []);

  return formatters;
};