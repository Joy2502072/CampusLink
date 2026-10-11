import { offers as demoOffers } from '../data/offerData.js';
import { upsertOfferWithDocuments } from '../repositories/offer.repository.js';
import { pool, checkDatabaseConnection } from '../config/database.js';

async function seedOffers() {
  console.log('--- Seeding Offers & Documents from synthetic dataset into MySQL ---');

  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    console.error('[ERROR] Cannot seed: MySQL database connection failed.');
    process.exit(1);
  }

  if (!Array.isArray(demoOffers) || demoOffers.length === 0) {
    console.log('[WARN] No offers found in offerData.js to seed.');
    await pool.end();
    process.exit(0);
  }

  let seededOffersCount = 0;
  let totalDocsCount = 0;

  for (const offer of demoOffers) {
    try {
      await upsertOfferWithDocuments(offer);
      seededOffersCount += 1;
      const docsLen = Array.isArray(offer.documents) ? offer.documents.length : 0;
      totalDocsCount += docsLen;
      console.log(`[SEED] Upserted offer: ${offer.id} (${offer.studentName} @ ${offer.company}) [${docsLen} docs]`);
    } catch (err) {
      console.error(`[ERROR] Failed to seed offer ${offer.id}:`, err.message);
    }
  }

  console.log(`[COMPLETE] Successfully verified/seeded ${seededOffersCount} offers with ${totalDocsCount} documents.`);
  await pool.end();
  process.exit(0);
}

seedOffers();