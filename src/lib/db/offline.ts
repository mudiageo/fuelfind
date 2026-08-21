import Dexie, { type Table } from 'dexie';
import { createPriceReport } from '../../routes/data.remote';

export interface QueuedReport {
  id?: number;
  stationId: number;
  userId: string;
  fuelType: string;
  pricePerLiter: number;
  hasFuel: boolean;
  timestamp: number;
}

export class FuelFindOfflineDB extends Dexie {
  reportsQueue!: Table<QueuedReport, number>;

  constructor() {
    super('FuelFindOfflineDB');
    this.version(1).stores({
      reportsQueue: '++id, stationId, timestamp'
    });
  }
}

export const db = typeof window !== 'undefined' ? new FuelFindOfflineDB() : null;

export async function queueReport(report: Omit<QueuedReport, 'id' | 'timestamp'>) {
  if (!db) return;
  await db.reportsQueue.add({
    ...report,
    timestamp: Date.now()
  });
  
  if (navigator.onLine) {
    syncReports();
  }
}

export async function syncReports() {
  if (!db || !navigator.onLine) return;
  
  const pending = await db.reportsQueue.toArray();
  if (pending.length === 0) return;
  
  for (const report of pending) {
    try {
      // Use the OmniSvelte generated remote command to submit the report
      await createPriceReport({
        stationId: report.stationId,
        userId: report.userId,
        fuelType: report.fuelType,
        pricePerLiter: report.pricePerLiter,
        hasFuel: report.hasFuel
      });
      
      await db.reportsQueue.delete(report.id!);
    } catch (e) {
      console.warn('Sync failed for report', report.id, e);
      // Stop syncing if network drops again or if there's a validation error
      break;
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online, syncing queued reports...');
    syncReports();
  });
}
