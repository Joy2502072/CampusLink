/**
 * CampusLink Authoritative Demo Authentication & RBAC Middleware
 *
 * Enforces headers:
 * - X-Demo-User-Role: placement_officer | student | admin
 * - X-Demo-User-Id: (optional, defaults to role-appropriate identifier)
 *
 * Populates req.user with:
 * - req.user.id / req.user.userId
 * - req.user.role
 * - req.user.email
 */

export function authenticate(req, res, next) {
  const rawRole =
    req.headers['x-demo-user-role'] ||
    req.headers['x-user-role'] ||
    req.headers['x-role'];

  if (!rawRole || !String(rawRole).trim()) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required: Missing X-Demo-User-Role header'
    });
  }

  const role = String(rawRole).toLowerCase().trim();

  // Extract or assign deterministic demo user ID
  const rawId =
    req.headers['x-demo-user-id'] ||
    req.headers['x-user-id'] ||
    req.headers['x-student-id'];

  const id = rawId && String(rawId).trim()
    ? String(rawId).trim()
    : role === 'student'
    ? 'DEMO-STU-001'
    : 'PO-DEMO-001';

  // Attach authoritative user context expected by controllers and services
  req.user = {
    id,
    userId: id,
    role,
    email: `${id.toLowerCase()}@campuslink.edu`
  };

  return next();
}

export function authorize(...allowedRoles) {
  const normalizedAllowed = allowedRoles.map((r) => String(r).toLowerCase().trim());

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required: User context missing'
      });
    }

    if (!normalizedAllowed.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' lacks sufficient permissions`
      });
    }

    return next();
  };
}