/**
 * Simple in-memory rate limiter for Next.js middleware.
 *
 * IMPORTANT: This is suitable for single-server deployments only.
 * For production with multiple servers, use Redis-based rate limiting.
 *
 * Features:
 * - Token bucket algorithm
 * - Configurable limits per endpoint
 * - Automatic cleanup of expired entries
 */

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

interface RateLimitConfig {
  /** Maximum tokens in the bucket */
  maxTokens: number;
  /** Tokens to refill per interval */
  refillRate: number;
  /** Refill interval in milliseconds */
  refillInterval: number;
}

// Default configuration: 100 requests per minute
const DEFAULT_CONFIG: RateLimitConfig = {
  maxTokens: 100,
  refillRate: 100,
  refillInterval: 60 * 1000, // 1 minute
};

// Stricter limits for auth endpoints
export const AUTH_RATE_LIMIT: RateLimitConfig = {
  maxTokens: 10,
  refillRate: 10,
  refillInterval: 60 * 1000, // 10 requests per minute
};

// Even stricter for anonymous auth
export const ANON_AUTH_RATE_LIMIT: RateLimitConfig = {
  maxTokens: 5,
  refillRate: 5,
  refillInterval: 60 * 1000, // 5 requests per minute
};

// In-memory store (cleared on server restart)
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  const expiryTime = 10 * 60 * 1000; // Remove entries older than 10 minutes

  for (const [key, entry] of store.entries()) {
    if (now - entry.lastRefill > expiryTime) {
      store.delete(key);
    }
  }
}

/**
 * Check if a request should be rate limited.
 *
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining tokens
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetIn: number } {
  cleanup();

  const now = Date.now();
  const key = identifier;

  let entry = store.get(key);

  if (!entry) {
    // First request - create new entry
    entry = {
      tokens: config.maxTokens - 1,
      lastRefill: now,
    };
    store.set(key, entry);
    return { allowed: true, remaining: entry.tokens, resetIn: config.refillInterval };
  }

  // Calculate tokens to refill based on time elapsed
  const timeSinceRefill = now - entry.lastRefill;
  const tokensToAdd = Math.floor(timeSinceRefill / config.refillInterval) * config.refillRate;

  if (tokensToAdd > 0) {
    entry.tokens = Math.min(config.maxTokens, entry.tokens + tokensToAdd);
    entry.lastRefill = now;
  }

  if (entry.tokens > 0) {
    entry.tokens -= 1;
    store.set(key, entry);
    return {
      allowed: true,
      remaining: entry.tokens,
      resetIn: config.refillInterval - (now - entry.lastRefill),
    };
  }

  // Rate limited
  return {
    allowed: false,
    remaining: 0,
    resetIn: config.refillInterval - (now - entry.lastRefill),
  };
}

/**
 * Get a unique identifier from request headers.
 * Falls back to a hash of user-agent if no IP is available.
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (in order of preference)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP in the chain (original client)
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback: use a combination of headers as identifier
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const acceptLanguage = request.headers.get('accept-language') || 'unknown';
  return `fallback:${hashString(userAgent + acceptLanguage)}`;
}

/**
 * Simple string hash function for fallback identification.
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Create rate limit headers for the response.
 */
export function createRateLimitHeaders(
  remaining: number,
  resetIn: number,
  config: RateLimitConfig = DEFAULT_CONFIG
): Record<string, string> {
  return {
    'X-RateLimit-Limit': config.maxTokens.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetIn / 1000).toString(),
  };
}
