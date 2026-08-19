export interface PriceReport {
  id: number;
  stationId: number;
  userId: string;
  fuelType: string;
  pricePerLiter: number;
  hasFuel: boolean;
  createdAt: Date;
}

export type FreshnessState = 
  | 'no-reports'
  | 'out-of-fuel'
  | 'recent-consensus'
  | 'recent'
  | 'outdated';

export interface ProcessedStation {
  id: number;
  name: string;
  brand: string | null;
  address: string;
  lat: string;
  lng: string;
  distanceKm?: number;
  
  // Freshness results
  state: FreshnessState;
  displayPrice: number | null;
  statusText: string;
}

export function processStationFreshness(station: any, reports: PriceReport[]): ProcessedStation {
  const now = new Date();
  
  if (!reports || reports.length === 0) {
    return {
      ...station,
      state: 'no-reports',
      displayPrice: null,
      statusText: 'No reports yet — be the first'
    };
  }

  // Sort reports newest first
  const sortedReports = [...reports].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const mostRecent = sortedReports[0];

  // 4. Check for "no fuel" within last 6 hours
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const recentReports = sortedReports.filter(r => r.createdAt >= sixHoursAgo);
  
  let outOfFuel = false;
  for (const report of recentReports) {
    if (!report.hasFuel) {
      outOfFuel = true;
      break; // Found a no fuel report
    } else {
      break; // Found a has fuel report first (since it's sorted newest first), so it's not out of fuel
    }
  }

  if (outOfFuel) {
    return {
      ...station,
      state: 'out-of-fuel',
      displayPrice: mostRecent.pricePerLiter,
      statusText: 'Reportedly out of fuel'
    };
  }

  // 3. Older than 24 hours
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (mostRecent.createdAt < twentyFourHoursAgo) {
    const hoursAgo = Math.floor((now.getTime() - mostRecent.createdAt.getTime()) / (1000 * 60 * 60));
    const timeText = hoursAgo >= 24 ? `${Math.floor(hoursAgo / 24)} days ago` : `${hoursAgo} hours ago`;
    return {
      ...station,
      state: 'outdated',
      displayPrice: mostRecent.pricePerLiter,
      statusText: `Last reported ${timeText} — may be outdated`
    };
  }

  // 2. Recent consensus (2+ reports within last 3 hours)
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const consensusReports = sortedReports.filter(r => r.createdAt >= threeHoursAgo && r.hasFuel);
  
  if (consensusReports.length >= 2) {
    const prices = consensusReports.map(r => r.pricePerLiter).sort((a, b) => a - b);
    const mid = Math.floor(prices.length / 2);
    const medianPrice = prices.length % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2;
    
    return {
      ...station,
      state: 'recent-consensus',
      displayPrice: medianPrice,
      statusText: 'Recent consensus'
    };
  }

  // 1. Recent (within 24 hours, but no consensus)
  const hoursAgo = Math.max(1, Math.floor((now.getTime() - mostRecent.createdAt.getTime()) / (1000 * 60 * 60)));
  return {
    ...station,
    state: 'recent',
    displayPrice: mostRecent.pricePerLiter,
    statusText: `Reported ${hoursAgo}h ago`
  };
}
