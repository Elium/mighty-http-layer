import {IJsonSchema, IResource, Resource, IAdapter, IRecord} from "@elium/mighty-js";
import {url} from "./server";
import {IDataLayer, RestAdapter} from '@elium/mighty-http-adapter';
import {HttpLayer} from '../../src/http.layer';

export const schema: IJsonSchema = {
  id: "heroes",
  description: "Heroes schema",
  properties: {
    id: {
      type: "number",
      minimum: 1
    },
    name: {type: "string"},
    powers: {
      type: "array",
      items: {type: "string"},
      minItems: 1,
      uniqueItems: true
    }
  }
};

export interface IHeroRecord extends IRecord {
  powers: Array<string>
}

export const layer: IDataLayer = new HttpLayer();
export const adapter: IAdapter = new RestAdapter(url, layer);
export const resource: IResource<IHeroRecord> = new Resource <IHeroRecord>(schema, adapter);
