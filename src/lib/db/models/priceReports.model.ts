import { Model } from 'omni-svelte/model';
import { priceReports } from '../server/schema';
import { priceReportsCreateSchema, priceReportsUpdateSchema } from '../validation/priceReports.validation';
import type { PriceReports as PriceReportsType, NewPriceReports as NewPriceReportsType } from '../server/schema';

export class PriceReportsModel extends Model {
  static tableName = 'priceReports';
  static table = priceReports;
  static validation = {
     create: priceReportsCreateSchema,
     update: priceReportsUpdateSchema,
     base: priceReportsCreateSchema,
  };
  
  static fillable = ['stationId', 'userId', 'fuelType', 'pricePerLiter', 'hasFuel'];
  static hidden = [];
  static casts = { hasFuel: 'boolean' as const };
  
}




export class PriceReports extends PriceReportsModel {
  // Additional model methods and overrides can be added here
}

export default PriceReports;