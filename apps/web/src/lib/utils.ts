import { format, parseISO, isValid } from 'date-fns';

/** Merge CSS module class names, filtering falsy values */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Format a date string to DD-MM-YYYY */
export function formatDate(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return 'Invalid date';
    return format(d, 'dd-MM-yyyy');
  } catch {
    return 'Invalid date';
  }
}

/** Format a date string to YYYY-MM-DD for input fields */
export function formatDateForInput(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '';
    return format(d, 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

/** Generate a simple unique ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Truncate text to a max length */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
