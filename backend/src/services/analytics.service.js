import { findAllStudents } from '../repositories/student.repository.js';
import { findAllDrives } from '../repositories/drive.repository.js';
import { findAllOffers } from '../repositories/offer.repository.js';

/**
 * Safely converts a value to a number.
 */
function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

/**
 * Extracts numeric package value.
 * Supports values such as:
 * 18.5
 * "18.5 LPA"
 * "18.5"
 */
function getPackageValue(offer) {
  if (offer?.packageNumeric !== undefined && offer?.packageNumeric !== null) {
    return toNumber(offer.packageNumeric);
  }

  if (offer?.packageLPA !== undefined && offer?.packageLPA !== null) {
    const match = String(offer.packageLPA).match(/(\d+(?:\.\d+)?)/);
    return match ? Number(match[1]) : 0;
  }

  return 0;
}

/**
 * Normalizes offer status so MySQL values and legacy values
 * can be handled consistently.
 */
function normalizeOfferStatus(status) {
  const value = String(status || '').trim().toLowerCase();

  if (
    value === 'accepted' ||
    value === 'accept'
  ) {
    return 'Accepted';
  }

  if (
    value === 'joining-confirmed' ||
    value === 'joining confirmed' ||
    value === 'joining_confirmed'
  ) {
    return 'Joining Confirmed';
  }

  if (
    value === 'rejected' ||
    value === 'withdrawn' ||
    value === 'declined'
  ) {
    return 'Rejected';
  }

  if (
    value === 'pending' ||
    value === 'offered' ||
    value === 'in-review' ||
    value === 'in review'
  ) {
    return 'Pending';
  }

  return status || 'Pending';
}

/**
 * Returns true when an offer represents a placed student.
 */
function isPlacedOffer(offer) {
  const status = normalizeOfferStatus(offer?.status);

  return (
    status === 'Accepted' ||
    status === 'Joining Confirmed'
  );
}

/**
 * Returns true when an offer should be included
 * in package statistics.
 */
function isValidPackageOffer(offer) {
  const status = normalizeOfferStatus(offer?.status);

  return (
    status !== 'Rejected' &&
    getPackageValue(offer) > 0
  );
}

/**
 * Calculates average.
 */
function calculateAverage(values) {
  if (!values.length) return 0;

  const total = values.reduce(
    (sum, value) => sum + toNumber(value),
    0
  );

  return Number((total / values.length).toFixed(2));
}

/**
 * Rounds a number to two decimal places.
 */
function roundTwo(value) {
  return Number(toNumber(value).toFixed(2));
}

/**
 * Gets unique placed student IDs.
 *
 * A student with multiple accepted offers is counted only once.
 */
function getPlacedStudentIds(offers) {
  const placedIds = new Set();

  for (const offer of offers) {
    if (!isPlacedOffer(offer)) continue;

    const studentId =
      offer?.studentId ??
      offer?.student_id;

    if (studentId) {
      placedIds.add(studentId);
    }
  }

  return placedIds;
}

/**
 * Checks whether a drive is active.
 */
function isActiveDrive(drive) {
  const status = String(drive?.status || '')
    .trim()
    .toLowerCase();

  return (
    status !== 'completed' &&
    status !== 'cancelled' &&
    status !== 'canceled'
  );
}

/**
 * ============================================================
 * OVERVIEW ANALYTICS
 * ============================================================
 *
 * Response contract intentionally preserved from the original
 * analytics service.
 */
