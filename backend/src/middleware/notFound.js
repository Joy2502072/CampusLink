export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Not Found - Endpoint [${req.method}] ${req.originalUrl} does not exist.`
  });
};