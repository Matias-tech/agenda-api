export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const generateUniqueId = (): string => {
  // Usar crypto.randomUUID() que está disponible en Cloudflare Workers
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback para entornos que no soporten crypto.randomUUID()
  return 'xxxx-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const formatTime = (time: string): string => {
  // Convertir formato 24h a 12h si es necesario
  const [hours, minutes] = time.split(':');
  const hour24 = parseInt(hours);
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 < 12 ? 'AM' : 'PM';
  return `${hour12}:${minutes} ${ampm}`;
};

export const isValidTimeRange = (startTime: string, endTime: string): boolean => {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  return start < end;
};