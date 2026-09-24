import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import healthRoutes from './routes/health.routes.js';
import studentRoutes from './routes/student.routes.js';
import driveRoutes from './routes/drive.routes.js';
import matchingRoutes from './routes/matching.routes.js';
import offerRoutes from './routes/offer.routes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration - limited strictly to designated frontend client origin
app.use(
  cors({
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base API Routes
app.use('/api/health', healthRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/offers', offerRoutes);

// Fallback 404 handler for unmatched routes
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

export default app;