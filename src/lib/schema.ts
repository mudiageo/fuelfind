import { defineSchema, field } from 'omni-svelte/schema';

export const station = defineSchema('stations', {
  id: field.serial().primaryKey(),
  name: field.string(255).required(),
  brand: field.string(255).optional(),
  address: field.string().required(),
  lat: field.string().required(),
  lng: field.string().required(),
}, {
  timestamps: true,
});

export const priceReport = defineSchema('price_reports', {
  id: field.serial().primaryKey(),
  stationId: field.integer().required(), 
  userId: field.string(255).required(),  
  fuelType: field.enum('pms', 'diesel', 'kerosene').required(),
  pricePerLiter: field.integer().required(), 
  hasFuel: field.boolean().default(true), 
}, {
  timestamps: true,
  indexes: ['stationId', 'created_at']
});
