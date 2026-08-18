import { defineSchema, field } from 'omni-svelte/schema';

export default defineSchema('price_reports', {
  id: field.serial().primaryKey(),
  stationId: field.integer().required(), // References stations.id
  userId: field.string(255).required(),  // References auth user.id
  fuelType: field.enum('pms', 'diesel', 'kerosene').required(),
  pricePerLiter: field.integer().required(), // store in naira, no decimals needed
  hasFuel: field.boolean().default(true), // false = "no fuel" report
}, {
  timestamps: true, // we will use created_at as reported_at
  indexes: ['stationId', 'created_at']
});
