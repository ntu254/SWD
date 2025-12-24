// Utility functions shared across features

export const parseIntOrDefault = (
  value: string | undefined,
  defaultValue: number
): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const formatDate = (date: Date): string => {
  return date.toISOString();
};

export const throwError = (message: string, statusCode: number = 400): void => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  throw error;
};
