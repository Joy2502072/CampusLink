import { sendResponse } from '../utils/response.js';

/**
 * Lightweight, zero-dependency declarative validation middleware
 * 
 * Supports:
 * - schema.body: { fieldName: { required: true, enum: [...] } }
 * - schema.query: { paramName: { required: true, enum: [...] } }
 */
export const validateRequest = (schema = {}) => {
  return (req, res, next) => {
    const errors = [];

    // Body validation
    if (schema.body) {
      const body = req.body || {};
      for (const [field, rules] of Object.entries(schema.body)) {
        const val = body[field];

        if (rules.required && (val === undefined || val === null || val === '')) {
          errors.push(`Field '${field}' is required in request body.`);
          continue;
        }

        if (val !== undefined && val !== null && rules.enum) {
          if (!rules.enum.includes(val)) {
            errors.push(
              `Field '${field}' must be one of: [${rules.enum.join(', ')}]. Received: '${val}'.`
            );
          }
        }
      }
    }

    // Query parameter validation
    if (schema.query) {
      const query = req.query || {};
      for (const [param, rules] of Object.entries(schema.query)) {
        const val = query[param];

        if (rules.required && (val === undefined || val === null || val === '')) {
          errors.push(`Query parameter '${param}' is required.`);
          continue;
        }

        if (val !== undefined && val !== null && rules.enum) {
          if (!rules.enum.includes(val)) {
            errors.push(
              `Query parameter '${param}' must be one of: [${rules.enum.join(', ')}]. Received: '${val}'.`
            );
          }
        }
      }
    }

    if (errors.length > 0) {
      return sendResponse(res, 400, false, 'Validation failed', { errors });
    }

    next();
  };
};