/**
 * Logger utility yang menghormati NODE_ENV.
 * Di production: console.error/warn dinonaktifkan untuk mencegah
 * stack trace dan informasi internal ter-leak ke browser console.
 *
 * Gunakan ini sebagai pengganti console.error/console.warn langsung:
 *   import { logger } from '@/lib/logger';
 *   logger.error('pesan', error);
 */

const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  /** Log error — hanya tampil di development */
  error: (message: string, ...args: unknown[]): void => {
    if (isDev) {
      console.error(`[ERROR] ${message}`, ...args);
    }
    // Di production: tidak ada output ke console.
    // Integrasikan dengan error monitoring service (Sentry, etc.) di sini jika diperlukan.
  },

  /** Log warning — hanya tampil di development */
  warn: (message: string, ...args: unknown[]): void => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  /** Log info — hanya tampil di development */
  info: (message: string, ...args: unknown[]): void => {
    if (isDev) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  /** Log debug — hanya tampil di development */
  debug: (message: string, ...args: unknown[]): void => {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};
