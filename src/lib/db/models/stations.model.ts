import { Model } from 'omni-svelte/model';
import { stations } from '../server/schema';
import { stationsCreateSchema, stationsUpdateSchema } from '../validation/stations.validation';
import type { Stations as StationsType, NewStations as NewStationsType } from '../server/schema';

export class StationsModel extends Model {
  static tableName = 'stations';
  static table = stations;
  static validation = {
     create: stationsCreateSchema,
     update: stationsUpdateSchema,
     base: stationsCreateSchema,
  };
  
  static fillable = ['name', 'brand', 'address', 'lat', 'lng'];
  static hidden = [];
  static casts = {  };
  
}




export class Stations extends StationsModel {
  // Additional model methods and overrides can be added here
}

export default Stations;