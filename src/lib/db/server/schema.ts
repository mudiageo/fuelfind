// Auto-generated Drizzle schemas

import { serial, text, varchar, timestamp, pgTable, integer, boolean } from 'drizzle-orm/pg-core';

export const stations = pgTable('stations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  brand: varchar('brand', { length: 255 }),
  address: text('address').notNull(),
  lat: text('lat').notNull(),
  lng: text('lng').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const price_reports = pgTable('price_reports', {
  id: serial('id').primaryKey(),
  stationId: integer('stationId').notNull(),
  userId: varchar('userId', { length: 255 }).notNull(),
  fuelType: text('fuelType').notNull(),
  pricePerLiter: integer('pricePerLiter').notNull(),
  hasFuel: boolean('hasFuel').default('true'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});



export type Stations = typeof stations.$inferSelect;
export type NewStations = typeof stations.$inferInsert;

export type Price_reports = typeof price_reports.$inferSelect;
export type NewPrice_reports = typeof price_reports.$inferInsert;