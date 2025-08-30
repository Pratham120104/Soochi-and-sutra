export interface AppError {
  code: string;
  message: string;
  details?: string;
  timestamp: Date;
}

export class ValidationError extends Error {
  public code: string;
  public details?: string;

  constructor(message: string, code: string = 'VALIDATION_ERROR', details?: string) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.details = details;
  }
}

export class APIError extends Error {
  public code: string;
  public status: number;
  public details?: string;

  constructor(message: string, status: number = 500, code: string = 'API_ERROR', details?: string) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class AuthError extends Error {
  public code: string;

  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export const createAppError = (code: string, message: string, details?: string): AppError => ({
  code,
  message,
  details,
  timestamp: new Date(),
});

export const handleError = (error: unknown): AppError => {
  if (error instanceof ValidationError) {
    return createAppError(error.code, error.message, error.details);
  }
  
  if (error instanceof APIError) {
    return createAppError(error.code, error.message, error.details);
  }
  
  if (error instanceof AuthError) {
    return createAppError(error.code, error.message);
  }
  
  if (error instanceof Error) {
    return createAppError('UNKNOWN_ERROR', error.message);
  }
  
  return createAppError('UNKNOWN_ERROR', 'An unexpected error occurred');
};

export const logError = (error: AppError, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context || 'App'}] Error:`, {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: error.timestamp,
    });
  }
  
  // In production, you would send this to an error tracking service
  // like Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error);
    console.error('Production error logged:', error);
  }
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof APIError) {
    return error.status >= 500 || error.status === 0;
  }
  
  if (error instanceof Error) {
    return error.message.includes('Network Error') || 
           error.message.includes('Failed to fetch') ||
           error.message.includes('timeout');
  }
  
  return false;
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}; 