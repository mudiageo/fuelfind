import { query } from 'omni-svelte/server';
import { Stations } from '$models/stations.model';
import { PriceReports } from '$models/priceReports.model';
import { db } from '$db';
import { desc, eq } from 'drizzle-orm';
import { priceReports, stations } from '$schema';

export const getStations = query(async () => {
  // We fetch all stations and their reports, then process freshness logic
  // For MVP, we can fetch all stations (only 25-30) and their recent reports
  
  const allStations = await Stations.all();
  
  // Fetch all reports to aggregate them (in a real app, we'd limit this or group by in SQL)
  const allReports = await db.select().from(priceReports).orderBy(desc(priceReports.createdAt));
  
  return allStations.map(station => {
    const stationReports = allReports.filter(r => r.stationId === station.id && r.fuelType === 'pms');
    return {
      ...station,
      reports: stationReports
    };
  });
});
