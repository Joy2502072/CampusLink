import { offers } from '../data/offerData.js';
import { sendResponse } from '../utils/response.js';

/**
 * GET /api/offers
 * Retrieve all synthetic placement offers
 */
export const getAllOffers = (req, res, next) => {
  try {
    return sendResponse(res, 200, true, 'Placement offers fetched successfully', offers);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/offers/student/:studentId
 * Return all offers belonging to a student (case-insensitive)
 */
export const getOffersByStudent = (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!studentId || typeof studentId !== 'string' || !studentId.trim()) {
      return sendResponse(res, 400, false, 'Invalid student ID parameter provided');
    }

    const normalizedStudentId = studentId.trim().toUpperCase();
    const studentOffers = offers.filter(
      (o) => o.studentId.toUpperCase() === normalizedStudentId
    );

    if (studentOffers.length === 0) {
      return sendResponse(res, 200, true, 'No placement offers found for student', []);
    }

    return sendResponse(
      res,
      200,
      true,
      `Placement offers for student ${normalizedStudentId} fetched successfully`,
      studentOffers
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/offers/status/:status
 * Filter offers by offer status (case-insensitive)
 */
export const getOffersByStatus = (req, res, next) => {
  try {
    const { status } = req.params;

    if (!status || typeof status !== 'string' || !status.trim()) {
      return sendResponse(res, 400, false, 'Invalid status parameter provided');
    }

    const normalizedStatus = status.trim().toUpperCase();
    const filteredOffers = offers.filter(
      (o) => o.status.toUpperCase() === normalizedStatus
    );

    return sendResponse(
      res,
      200,
      true,
      `Placement offers with status '${status.trim()}' fetched successfully`,
      filteredOffers
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/offers/:offerId
 * Retrieve one placement offer by ID (case-insensitive)
 */
export const getOfferById = (req, res, next) => {
  try {
    const { offerId } = req.params;

    if (!offerId || typeof offerId !== 'string' || !offerId.trim()) {
      return sendResponse(res, 400, false, 'Invalid offer ID parameter provided');
    }

    const normalizedOfferId = offerId.trim().toUpperCase();
    const offer = offers.find((o) => o.id.toUpperCase() === normalizedOfferId);

    if (!offer) {
      return sendResponse(res, 404, false, 'Placement offer not found');
    }

    return sendResponse(res, 200, true, 'Placement offer fetched successfully', offer);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/offers/:offerId/documents
 * Return document tracking summary with dynamic metrics calculation
 */
export const getOfferDocuments = (req, res, next) => {
  try {
    const { offerId } = req.params;

    if (!offerId || typeof offerId !== 'string' || !offerId.trim()) {
      return sendResponse(res, 400, false, 'Invalid offer ID parameter provided');
    }

    const normalizedOfferId = offerId.trim().toUpperCase();
    const offer = offers.find((o) => o.id.toUpperCase() === normalizedOfferId);

    if (!offer) {
      return sendResponse(res, 404, false, 'Placement offer not found');
    }

    const docs = offer.documents || [];
    const totalDocuments = docs.length;
    const requiredDocs = docs.filter((d) => d.required);
    const requiredDocuments = requiredDocs.length;

    const submittedDocuments = docs.filter((d) => d.status === 'Submitted').length;
    const verifiedDocuments = docs.filter((d) => d.status === 'Verified').length;
    const pendingDocuments = docs.filter((d) => d.status === 'Pending').length;

    // Completed required documents: either Submitted or Verified
    const completedRequired = requiredDocs.filter(
      (d) => d.status === 'Submitted' || d.status === 'Verified'
    ).length;

    // Completion percentage calculation rounded to 1 decimal place
    const rawPercentage = requiredDocuments > 0
      ? (completedRequired / requiredDocuments) * 100
      : 100.0;
    const completionPercentage = Math.round(rawPercentage * 10) / 10;

    const summary = {
      offerId: offer.id,
      studentId: offer.studentId,
      studentName: offer.studentName,
      company: offer.company,
      totalDocuments,
      requiredDocuments,
      submittedDocuments,
      verifiedDocuments,
      pendingDocuments,
      completionPercentage,
      documents: docs
    };

    return sendResponse(
      res,
      200,
      true,
      `Document tracking summary for offer ${offer.id} fetched successfully`,
      summary
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/offers/student/:studentId/summary
 * Return aggregated placement offer summary for a student
 */
export const getStudentOfferSummary = (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!studentId || typeof studentId !== 'string' || !studentId.trim()) {
      return sendResponse(res, 400, false, 'Invalid student ID parameter provided');
    }

    const normalizedStudentId = studentId.trim().toUpperCase();
    const studentOffers = offers.filter(
      (o) => o.studentId.toUpperCase() === normalizedStudentId
    );

    const totalOffers = studentOffers.length;
    const studentName = totalOffers > 0 ? studentOffers[0].studentName : '';

    const acceptedOffers = studentOffers.filter((o) => o.status === 'Accepted').length;
    const joiningConfirmedOffers = studentOffers.filter((o) => o.status === 'Joining Confirmed').length;

    // Active offers are Accepted or Joining Confirmed
    const activeOfferCount = acceptedOffers + joiningConfirmedOffers;

    // Sum packageLPA for active offers only
    const rawPackageSum = studentOffers
      .filter((o) => o.status === 'Accepted' || o.status === 'Joining Confirmed')
      .reduce((sum, o) => sum + (Number(o.packageLPA) || 0), 0);
    const totalPackageValue = Math.round(rawPackageSum * 10) / 10;

    // Highest package among all student offers or 0 if none
    const highestPackageLPA = totalOffers > 0
      ? Math.max(...studentOffers.map((o) => Number(o.packageLPA) || 0))
      : 0;

    // Sort copies of offers descending by packageLPA without mutating data source
    const sortedOffers = [...studentOffers].sort(
      (a, b) => (Number(b.packageLPA) || 0) - (Number(a.packageLPA) || 0)
    );

    const summary = {
      studentId: normalizedStudentId,
      studentName,
      totalOffers,
      acceptedOffers,
      joiningConfirmedOffers,
      activeOfferCount,
      totalPackageValue,
      highestPackageLPA,
      offers: sortedOffers
    };

    return sendResponse(
      res,
      200,
      true,
      `Offer summary for student ${normalizedStudentId} generated successfully`,
      summary
    );
  } catch (error) {
    next(error);
  }
};