import { configureDatabase, database as db } from 'omni-svelte/database';
import { stations, priceReports } from './server/schema';

// Seed data for 25 stations in Benin City, Edo State
const beninStations = [
  { name: 'NNPC Mega Station', brand: 'NNPC', address: 'Sapele Road, Benin City', lat: '6.3150', lng: '5.6200' },
  { name: 'Mobil Filling Station', brand: 'Mobil', address: 'Akpakpava Road, Benin City', lat: '6.3390', lng: '5.6300' },
  { name: 'TotalEnergies', brand: 'Total', address: 'Ring Road (King Square), Benin City', lat: '6.3330', lng: '5.6250' },
  { name: 'Conoil', brand: 'Conoil', address: 'Ugbowo Lagos Road, Benin City', lat: '6.3950', lng: '5.6020' },
  { name: 'Oando', brand: 'Oando', address: 'Mission Road, Benin City', lat: '6.3400', lng: '5.6280' },
  { name: 'Forte Oil', brand: 'Forte', address: 'Airport Road, Benin City', lat: '6.3100', lng: '5.6150' },
  { name: 'Bovas', brand: 'Bovas', address: 'Ekenwan Road, Benin City', lat: '6.3250', lng: '5.6100' },
  { name: 'Rainoil', brand: 'Rainoil', address: 'Ikpoba Hill, Benin City', lat: '6.3550', lng: '5.6450' },
  { name: 'Enyo Retail', brand: 'Enyo', address: 'Dawson Road, Benin City', lat: '6.3450', lng: '5.6320' },
  { name: 'NIPCO', brand: 'NIPCO', address: 'Uselu Lagos Road, Benin City', lat: '6.3750', lng: '5.6100' },
  { name: 'MRS Oil', brand: 'MRS', address: 'Siluko Road, Benin City', lat: '6.3500', lng: '5.6150' },
  { name: 'Northwest Petroleum', brand: 'Northwest', address: 'Sapele Road Bye-Pass, Benin', lat: '6.2900', lng: '5.6350' },
  { name: 'A.A Rano', brand: 'Independent', address: 'Oluku Junction, Benin City', lat: '6.4100', lng: '5.5900' },
  { name: 'Oando Ugbowo', brand: 'Oando', address: 'Opposite UNIBEN, Ugbowo', lat: '6.4020', lng: '5.6000' },
  { name: 'TotalEnergies Akpakpava', brand: 'Total', address: 'Akpakpava Rd by First East Circular', lat: '6.3420', lng: '5.6350' },
  { name: 'Conoil Airport Rd', brand: 'Conoil', address: 'Airport Road by Golf Course', lat: '6.3180', lng: '5.6180' },
  { name: 'Matrix Energy', brand: 'Matrix', address: 'Sapele Road, Oka', lat: '6.3050', lng: '5.6280' },
  { name: 'Optima Energy', brand: 'Independent', address: 'Textile Mill Road, Benin', lat: '6.3600', lng: '5.6200' },
  { name: 'Heyden Petroleum', brand: 'Heyden', address: 'Aduwawa, Benin-Auchi Road', lat: '6.3650', lng: '5.6550' },
  { name: 'Ascon Oil', brand: 'Ascon', address: 'New Lagos Road, Benin City', lat: '6.3680', lng: '5.6180' },
  { name: 'Fatgbems', brand: 'Fatgbems', address: 'Ekenwan Road by Ugbiyoko', lat: '6.3150', lng: '5.5950' },
  { name: 'Pinnacle Oil', brand: 'Pinnacle', address: 'Agbor Road, Ikpoba Hill', lat: '6.3520', lng: '5.6500' },
  { name: 'Capital Oil', brand: 'Capital', address: 'Upper Sakponba Road', lat: '6.3200', lng: '5.6450' },
  { name: 'Eterna Oil', brand: 'Eterna', address: 'Sapele Road by Limit Road', lat: '6.3000', lng: '5.6300' },
  { name: 'NNPC Retail', brand: 'NNPC', address: 'By-Pass, Oluku', lat: '6.4150', lng: '5.5950' },
];

export async function seed() {
  console.log('🌱 Seeding database...');

  // Ensure DB is configured when running via TSX
  if (!db) {
    configureDatabase({
      connection: { url: process.env.DATABASE_URL }
    });
  }

  try {
    // 1. Seed stations using raw Drizzle to bypass the ActiveRecord hooks bug
    const createdStations = [];
    for (const data of beninStations) {
      const result = await db.insert(stations).values(data).returning();
      createdStations.push(result[0]);
    }
    console.log(`✅ Seeded ${createdStations.length} stations in Benin City.`);

    // Test user ID for the price reports
    const testUserId = 'test-user-id-123'; 
    
    // 2. Seed price reports for testing freshness logic
    const now = new Date();
    
    // Station 1: Recent consensus (within 3 hours)
    await db.insert(priceReports).values([
      {
        stationId: createdStations[0].id,
        userId: testUserId,
        fuelType: 'pms',
        pricePerLiter: 650,
        hasFuel: true,
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000)
      },
      {
        stationId: createdStations[0].id,
        userId: testUserId,
        fuelType: 'pms',
        pricePerLiter: 645,
        hasFuel: true,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
      },
      // Station 2: Outdated report (>24 hours)
      {
        stationId: createdStations[1].id,
        userId: testUserId,
        fuelType: 'pms',
        pricePerLiter: 580,
        hasFuel: true,
        createdAt: new Date(now.getTime() - 26 * 60 * 60 * 1000)
      },
      // Station 3: "No Fuel" report (within 6 hours)
      {
        stationId: createdStations[2].id,
        userId: testUserId,
        fuelType: 'pms',
        pricePerLiter: 650,
        hasFuel: false,
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000)
      }
    ]);

    console.log('✅ Seeded price reports.');
    console.log('🎉 Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

// Execute the seed function when the script is run directly
seed().catch(console.error);
