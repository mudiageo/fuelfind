import { defineSchema } from 'omni-svelte/schema';

export const station = defineSchema('stations', {
  id: { type: 'serial', primary: true },
  name: { type: 'string', length: 255, required: true },
  brand: { type: 'string', length: 255 },
  address: { type: 'string', required: true },
  lat: { type: 'string', required: true },
  lng: { type: 'string', required: true }
}, {
  timestamps: true,
  relationships: {
    reports: { type: 'hasMany', model: 'priceReports', foreignKey: 'stationId' }
  }
});

export const priceReport = defineSchema('priceReports', {
  id: { type: 'serial', primary: true },
  stationId: { type: 'integer', required: true }, 
  userId: { type: 'string', length: 255, required: true },  
  fuelType: { type: 'string', required: true },
  pricePerLiter: { type: 'integer', required: true }, 
  hasFuel: { type: 'boolean', default: 'true' }
}, {
  timestamps: true,
  relationships: {
    station: { type: 'belongsTo', model: 'stations', foreignKey: 'stationId' }
  }
});
