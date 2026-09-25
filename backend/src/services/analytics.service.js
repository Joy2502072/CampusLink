/**
 * CampusLink Backend - Placement Analytics Service
 * 
 * NOTICE:
 * All analytical aggregations are deterministic, descriptive, and derived purely
 * from in-memory synthetic datasets. They reflect current state summaries and do not
 * provide predictive or hiring-guarantee assessments.
 */

import { students } from '../data/studentData.js';
import { drives } from '../data/driveData.js';
import { offers } from '../data/offerData.js';

/**
 * Helper to round numeric values to 1 decimal place safely
 */
const roundToOneDecimal = (value) => {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) return 0;
  return Math.round(value * 10) / 10;
};

/**
 * Filter non-withdrawn offers (Accepted, Joining Confirmed, Offered)
 */
const getNonWithdrawnOffers = () => {
  return offers.filter((o) => o.status !== 'Withdrawn');
};

/**
 * Retrieve unique student IDs considered placed (status === Accepted or Joining Confirmed)
 */
const getPlacedStudentIdSet = () => {
  const placedOffers = offers.filter(
    (o) => o.status === 'Accepted' || o.status === 'Joining Confirmed'
  );
  return new Set(placedOffers.map((o) => o.studentId.toUpperCase()));
};

/**
 * GET /api/analytics/overview
 * High-level institutional placement KPIs
 */
export const getOverviewAnalytics = () => {
  const totalStudents = students.length;
  const placedStudentIds = getPlacedStudentIdSet();
  const placedStudents = placedStudentIds.size;

  const placementRate = totalStudents > 0
    ? roundToOneDecimal((placedStudents / totalStudents) * 100)
    : 0;

  const totalOffers = offers.length;
  const acceptedOffers = offers.filter((o) => o.status === 'Accepted').length;
  const joiningConfirmedOffers = offers.filter((o) => o.status === 'Joining Confirmed').length;

  // Active drives exclude Completed or Cancelled
  const activePlacementDrives = drives.filter(
    (d) => d.status !== 'Completed' && d.status !== 'Cancelled'
  ).length;

  const nonWithdrawn = getNonWithdrawnOffers();
  const packageValues = nonWithdrawn.map((o) => Number(o.packageLPA) || 0);

  let averagePackageLPA = 0;
  let highestPackageLPA = 0;
  let lowestPackageLPA = 0;

  if (packageValues.length > 0) {
    const totalPkgSum = packageValues.reduce((sum, p) => sum + p, 0);
    averagePackageLPA = roundToOneDecimal(totalPkgSum / packageValues.length);
    highestPackageLPA = roundToOneDecimal(Math.max(...packageValues));
    lowestPackageLPA = roundToOneDecimal(Math.min(...packageValues));
  }

  return {
    totalStudents,
    placedStudents,
    placementRate,
    totalOffers,
    acceptedOffers,
    joiningConfirmedOffers,
    activePlacementDrives,
    averagePackageLPA,
    highestPackageLPA,
    lowestPackageLPA
  };
};

/**
 * GET /api/analytics/branches
 * Department/branch-wise placement breakdown
 */
