import { z } from 'omni-svelte/validation';

export const price_reportsCreateSchema = z.object({
  stationId: z.number().int(),
  userId: z.string().max(255),
  fuelType: z.string(),
  pricePerLiter: z.number().int(),
  hasFuel: z.boolean().optional()
});

export type Price_reportsCreate = z.infer<typeof price_reportsCreateSchema>;

export const price_reportsUpdateSchema = z.object({
  stationId: z.number().int().optional(),
  userId: z.string().max(255).optional(),
  fuelType: z.string().optional(),
  pricePerLiter: z.number().int().optional(),
  hasFuel: z.boolean().optional()
});

export type Price_reportsUpdate = z.infer<typeof price_reportsUpdateSchema>;