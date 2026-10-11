import { pool } from '../config/database.js';

/**
 * Normalizes input offer status values from offerData.js to valid MySQL ENUM values:
 * ('Pending', 'Accepted', 'Rejected', 'Joining-Confirmed')
 */
function normalizeOfferStatus(status) {
  if (!status || typeof status !== 'string') return 'Pending';
  const clean = status.trim().toLowerCase();

  if (clean === 'offered' || clean === 'pending' || clean === 'in-review') {
    return 'Pending';
  }
  if (clean === 'accepted') {
    return 'Accepted';
  }
  if (clean === 'rejected' || clean === 'withdrawn' || clean === 'declined') {
    return 'Rejected';
  }
  if (
    clean === 'joining confirmed' ||
    clean === 'joining-confirmed' ||
    clean === 'joining_confirmed' ||
    clean === 'joined'
  ) {
    return 'Joining-Confirmed';
  }

  return 'Pending';
}

/**
 * Normalizes document status values from offerData.js to valid MySQL ENUM values:
 * ('Pending', 'Verified', 'Rejected')
 */
function normalizeDocVerificationStatus(status) {
  if (!status || typeof status !== 'string') return 'Pending';
  const clean = status.trim().toLowerCase();

  if (
    clean === 'verified' ||
    clean === 'approved' ||
    clean === 'accepted' ||
    clean === 'completed'
  ) {
    return 'Verified';
  }
  if (
    clean === 'rejected' ||
    clean === 'declined' ||
    clean === 'failed' ||
    clean === 'invalid'
  ) {
    return 'Rejected';
  }

  // Covers 'pending', 'uploaded', 'submitted', 'in-review', etc.
  return 'Pending';
}

/**
 * Formats a Date object or ISO string into a standard YYYY-MM-DD string.
 */
function formatDateField(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const day = String(val.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof val === 'string') {
    return val.split('T')[0];
  }
  return String(val);
}

/**
 * Extracts a numeric package value for storage/sorting (e.g. "18.5 LPA" -> 18.50).
 */
function parsePackageNumeric(packageStr) {
  if (typeof packageStr === 'number') return packageStr;
  if (!packageStr || typeof packageStr !== 'string') return 0.0;
  const match = packageStr.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0.0;
}

/**
 * Maps database offer row and joined document rows to the exact camelCase structure
 * expected by offer.service.js, controllers, and frontend.
 */
function mapRowToOffer(row, documents = []) {
  if (!row) return null;

  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name || '',
    driveId: row.drive_id,
    company: row.company,
    role: row.role,
    packageLPA: row.package_lpa,
    offerDate: formatDateField(row.released_date),
    joiningDate: formatDateField(row.valid_until),
    status: row.status,
    documents: documents.map((doc) => ({
      type: doc.document_type || doc.document_name,
      status: doc.verification_status,
      required: true
    }))
  };
}

/**
 * Retrieves all documents belonging to a list of offer IDs from `offer_documents`.
 * Returns a Map of offerId -> document rows array.
 */
async function fetchDocumentsByOfferIds(offerIds) {
  if (!Array.isArray(offerIds) || offerIds.length === 0) {
    return new Map();
  }

  const placeholders = offerIds.map(() => '?').join(', ');
  const query = `
    SELECT id, offer_id, document_name, document_type, file_url, verification_status
    FROM offer_documents
    WHERE offer_id IN (${placeholders})
    ORDER BY id ASC;
  `;

  const [rows] = await pool.query(query, offerIds);
  const docMap = new Map();

  for (const doc of rows) {
    if (!docMap.has(doc.offer_id)) {
      docMap.set(doc.offer_id, []);
    }
    docMap.get(doc.offer_id).push(doc);
  }

  return docMap;
}

/**
 * Fetches all offers from MySQL joining `students` to resolve `student_name`.
 * @returns {Promise<Array>} Array of mapped offer objects.
 */
export async function findAllOffers() {
  const query = `
    SELECT 
      o.id,
      o.student_id,
      s.name AS student_name,
      o.drive_id,
      o.company,
      o.role,
      o.package_lpa,
      o.released_date,
      o.valid_until,
      o.status
    FROM offers o
    LEFT JOIN students s ON s.id = o.student_id
    ORDER BY o.released_date DESC, o.id ASC;
  `;

  const [rows] = await pool.query(query);
  if (!rows || rows.length === 0) return [];

  const offerIds = rows.map((r) => r.id);
  const docMap = await fetchDocumentsByOfferIds(offerIds);

  return rows.map((row) => mapRowToOffer(row, docMap.get(row.id) || []));
}

/**
 * Fetches a single offer by ID from MySQL with resolved student_name.
 * @param {string} id - Offer ID (e.g. 'OFR-101')
 * @returns {Promise<Object|null>} Mapped offer object or null if not found.
 */
export async function findOfferById(id) {
  const query = `
    SELECT 
      o.id,
      o.student_id,
      s.name AS student_name,
      o.drive_id,
      o.company,
      o.role,
      o.package_lpa,
      o.released_date,
      o.valid_until,
      o.status
    FROM offers o
    LEFT JOIN students s ON s.id = o.student_id
    WHERE o.id = ?
    LIMIT 1;
  `;

  const [rows] = await pool.execute(query, [id ?? '']);
  if (!rows || rows.length === 0) return null;

  const docMap = await fetchDocumentsByOfferIds([rows[0].id]);
  return mapRowToOffer(rows[0], docMap.get(rows[0].id) || []);
}

