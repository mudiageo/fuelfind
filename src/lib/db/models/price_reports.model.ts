import { Model } from 'omni-svelte/model';
import { price_reports } from '../server/schema';
import { price_reportsCreateSchema, price_reportsUpdateSchema } from '../validation/price_reports.validation';
import type { Price_reports as Price_reportsType, NewPrice_reports as NewPrice_reportsType } from '../server/schema';

export class Price_reportsModel extends Model {
  static tableName = 'price_reports';
  static table = price_reports;
  static validation = {
     create: price_reportsCreateSchema,
     update: price_reportsUpdateSchema,
     base: price_reportsCreateSchema,
  };
  
  static fillable = ['stationId', 'userId', 'fuelType', 'pricePerLiter', 'hasFuel'];
  static hidden = [];
  static casts = { hasFuel: 'boolean' as const };
  
}




export class Price_reports extends Price_reportsModel {
  // Additional model methods and overrides can be added here
}

export default Price_reports;