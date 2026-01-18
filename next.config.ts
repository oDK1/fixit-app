import type { NextConfig } from "next";

/**
 * Security headers following OWASP recommendations.
 * These headers help protect against common web vulnerabilities.
 */
const securityHeaders = [
  {
    // Prevent MIME type sniffing
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Prevent clickjacking attacks
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    // Enable XSS filtering (legacy, but still useful for older browsers)
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    // Control referrer information sent with requests
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Prevent DNS prefetching to protect privacy
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    // Enforce HTTPS (only in production)
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    // Control browser features and APIs
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    // Content Security Policy - restricts resource loading
    // Adjust as needed for your specific requirements
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-eval in dev
      "style-src 'self' 'unsafe-inline'", // Tailwind uses inline styles
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  // Security headers applied to all routes
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  // Disable x-powered-by header to hide framework info
  poweredByHeader: false,
};

export default nextConfig;
