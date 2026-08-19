import { z } from 'omni-svelte/validation';

export const priceReportsCreateSchema = z.object({
  stationId: z.number().int(),
  userId: z.string().max(255),
  fuelType: z.string(),
  pricePerLiter: z.number().int(),
  hasFuel: z.boolean().optional()
});

export type PriceReportsCreate = z.infer<typeof priceReportsCreateSchema>;

export const priceReportsUpdateSchema = z.object({
  stationId: z.number().int().optional(),
  userId: z.string().max(255).optional(),
  fuelType: z.string().optional(),
  pricePerLiter: z.number().int().optional(),
  hasFuel: z.boolean().optional()
});

export type PriceReportsUpdate = z.infer<typeof priceReportsUpdateSchema>;