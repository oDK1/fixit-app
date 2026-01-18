/**
 * Input sanitization utilities to prevent XSS and injection attacks.
 *
 * These functions should be used when:
 * 1. Storing user input in the database
 * 2. Displaying user-generated content
 * 3. Processing any untrusted input
 */

/**
 * HTML entity map for encoding special characters
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escapes HTML special characters to prevent XSS attacks.
 * Use this when displaying user-generated content.
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Removes HTML tags from a string.
 * Use this for plain text content that should never contain HTML.
 */
export function stripHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitizes user input for safe storage and display.
 * - Trims whitespace
 * - Removes null bytes
 * - Limits length
 * - Optionally strips HTML
 */
export function sanitizeInput(
  input: string,
  options: {
    maxLength?: number;
    stripHtmlTags?: boolean;
    trim?: boolean;
  } = {}
): string {
  const { maxLength = 10000, stripHtmlTags = false, trim = true } = options;

  if (!input || typeof input !== 'string') return '';

  let sanitized = input;

  // Remove null bytes (can cause issues in some systems)
  sanitized = sanitized.replace(/\0/g, '');

  // Remove other control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Trim whitespace if requested
  if (trim) {
    sanitized = sanitized.trim();
  }

  // Strip HTML tags if requested
  if (stripHtmlTags) {
    sanitized = stripHtml(sanitized);
  }

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitizes a URL to prevent javascript: and data: protocol attacks.
 * Returns empty string if URL is potentially malicious.
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) {
      return '';
    }
  }

  // Block URLs with encoded dangerous protocols
  try {
    const decoded = decodeURIComponent(trimmed);
    for (const protocol of dangerousProtocols) {
      if (decoded.startsWith(protocol)) {
        return '';
      }
    }
  } catch {
    // If decoding fails, URL might be malformed - reject it
    return '';
  }

  return url.trim();
}

/**
 * Validates and sanitizes an email address.
 * Returns null if email is invalid.
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') return null;

  const trimmed = email.trim().toLowerCase();

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return null;
  }

  // Check for reasonable length
  if (trimmed.length > 254) {
    return null;
  }

  return trimmed;
}

/**
 * Sanitizes an object's string values recursively.
 * Useful for sanitizing form data before storage.
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: {
    maxLength?: number;
    stripHtmlTags?: boolean;
  } = {}
): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeInput(value, options);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>, options);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeInput(item, options) : item
      );
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
