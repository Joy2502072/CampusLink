import helmet from 'helmet';

/**
 * Security headers middleware
 * Configures Helmet without an aggressive Content-Security-Policy that could
 * interfere with the Vite frontend client or local prototype integrations.
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
});