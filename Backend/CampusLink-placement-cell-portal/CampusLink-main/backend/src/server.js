import app from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.PORT, () => {
  console.log(`[CampusLink Backend] Server listening on port ${env.PORT} (${env.NODE_ENV})`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('[CampusLink Backend] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[CampusLink Backend] Process terminated.');
  });
});

process.on('SIGINT', () => {
  console.log('[CampusLink Backend] SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('[CampusLink Backend] Process terminated.');
  });
});