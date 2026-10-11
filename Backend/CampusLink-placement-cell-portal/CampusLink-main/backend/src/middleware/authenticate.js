import { securityConfig } from '../config/security.js';
import { sendResponse } from '../utils/response.js';

/**
 * Authentication Middleware (Demo Mode Foundation)
 * 
 * Evaluates the X-Demo-User-Role request header when DEMO_AUTH_MODE is active.
 * Rejects requests with 401 if missing, invalid, or if production auth is unconfigured.
 */
export const authenticate = (req, res, next) => {
  if (!securityConfig.demoAuthMode) {
    return sendResponse(
      res,
      401,
      false,
      'Production authentication is not configured yet. Set DEMO_AUTH_MODE=true for prototype evaluation.'
    );
  }

  const rawRole = req.headers['x-demo-user-role'];

  if (!rawRole || typeof rawRole !== 'string' || !rawRole.trim()) {
    return sendResponse(
      res,
      401,
      false,
      'Authentication required: Missing X-Demo-User-Role header.'
    );
  }

  const normalizedRole = rawRole.trim().toLowerCase();

  if (!securityConfig.allowedRoles.includes(normalizedRole)) {
    return sendResponse(
      res,
      401,
      false,
      `Invalid demo authentication role. Allowed roles: ${securityConfig.allowedRoles.join(', ')}.`
    );
  }

  req.user = {
    role: normalizedRole,
    authMode: 'demo'
  };

  next();
};