export async function getOverviewAnalytics() {
  const [students, drives, offers] = await Promise.all([
    findAllStudents(),
    findAllDrives(),
    findAllOffers()
  ]);

  const placedStudentIds = getPlacedStudentIds(offers);

  const packageOffers = offers.filter(isValidPackageOffer);
  const packageValues = packageOffers.map(getPackageValue);

  const totalStudents = students.length;
  const placedStudents = placedStudentIds.size;

  const placementRate =
    totalStudents > 0
      ? roundTwo((placedStudents / totalStudents) * 100)
      : 0;

  const acceptedOffers = offers.filter(
    (offer) =>
      normalizeOfferStatus(offer?.status) === 'Accepted'
  ).length;

  const joiningConfirmedOffers = offers.filter(
    (offer) =>
      normalizeOfferStatus(offer?.status) === 'Joining Confirmed'
  ).length;

  const activePlacementDrives =
    drives.filter(isActiveDrive).length;

  return {
    totalStudents,
    placedStudents,
    placementRate,
    totalOffers: offers.length,
    acceptedOffers,
    joiningConfirmedOffers,
    activePlacementDrives,
    averagePackageLPA: calculateAverage(packageValues),
    highestPackageLPA: packageValues.length
      ? Math.max(...packageValues)
      : 0,
    lowestPackageLPA: packageValues.length
      ? Math.min(...packageValues)
      : 0
  };
}

/**
 * ============================================================
 * BRANCH ANALYTICS
 * ============================================================
 */
export async function getBranchAnalytics() {
  const [students, offers] = await Promise.all([
    findAllStudents(),
    findAllOffers()
  ]);

  const placedStudentIds = getPlacedStudentIds(offers);

  const branches = [
    ...new Set(
      students
        .map((student) => student?.branch)
        .filter(Boolean)
    )
  ];

  return branches.map((branch) => {
    const branchStudents = students.filter(
      (student) => student.branch === branch
    );

    const branchStudentIds = new Set(
      branchStudents.map((student) => student.id)
    );

    const placedBranchStudents =
      [...branchStudentIds].filter((id) =>
        placedStudentIds.has(id)
      );

    const branchOffers = offers.filter((offer) => {
      const studentId =
        offer?.studentId ??
        offer?.student_id;

      return (
        studentId &&
        branchStudentIds.has(studentId) &&
        isValidPackageOffer(offer)
      );
    });

    const packageValues =
      branchOffers.map(getPackageValue);

    const totalStudents = branchStudents.length;

    const placedStudents =
      placedBranchStudents.length;

    const placementRate =
      totalStudents > 0
        ? roundTwo(
            (placedStudents / totalStudents) * 100
          )
        : 0;

    return {
      branch,
      totalStudents,
      placedStudents,
      placementRate,
      averagePackageLPA:
        calculateAverage(packageValues),
      highestPackageLPA: packageValues.length
        ? Math.max(...packageValues)
        : 0
    };
  });
}

/**
 * ============================================================
 * PACKAGE ANALYTICS
 * ============================================================
 */
export async function getPackageAnalytics() {
  const offers = await findAllOffers();

  const packageOffers =
    offers.filter(isValidPackageOffer);

  const packageValues =
    packageOffers.map(getPackageValue);

  const distribution = [
    {
      range: 'Below 10 LPA',
      offerCount: packageValues.filter(
        (value) => value < 10
      ).length
    },
    {
      range: '10-15 LPA',
      offerCount: packageValues.filter(
        (value) => value >= 10 && value < 15
      ).length
    },
    {
      range: '15-20 LPA',
      offerCount: packageValues.filter(
        (value) => value >= 15 && value < 20
      ).length
    },
    {
      range: '20+ LPA',
      offerCount: packageValues.filter(
        (value) => value >= 20
      ).length
    }
  ];

  return {
    averagePackageLPA:
      calculateAverage(packageValues),

    highestPackageLPA: packageValues.length
      ? Math.max(...packageValues)
      : 0,

    lowestPackageLPA: packageValues.length
      ? Math.min(...packageValues)
      : 0,

    distribution,

    packageValues
  };
}

/**
 * ============================================================
 * COMPANY ANALYTICS
 * ============================================================
 */
