import { v4 as uuidv4 } from 'uuid';

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const generateUniqueId = (): string => {
  return uuidv4();
};

export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};