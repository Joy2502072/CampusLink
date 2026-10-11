/**
 * Consistent JSON response helper
 */
export const sendResponse = (res, statusCode, success, message, data = null) => {
  const payload = {
    success,
    message,
    ...(data && { data })
  };

  return res.status(statusCode).json(payload);
};