export const getBranchAnalytics = () => {
  const placedStudentIds = getPlacedStudentIdSet();

  // Extract distinct branch names sorted alphabetically
  const uniqueBranches = Array.from(
    new Set(students.map((s) => (s.branch || '').toUpperCase()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  // Map student ID to student branch for quick lookup
  const studentBranchMap = new Map();
  for (const s of students) {
    if (s.id && s.branch) {
      studentBranchMap.set(s.id.toUpperCase(), s.branch.toUpperCase());
    }
  }

  const nonWithdrawn = getNonWithdrawnOffers();

  return uniqueBranches.map((branch) => {
    const branchStudents = students.filter(
      (s) => (s.branch || '').toUpperCase() === branch
    );
    const totalBranchStudents = branchStudents.length;

    // Count placed students belonging to this branch (each student counted once)
    const placedBranchStudents = branchStudents.filter((s) =>
      placedStudentIds.has(s.id.toUpperCase())
    ).length;

    const placementRate = totalBranchStudents > 0
      ? roundToOneDecimal((placedBranchStudents / totalBranchStudents) * 100)
      : 0;

    // Filter non-withdrawn offers belonging to students of this branch
    const branchOffers = nonWithdrawn.filter((o) => {
      const sBranch = studentBranchMap.get((o.studentId || '').toUpperCase());
      return sBranch === branch;
    });

    const branchPackages = branchOffers.map((o) => Number(o.packageLPA) || 0);

    let averagePackageLPA = 0;
    let highestPackageLPA = 0;

    if (branchPackages.length > 0) {
      const sum = branchPackages.reduce((acc, p) => acc + p, 0);
      averagePackageLPA = roundToOneDecimal(sum / branchPackages.length);
      highestPackageLPA = roundToOneDecimal(Math.max(...branchPackages));
    }

    return {
      branch,
      totalStudents: totalBranchStudents,
      placedStudents: placedBranchStudents,
      placementRate,
      averagePackageLPA,
      highestPackageLPA
    };
  });
};

/**
 * GET /api/analytics/packages
 * Salary package distribution ranges and statistics
 */
export const getPackageAnalytics = () => {
  const nonWithdrawn = getNonWithdrawnOffers();
  const packageValues = nonWithdrawn
    .map((o) => Number(o.packageLPA) || 0)
    .sort((a, b) => a - b);

  let averagePackageLPA = 0;
  let highestPackageLPA = 0;
  let lowestPackageLPA = 0;

  if (packageValues.length > 0) {
    const sum = packageValues.reduce((acc, p) => acc + p, 0);
    averagePackageLPA = roundToOneDecimal(sum / packageValues.length);
    highestPackageLPA = roundToOneDecimal(Math.max(...packageValues));
    lowestPackageLPA = roundToOneDecimal(Math.min(...packageValues));
  }

  // Bracket non-withdrawn offers into predefined bands
  const rangeBelow10 = packageValues.filter((p) => p < 10).length;
  const range10To15 = packageValues.filter((p) => p >= 10 && p < 15).length;
  const range15To20 = packageValues.filter((p) => p >= 15 && p < 20).length;
  const range20Plus = packageValues.filter((p) => p >= 20).length;

  const distribution = [
    { range: 'Below 10 LPA', offerCount: rangeBelow10 },
    { range: '10-15 LPA', offerCount: range10To15 },
    { range: '15-20 LPA', offerCount: range15To20 },
    { range: '20+ LPA', offerCount: range20Plus }
  ];

  return {
    averagePackageLPA,
    highestPackageLPA,
    lowestPackageLPA,
    distribution,
    packageValues
  };
};

/**
 * GET /api/analytics/companies
 * Offer distributions grouped by corporate recruiter
 */
export const getCompanyAnalytics = () => {
  const companyMap = new Map();

  for (const o of offers) {
    const compName = o.company || 'Unknown Company';
    if (!companyMap.has(compName)) {
      companyMap.set(compName, []);
    }
    companyMap.get(compName).push(o);
  }

  const result = [];

  for (const [company, compOffers] of companyMap.entries()) {
    const totalOffers = compOffers.length;
    const acceptedOffers = compOffers.filter((o) => o.status === 'Accepted').length;
    const joiningConfirmedOffers = compOffers.filter((o) => o.status === 'Joining Confirmed').length;
    const offeredOffers = compOffers.filter((o) => o.status === 'Offered').length;
    const withdrawnOffers = compOffers.filter((o) => o.status === 'Withdrawn').length;

    // Exclude Withdrawn offers from package calculations
    const validPackages = compOffers
      .filter((o) => o.status !== 'Withdrawn')
      .map((o) => Number(o.packageLPA) || 0);

    let averagePackageLPA = 0;
    let highestPackageLPA = 0;

    if (validPackages.length > 0) {
      const sum = validPackages.reduce((acc, p) => acc + p, 0);
      averagePackageLPA = roundToOneDecimal(sum / validPackages.length);
      highestPackageLPA = roundToOneDecimal(Math.max(...validPackages));
    }

    result.push({
      company,
      totalOffers,
      acceptedOffers,
      joiningConfirmedOffers,
      offeredOffers,
      withdrawnOffers,
      averagePackageLPA,
      highestPackageLPA
    });
  }

  // Sort order:
  // 1. joiningConfirmedOffers descending
  // 2. acceptedOffers descending
  // 3. company name ascending (alphabetical tie-break)
  result.sort((a, b) => {
    if (b.joiningConfirmedOffers !== a.joiningConfirmedOffers) {
      return b.joiningConfirmedOffers - a.joiningConfirmedOffers;
    }
    if (b.acceptedOffers !== a.acceptedOffers) {
      return b.acceptedOffers - a.acceptedOffers;
    }
    return a.company.localeCompare(b.company);
  });

  return result;
};

/**
 * GET /api/analytics/insights
 * Factual descriptive summary insights
 */
export const getPlacementInsights = () => {
  const overview = getOverviewAnalytics();
  const branches = getBranchAnalytics();
  const companies = getCompanyAnalytics();

  // Find branch with highest placement rate (tie-breaker: highest placedStudents, then alphabetical)
  const sortedBranches = [...branches].sort((a, b) => {
    if (b.placementRate !== a.placementRate) {
      return b.placementRate - a.placementRate;
    }
    if (b.placedStudents !== a.placedStudents) {
      return b.placedStudents - a.placedStudents;
    }
    return a.branch.localeCompare(b.branch);
  });

  const topBranch = sortedBranches[0] || { branch: 'N/A', placementRate: 0 };

  // Find company with highest number of joining-confirmed offers (tie-breaker: alphabetical)
  const sortedCompanies = [...companies].sort((a, b) => {
    if (b.joiningConfirmedOffers !== a.joiningConfirmedOffers) {
      return b.joiningConfirmedOffers - a.joiningConfirmedOffers;
    }
    return a.company.localeCompare(b.company);
  });

  const topConfirmedCompany = sortedCompanies[0] || { company: 'N/A', joiningConfirmedOffers: 0 };

  const insights = [
    {
      type: 'conversion_rate',
      title: 'Institutional Placement Conversion',
      description: `${overview.placedStudents} of ${overview.totalStudents} eligible graduating candidates have secured accepted or confirmed corporate offers.`,
      value: `${overview.placementRate}%`
    },
    {
      type: 'compensation_peak',
      title: 'Maximum Compensation Level',
      description: 'Highest active compensation package issued across all ongoing corporate drives.',
      value: `${overview.highestPackageLPA} LPA`
    },
    {
      type: 'compensation_average',
      title: 'Average Compensation Level',
      description: 'Mean remuneration package across all non-withdrawn placement offers.',
      value: `${overview.averagePackageLPA} LPA`
    },
    {
      type: 'top_performing_branch',
      title: 'Leading Discipline by Placement Rate',
      description: `${topBranch.branch} registered the highest proportion of accepted/confirmed placements.`,
      value: `${topBranch.branch} (${topBranch.placementRate}%)`
    },
    {
      type: 'top_confirmed_employer',
      title: 'Highest Joining Confirmations',
      description: `${topConfirmedCompany.company} holds the largest count of finalized candidate joining commitments.`,
      value: `${topConfirmedCompany.company} (${topConfirmedCompany.joiningConfirmedOffers} confirmed)`
    },
    {
      type: 'pipeline_velocity',
      title: 'Active Recruitment Pipelines',
      description: 'Current placement recruitment drives open or actively executing evaluation rounds.',
      value: `${overview.activePlacementDrives} Active Drives`
    }
  ];

  return { insights };
};