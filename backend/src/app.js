import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { securityConfig } from './config/security.js';
import { securityHeaders } from './middleware/securityHeaders.js';
import { authenticate } from './middleware/authenticate.js';
import { authorize } from './middleware/authorize.js';
import healthRoutes from './routes/health.routes.js';
import studentRoutes from './routes/student.routes.js';
import driveRoutes from './routes/drive.routes.js';
import matchingRoutes from './routes/matching.routes.js';
import offerRoutes from './routes/offer.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import schedulerRoutes from './routes/scheduler.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security headers
app.use(securityHeaders);

// CORS configuration - limited strictly to designated frontend client origin
app.use(
  cors({
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Demo-User-Role'],
    credentials: true
  })
);

// Body parsers with configurable boundaries
app.use(express.json({ limit: securityConfig.maxJsonSize }));
app.use(express.urlencoded({ extended: true, limit: securityConfig.maxJsonSize }));

// Public / Candidate exploration routes (unrestricted for student portal & prototype browsing)
app.use('/api/health', healthRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/matching', matchingRoutes);

// Protected routes (require valid demo role credentials and role authorization)
app.use(
  '/api/offers',
  authenticate,
  authorize('recruiter', 'placement_officer'),
  offerRoutes
);

app.use(
  '/api/analytics',
  authenticate,
  authorize('placement_officer'),
  analyticsRoutes
);

app.use(
  '/api/scheduler',
  authenticate,
  authorize('placement_officer'),
  schedulerRoutes
);

app.use(
  '/api/notifications',
  authenticate,
  authorize('placement_officer'),
  notificationRoutes
);

// Fallback 404 handler for unmatched routes
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

export default app;