export async function getCompanyAnalytics() {
  const offers = await findAllOffers();

  const companies = [
    ...new Set(
      offers
        .map((offer) => offer?.company)
        .filter(Boolean)
    )
  ];

  const companyAnalytics = companies.map((company) => {
    const companyOffers = offers.filter(
      (offer) => offer.company === company
    );

    const acceptedOffers =
      companyOffers.filter(
        (offer) =>
          normalizeOfferStatus(offer.status) ===
          'Accepted'
      );

    const joiningConfirmedOffers =
      companyOffers.filter(
        (offer) =>
          normalizeOfferStatus(offer.status) ===
          'Joining Confirmed'
      );

    const offeredOffers =
      companyOffers.filter(
        (offer) =>
          normalizeOfferStatus(offer.status) ===
          'Pending'
      );

    const withdrawnOffers =
      companyOffers.filter(
        (offer) =>
          normalizeOfferStatus(offer.status) ===
          'Rejected'
      );

    const packageValues = companyOffers
      .filter(isValidPackageOffer)
      .map(getPackageValue);

    return {
      company,
      totalOffers: companyOffers.length,
      acceptedOffers: acceptedOffers.length,
      joiningConfirmedOffers:
        joiningConfirmedOffers.length,
      offeredOffers: offeredOffers.length,
      withdrawnOffers: withdrawnOffers.length,
      averagePackageLPA:
        calculateAverage(packageValues),
      highestPackageLPA: packageValues.length
        ? Math.max(...packageValues)
        : 0
    };
  });

  return companyAnalytics.sort((a, b) => {
    if (
      b.joiningConfirmedOffers !==
      a.joiningConfirmedOffers
    ) {
      return (
        b.joiningConfirmedOffers -
        a.joiningConfirmedOffers
      );
    }

    if (
      b.acceptedOffers !==
      a.acceptedOffers
    ) {
      return (
        b.acceptedOffers -
        a.acceptedOffers
      );
    }

    return a.company.localeCompare(b.company);
  });
}

/**
 * ============================================================
 * PLACEMENT INSIGHTS
 * ============================================================
 */
export async function getPlacementInsights() {
  const [
    overview,
    branchAnalytics,
    companyAnalytics
  ] = await Promise.all([
    getOverviewAnalytics(),
    getBranchAnalytics(),
    getCompanyAnalytics()
  ]);

  const insights = [];

  /**
   * 1. Placement conversion
   */
  insights.push({
    type: 'placement-rate',
    title: 'Institutional placement conversion',
    description:
      `${overview.placedStudents} out of ` +
      `${overview.totalStudents} students are currently placed.`,
    value: `${overview.placementRate}%`
  });

  /**
   * 2. Highest package
   */
  insights.push({
    type: 'highest-package',
    title: 'Maximum compensation',
    description:
      'Highest package recorded across active placement offers.',
    value: `${overview.highestPackageLPA} LPA`
  });

  /**
   * 3. Average package
   */
  insights.push({
    type: 'average-package',
    title: 'Average compensation',
    description:
      'Average package across non-rejected placement offers.',
    value: `${overview.averagePackageLPA} LPA`
  });

  /**
   * 4. Leading branch
   */
  if (branchAnalytics.length > 0) {
    const leadingBranch =
      [...branchAnalytics].sort(
        (a, b) => b.placementRate - a.placementRate
      )[0];

    insights.push({
      type: 'leading-branch',
      title: 'Leading discipline by placement rate',
      description:
        `${leadingBranch.branch} currently has the highest ` +
        'placement rate among available student branches.',
      value: `${leadingBranch.placementRate}%`
    });
  }

  /**
   * 5. Company with most joining confirmations
   */
  if (companyAnalytics.length > 0) {
    const leadingCompany =
      [...companyAnalytics].sort(
        (a, b) =>
          b.joiningConfirmedOffers -
          a.joiningConfirmedOffers
      )[0];

    insights.push({
      type: 'joining-confirmation',
      title: 'Highest joining confirmations',
      description:
        `${leadingCompany.company} has the highest ` +
        'number of joining-confirmed offers.',
      value:
        String(
          leadingCompany.joiningConfirmedOffers
        )
    });
  }

  /**
   * 6. Active recruitment pipeline
   */
  insights.push({
    type: 'active-drives',
    title: 'Active recruitment pipelines',
    description:
      'Placement drives currently active in the system.',
    value: String(
      overview.activePlacementDrives
    )
  });

  return {
    insights
  };
}