/**
 * Fetches offers belonging to a specific student ID.
 * @param {string} studentId - Student identifier (e.g. 'DEMO-STU-001')
 * @returns {Promise<Array>} Array of student offer objects.
 */
export async function findOffersByStudentId(studentId) {
  const query = `
    SELECT 
      o.id,
      o.student_id,
      s.name AS student_name,
      o.drive_id,
      o.company,
      o.role,
      o.package_lpa,
      o.released_date,
      o.valid_until,
      o.status
    FROM offers o
    LEFT JOIN students s ON s.id = o.student_id
    WHERE o.student_id = ?
    ORDER BY o.released_date DESC, o.id ASC;
  `;

  const [rows] = await pool.execute(query, [studentId ?? '']);
  if (!rows || rows.length === 0) return [];

  const offerIds = rows.map((r) => r.id);
  const docMap = await fetchDocumentsByOfferIds(offerIds);

  return rows.map((row) => mapRowToOffer(row, docMap.get(row.id) || []));
}

/**
 * Fetches offers filtered by recruitment or verification status.
 * Accepts both original source status formats and canonical DB status strings.
 * @param {string} status - Offer status
 * @returns {Promise<Array>} Array of filtered offer objects.
 */
export async function findOffersByStatus(status) {
  const normalizedStatus = normalizeOfferStatus(status);

  const query = `
    SELECT 
      o.id,
      o.student_id,
      s.name AS student_name,
      o.drive_id,
      o.company,
      o.role,
      o.package_lpa,
      o.released_date,
      o.valid_until,
      o.status
    FROM offers o
    LEFT JOIN students s ON s.id = o.student_id
    WHERE UPPER(o.status) = UPPER(?)
    ORDER BY o.released_date DESC, o.id ASC;
  `;

  const [rows] = await pool.execute(query, [normalizedStatus]);
  if (!rows || rows.length === 0) return [];

  const offerIds = rows.map((r) => r.id);
  const docMap = await fetchDocumentsByOfferIds(offerIds);

  return rows.map((row) => mapRowToOffer(row, docMap.get(row.id) || []));
}

/**
 * Fetches documents specifically for a given offer ID.
 * Returns documents conforming to { type, status, required }.
 * @param {string} offerId - Target offer ID
 * @returns {Promise<Array>} Array of document verification items.
 */
export async function findDocumentsByOfferId(offerId) {
  const query = `
    SELECT document_name, document_type, file_url, verification_status
    FROM offer_documents
    WHERE offer_id = ?
    ORDER BY id ASC;
  `;

  const [rows] = await pool.execute(query, [offerId ?? '']);
  return rows.map((doc) => ({
    type: doc.document_type || doc.document_name,
    status: doc.verification_status,
    required: true
  }));
}

/**
 * Inserts or updates an offer and all associated documents in MySQL within a transaction.
 * Maps and normalizes statuses to valid ENUM values for safe execution.
 *
 * @param {Object} offer - Synthetic offer data object
 */
export async function upsertOfferWithDocuments(offer) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const offerId = offer.id ?? '';
    const packageLPA = offer.packageLPA ?? '';
    const packageNumeric = parsePackageNumeric(packageLPA);

    const releasedDate = offer.offerDate ? formatDateField(offer.offerDate) : formatDateField(new Date());
    const validUntil = offer.joiningDate ? formatDateField(offer.joiningDate) : null;
    const dbOfferStatus = normalizeOfferStatus(offer.status);

    const offerQuery = `
      INSERT INTO offers (
        id, student_id, drive_id, company, role,
        package_lpa, package_numeric, status, released_date, valid_until
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        student_id = VALUES(student_id),
        drive_id = VALUES(drive_id),
        company = VALUES(company),
        role = VALUES(role),
        package_lpa = VALUES(package_lpa),
        package_numeric = VALUES(package_numeric),
        status = VALUES(status),
        released_date = VALUES(released_date),
        valid_until = VALUES(valid_until);
    `;

    const offerParams = [
      offerId,
      offer.studentId ?? '',
      offer.driveId ?? '',
      offer.company ?? '',
      offer.role ?? '',
      packageLPA,
      packageNumeric,
      dbOfferStatus,
      releasedDate,
      validUntil
    ];

    await connection.execute(offerQuery, offerParams);

    // Upsert associated document records
    if (Array.isArray(offer.documents) && offer.documents.length > 0) {
      const docQuery = `
        INSERT INTO offer_documents (
          id, offer_id, document_name, document_type, file_url, verification_status
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          document_name = VALUES(document_name),
          document_type = VALUES(document_type),
          verification_status = VALUES(verification_status);
      `;

      for (let i = 0; i < offer.documents.length; i++) {
        const doc = offer.documents[i];
        const docType = doc.type ?? `Document-${i + 1}`;
        const docName = doc.name ?? docType;
        const docId = `${offerId}_DOC_${i + 1}`;
        const fileUrl = doc.fileUrl ?? null;
        const dbDocStatus = normalizeDocVerificationStatus(doc.status);

        const docParams = [
          docId,
          offerId,
          docName,
          docType,
          fileUrl,
          dbDocStatus
        ];

        await connection.execute(docQuery, docParams);
      }
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}