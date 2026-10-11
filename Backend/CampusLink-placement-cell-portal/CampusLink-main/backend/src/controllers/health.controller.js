import { env } from '../config/env.js';

export const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CampusLink backend is running',
    service: 'campuslink-backend',
    environment: env.NODE_ENV
  });
};