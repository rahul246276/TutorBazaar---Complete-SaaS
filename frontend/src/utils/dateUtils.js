import { formatDistanceToNow, format, parseISO } from 'date-fns';

export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  if (!date) return '';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, formatStr);
  } catch {
    return '';
  }
};

export const formatDateTime = (date) => {
  return formatDate(date, 'dd MMM yyyy, HH:mm');
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  } catch {
    return '';
  }
};

export const getTimeAgo = (date) => {
  return formatRelativeTime(date);
};
