import { Router } from 'express';
import {
  getAllOffers,
  getOffersByStudent,
  getOffersByStatus,
  getOfferById,
  getOfferDocuments,
  getStudentOfferSummary
} from '../controllers/offer.controller.js';

const router = Router();

// Retrieve all placement offers
router.get('/', getAllOffers);

// Specific sub-resource routes ordered before generic :offerId parameters
router.get('/student/:studentId/summary', getStudentOfferSummary);
router.get('/student/:studentId', getOffersByStudent);
router.get('/status/:status', getOffersByStatus);
router.get('/:offerId/documents', getOfferDocuments);

// Single offer by ID
router.get('/:offerId', getOfferById);

export default router;