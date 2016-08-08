import {IResource, Resource, IAdapter, IRecord, ISchema} from "@elium/mighty-js";
import {url} from "./server";
import {IDataLayer, RestAdapter} from '@elium/mighty-http-adapter';
import {HttpLayer} from '../../src/http.layer';

export const schema: ISchema = {
  identity: "heroes",
  properties: {
    id: { type: "number" },
    name: {type: "string"},
    powers: {
      type: "array",
      items: {type: "string"}
    }
  }
};

export interface IHeroRecord extends IRecord {
  powers: Array<string>
}

export const layer: IDataLayer = new HttpLayer();
export const adapter: IAdapter = new RestAdapter(url, layer);
export const resource: IResource<IHeroRecord> = new Resource <IHeroRecord>(schema, adapter);
