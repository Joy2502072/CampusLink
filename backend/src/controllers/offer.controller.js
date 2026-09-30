import * as offerRepository from '../repositories/offer.repository.js';
import { sendResponse } from '../utils/response.js';

/**
 * Extracts a numeric value from package string (e.g., "18.5 LPA" -> 18.5).
 */
function parsePackageValue(packageStr) {
  if (typeof packageStr === 'number') return packageStr;
  if (!packageStr || typeof packageStr !== 'string') return 0;
  const match = packageStr.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * GET /api/offers
 * Retrieves list of all offers from MySQL.
 */
export async function getAllOffers(req, res, next) {
  try {
    const data = await offerRepository.findAllOffers();
    return sendResponse(res, 200, true, 'Placement offers fetched successfully', data || []);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/offers/:offerId
 * Retrieves a single placement offer by offerId parameter.
 */
export async function getOfferById(req, res, next) {
  try {
    const { offerId } = req.params;
    if (!offerId || !offerId.trim()) {
      return sendResponse(res, 400, false, 'Invalid offer ID parameter');
    }

    const offer = await offerRepository.findOfferById(offerId.trim());
    if (!offer) {
      return sendResponse(res, 404, false, 'Placement offer not found');
    }

    return sendResponse(res, 200, true, 'Placement offer fetched successfully', offer);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/offers/student/:studentId
 * Retrieves placement offers for a specific student.
 */
export async function getOffersByStudent(req, res, next) {
  try {
    const { studentId } = req.params;
    if (!studentId || !studentId.trim()) {
      return sendResponse(res, 400, false, 'Invalid student ID parameter');
    }

    const studentOffers = await offerRepository.findOffersByStudentId(studentId.trim());
    return sendResponse(
      res,
      200,
      true,
      `Placement offers for student ${studentId} fetched successfully`,
      studentOffers || []
    );
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/offers/status/:status
 * Retrieves placement offers filtered by status.
 */
export async function getOffersByStatus(req, res, next) {
  try {
    const { status } = req.params;
    if (!status || !status.trim()) {
      return sendResponse(res, 400, false, 'Invalid status parameter');
    }

    const filtered = await offerRepository.findOffersByStatus(status.trim());
    return sendResponse(
      res,
      200,
      true,
      `Placement offers with status ${status} fetched successfully`,
      filtered || []
    );
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/offers/:offerId/documents
 * Retrieves document verification checklist and compliance metrics for an offer.
 */
export async function getOfferDocuments(req, res, next) {
  try {
    const { offerId } = req.params;
    if (!offerId || !offerId.trim()) {
      return sendResponse(res, 400, false, 'Invalid offer ID parameter');
    }

    const offer = await offerRepository.findOfferById(offerId.trim());
    if (!offer) {
      return sendResponse(res, 404, false, 'Placement offer not found');
    }

    const documents = Array.isArray(offer.documents) ? offer.documents : [];
    const totalDocuments = documents.length;

    const requiredDocs = documents.filter((d) => Boolean(d.required));
    const requiredDocuments = requiredDocs.length;

    const submittedDocuments = documents.filter((d) => {
      const s = (d.status || '').toLowerCase();
      return s === 'submitted' || s === 'verified';
    }).length;

    const verifiedDocuments = documents.filter((d) => {
      const s = (d.status || '').toLowerCase();
      return s === 'verified';
    }).length;

    const pendingDocuments = documents.filter((d) => {
      const s = (d.status || '').toLowerCase();
      return s === 'pending';
    }).length;

    const completedRequired = requiredDocs.filter((d) => {
      const s = (d.status || '').toLowerCase();
      return s === 'submitted' || s === 'verified';
    }).length;

    const completionPercentage =
      requiredDocuments > 0
        ? Math.round((completedRequired / requiredDocuments) * 1000) / 10
        : 0;

    return sendResponse(res, 200, true, 'Offer documents fetched successfully', {
      offerId: offer.id,
      studentId: offer.studentId,
      studentName: offer.studentName || '',
      company: offer.company,
      totalDocuments,
      requiredDocuments,
      submittedDocuments,
      verifiedDocuments,
      pendingDocuments,
      completionPercentage,
      documents
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/offers/student/:studentId/summary
 * Retrieves student offer and documentation compliance summary.
 */
export async function getStudentOfferSummary(req, res, next) {
  try {
    const { studentId } = req.params;
    if (!studentId || !studentId.trim()) {
      return sendResponse(res, 400, false, 'Invalid student ID parameter');
    }

    const rawOffers = (await offerRepository.findOffersByStudentId(studentId.trim())) || [];

    // Sort returned offers descending by package numeric value without mutating original list
    const sortedOffers = [...rawOffers].sort((a, b) => {
      return parsePackageValue(b.packageLPA) - parsePackageValue(a.packageLPA);
    });

    const totalOffers = sortedOffers.length;
    const studentName = sortedOffers.length > 0 ? sortedOffers[0].studentName : '';

    const acceptedOffers = sortedOffers.filter((o) => {
      const s = (o.status || '').toLowerCase();
      return s === 'accepted';
    }).length;

    const joiningConfirmedOffers = sortedOffers.filter((o) => {
      const s = (o.status || '').toLowerCase();
      return s === 'joining confirmed' || s === 'joining-confirmed';
    }).length;

    const activeOfferCount = acceptedOffers + joiningConfirmedOffers;

    let totalPackageValue = 0;
    let highestNumeric = 0;
    let highestPackageLPA = '0 LPA';

    sortedOffers.forEach((offer) => {
      const val = parsePackageValue(offer.packageLPA);
      const s = (offer.status || '').toLowerCase();

      if (val > highestNumeric) {
        highestNumeric = val;
        highestPackageLPA = offer.packageLPA;
      }

      if (s === 'accepted' || s === 'joining confirmed' || s === 'joining-confirmed') {
        totalPackageValue += val;
      }
    });

    return sendResponse(res, 200, true, 'Student offer summary fetched successfully', {
      studentId: studentId.trim(),
      studentName,
      totalOffers,
      acceptedOffers,
      joiningConfirmedOffers,
      activeOfferCount,
      totalPackageValue: Math.round(totalPackageValue * 100) / 100,
      highestPackageLPA,
      offers: sortedOffers
    });
  } catch (error) {
    return next(error);
  }
}