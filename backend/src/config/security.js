/**
 * CampusLink Backend - Centralized Security Configuration
 * 
 * NOTICE:
 * Configures authorization roles, request boundaries, and prototype demo auth rules.
 * Values are configurable via environment variables without hardcoded secrets.
 */

export const securityConfig = {
  demoAuthMode: process.env.DEMO_AUTH_MODE === 'true' || process.env.DEMO_AUTH_MODE === undefined,
  allowedRoles: ['student', 'recruiter', 'placement_officer'],
  maxJsonSize: process.env.MAX_JSON_SIZE || '1mb',
  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB) || 5,
  allowedDocumentExtensions: ['.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg'],
  allowedDocumentMimeTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'image/png',
    'image/jpeg'
  ]
};