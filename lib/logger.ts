/**
 * Secure logger utility that only logs in development environment.
 * Prevents sensitive information from being exposed in production.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Logs messages only in development environment.
 * In production, all logs are silently ignored.
 */
export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log('[DEV]', ...args);
    }
  },

  error: (...args: unknown[]) => {
    if (isDevelopment) {
      console.error('[DEV ERROR]', ...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn('[DEV WARN]', ...args);
    }
  },

  /**
   * Logs only in development. In production, returns a sanitized version.
   * Use for errors that might contain sensitive information.
   */
  sanitizeError: (error: unknown): string => {
    if (isDevelopment) {
      return error instanceof Error ? error.message : String(error);
    }
    return 'An unexpected error occurred. Please try again.';
  },
};

/**
 * Generic error messages for production use.
 * Never expose internal error details to users.
 */
export const ErrorMessages = {
  AUTH_CONNECTION: 'Unable to connect to authentication service. Please try again later.',
  AUTH_SESSION: 'Session error. Please refresh the page or sign in again.',
  AUTH_SIGNIN: 'Failed to sign in. Please try again.',
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection and try again.',
} as const;
