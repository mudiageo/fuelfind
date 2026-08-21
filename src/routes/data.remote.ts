import { resource } from 'omni-svelte/remote';
import { Stations } from '$models/stations.model';
import { PriceReports } from '$models/priceReports.model';

export const {
  list: stations,
  get: station
} = resource(Stations, {
  with: ['reports'],
  pagination: { perPage: 100 },
  listQuery: (q, input) => {
    return q;
  }
});

export const {
  create: createPriceReport
} = resource(PriceReports, {
  mutationMode: 'command',
  fillable: {
    create: ['stationId', 'userId', 'fuelType', 'pricePerLiter', 'hasFuel']
  },
  authorize: ({ user, operation }) => {
    // For MVP, user must be logged in to create a report
    if (operation === 'create') return Boolean(user);
    return true;
  }
});
