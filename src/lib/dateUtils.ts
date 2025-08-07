import { format as dateFnsFormat } from 'date-fns';

// UK/NZ locale configuration
const UK_NZ_LOCALE = 'en-GB';

// Standard date formats for UK/NZ
export const DATE_FORMATS = {
  // UK/NZ: DD/MM/YYYY
  SHORT_DATE: 'dd/MM/yyyy',
  // UK/NZ: DD/MM/YYYY HH:mm
  SHORT_DATE_TIME: 'dd/MM/yyyy HH:mm',
  // UK/NZ: 1 January 2024
  LONG_DATE: 'd MMMM yyyy',
  // UK/NZ: Monday, 1 January 2024
  FULL_DATE: 'EEEE, d MMMM yyyy',
  // UK/NZ: Jan 1, 2024
  MEDIUM_DATE: 'MMM d, yyyy',
  // UK/NZ: 1 Jan 2024
  COMPACT_DATE: 'd MMM yyyy',
  // Time formats (24-hour)
  TIME: 'HH:mm',
  TIME_WITH_SECONDS: 'HH:mm:ss',
  // ISO format for inputs
  ISO_DATE: 'yyyy-MM-dd',
} as const;

/**
 * Format a date using UK/NZ locale
 */
export function formatDate(date: Date | string | number, formatString: string = DATE_FORMATS.SHORT_DATE): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return dateFnsFormat(dateObj, formatString);
}

/**
 * Format date using browser locale with UK/NZ settings
 */
export function formatDateLocale(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options
  };
  
  return dateObj.toLocaleDateString(UK_NZ_LOCALE, defaultOptions);
}

/**
 * Format time using browser locale with UK/NZ settings (24-hour format)
 */
export function formatTimeLocale(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // 24-hour format
    ...options
  };
  
  return dateObj.toLocaleTimeString(UK_NZ_LOCALE, defaultOptions);
}

/**
 * Format date and time using browser locale with UK/NZ settings
 */
export function formatDateTimeLocale(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // 24-hour format
    ...options
  };
  
  return dateObj.toLocaleString(UK_NZ_LOCALE, defaultOptions);
}

/**
 * Helper functions for common date formatting patterns
 */
export const dateHelpers = {
  shortDate: (date: Date | string | number) => formatDateLocale(date),
  longDate: (date: Date | string | number) => formatDate(date, DATE_FORMATS.LONG_DATE),
  mediumDate: (date: Date | string | number) => formatDate(date, DATE_FORMATS.MEDIUM_DATE),
  compactDate: (date: Date | string | number) => formatDate(date, DATE_FORMATS.COMPACT_DATE),
  time: (date: Date | string | number) => formatTimeLocale(date),
  dateTime: (date: Date | string | number) => formatDateTimeLocale(date),
  isoDate: (date: Date | string | number) => formatDate(date, DATE_FORMATS.ISO_DATE),
};