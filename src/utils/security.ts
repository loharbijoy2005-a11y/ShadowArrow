/**
 * SHADOW ARROW - SECURITY & DATA INTEGRITY UTILITIES
 */

/**
 * Strips dangerous HTML tags and script injections from user input strings to prevent XSS attacks.
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/onerror\s*=/gi, '')
    .replace(/onload\s*=/gi, '')
    .trim();
};

/**
 * Safely retrieves and parses JSON items from LocalStorage with error handling.
 */
export const safeLocalStorageGet = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    try {
      const parsed = JSON.parse(raw);
      if (typeof fallback === 'string') {
        return (typeof parsed === 'string' ? parsed : String(parsed)) as unknown as T;
      }
      return parsed as T;
    } catch {
      if (typeof fallback === 'string') {
        return raw as unknown as T;
      }
      return fallback;
    }
  } catch (error) {
    console.warn(`[LocalStorage] Error reading key "${key}":`, error);
    return fallback;
  }
};

/**
 * Safely serializes and saves items to LocalStorage with error handling.
 */
export const safeLocalStorageSet = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[LocalStorage] Error writing key "${key}":`, error);
  }
};

/**
 * Removes sensitive keys from storage on logout.
 */
export const safeLocalStorageRemove = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[LocalStorage] Error removing key "${key}":`, error);
  }
};

/**
 * Creates a debounced version of a function to limit execution frequency.
 */
export const debounce = <T extends (...args: any[]) => void>(func: T, delayMs: number): ((...args: Parameters<T>) => void) => {
  let timer: any = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delayMs);
  };
};
