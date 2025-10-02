import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

const TIMEZONE = 'America/Sao_Paulo';

/**
 * Retorna a data atual no timezone de São Paulo no formato YYYY-MM-DD
 * Garante consistência e evita problemas de duplicidade na meia-noite
 */
export const getCurrentDateBR = (): string => {
  const now = new Date();
  const zonedDate = toZonedTime(now, TIMEZONE);
  return format(zonedDate, 'yyyy-MM-dd');
};

/**
 * Formata uma data para o formato brasileiro DD/MM/YYYY
 */
export const formatDateBR = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const zonedDate = toZonedTime(dateObj, TIMEZONE);
  return format(zonedDate, 'dd/MM/yyyy', { locale: ptBR });
};

/**
 * Formata uma data de forma extensa no formato brasileiro
 * Exemplo: "sexta-feira, 2 de outubro de 2025"
 */
export const formatDateLongBR = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const zonedDate = toZonedTime(dateObj, TIMEZONE);
  return format(zonedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
};

/**
 * Converte uma data para o timezone de São Paulo
 */
export const toSaoPauloTime = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return toZonedTime(dateObj, TIMEZONE);
};
