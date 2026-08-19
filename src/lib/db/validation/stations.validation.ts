import { z } from 'omni-svelte/validation';

export const stationsCreateSchema = z.object({
  name: z.string().max(255),
  brand: z.string().max(255),
  address: z.string(),
  lat: z.string(),
  lng: z.string()
});

export type StationsCreate = z.infer<typeof stationsCreateSchema>;

export const stationsUpdateSchema = z.object({
  name: z.string().max(255).optional(),
  brand: z.string().max(255).optional(),
  address: z.string().optional(),
  lat: z.string().optional(),
  lng: z.string().optional()
});

export type StationsUpdate = z.infer<typeof stationsUpdateSchema>;