import { sendResponse } from '../utils/response.js';

/**
 * Role-Based Authorization Middleware Factory
 * 
 * Enforces least-privilege access by verifying req.user.role against allowed roles.
 * Usage: authorize('placement_officer') or authorize('recruiter', 'placement_officer')
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return sendResponse(
        res,
        401,
        false,
        'Authentication required: User identity not established.'
      );
    }

    const normalizedAllowed = allowedRoles.map((r) => r.trim().toLowerCase());

    if (!normalizedAllowed.includes(req.user.role)) {
      return sendResponse(
        res,
        403,
        false,
        'Forbidden: Your role does not possess permissions to access this placement resource.'
      );
    }

    next();
  };
};