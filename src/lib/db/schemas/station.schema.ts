import { defineSchema, field } from 'omni-svelte/schema';

export default defineSchema('stations', {
  id: field.serial().primaryKey(),
  name: field.string(255).required(),
  brand: field.string(255).optional(), // e.g. "NNPC", "Mobil", "Total", "Independent"
  address: field.string().required(),
  lat: field.float().required(),
  lng: field.float().required(),
}, {
  timestamps: true, // auto-adds created_at and updated_at
});
