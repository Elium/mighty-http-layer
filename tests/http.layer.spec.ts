import * as _ from "lodash";
import * as chai from "chai";
import {server} from "./mock/server";
import {adapter, resource} from "./mock/resource";
import {deadpool} from "./mock/data";
import {IHttpRequest, HttpRequest, IHttpResponse} from '@elium/mighty-http-adapter';

const expect = chai.expect;
const deadpoolCreateRequest: IHttpRequest = new HttpRequest({data: deadpool});

let deadpoolResponse: IHttpResponse;

describe("Http layer", () => {

  before((done) => {
    server.start((error) => {
      if (error) {
        throw error;
      }
      //console.log('Server started at: ' + server.info.uri);
      done();
    });
  });

  after((done) => {
    server.stop({timeout: 0}, () => {
      //console.log("Server stopped");
      done();
    });
  });

  beforeEach((done) => {
    adapter.create(resource, deadpoolCreateRequest)
      .then((response: IHttpResponse) => {
        deadpoolResponse = response;
        done();
      });
  });

  it(`should create a record`, () => {
    checkHero(deadpool, deadpoolResponse.data);
  });

  it(`should find a record when id is within the criteria`, (done) => {
    adapter.findOne(resource, new HttpRequest({criteria: {id: deadpoolResponse.data["id"]}}))
      .then((response: IHttpResponse) => {
        checkHero(deadpool, response.data);
        done();
      });
  });

  it(`should find a record when id is within the data`, (done) => {
    adapter.findOne(resource, new HttpRequest({data: deadpoolResponse.data}))
      .then((response: IHttpResponse) => {
        checkHero(deadpool, response.data);
        done();
      });
  });

  it(`should get all records`, (done) => {
    adapter.find(resource, new HttpRequest({}))
      .then((response: IHttpResponse) => {
        expect(_.isArray(response.data)).to.be.true;
        done();
      });
  });

  it(`should save a record when id is within the criteria`, (done) => {
    const request = new HttpRequest({
      criteria: {id: deadpoolResponse.data["id"]},
      data: _.omit(_.extend(deadpoolResponse.data, {name: "lifepool"}), ["id"])
    });
    adapter.save(resource, request)
      .then((response: IHttpResponse) => {
        const hero = response.data;
        expect(hero).not.to.be.undefined;
        expect(hero).to.have.property("name").that.equals("lifepool");
        done();
      });
  });

  it(`should save a record when id is within the data`, (done) => {
    const request = new HttpRequest({data: _.extend(deadpoolResponse.data, {name: "lifepool"})});
    adapter.save(resource, request)
      .then((response: IHttpResponse) => {
        const hero = response.data;
        expect(hero).not.to.be.undefined;
        expect(hero).to.have.property("name").that.equals("lifepool");
        done();
      });
  });

  it(`should delete a record when id is within the criteria`, (done) => {
    adapter.destroy(resource, new HttpRequest({criteria: {id: deadpoolResponse.data["id"]}}))
      .then((response: IHttpResponse) => adapter.findOne(resource, new HttpRequest({criteria: {id: response.data["id"]}})))
      .then((response: IHttpResponse) => {
        expect(response.data).to.be.undefined;
        done();
      });
  });

  it(`should delete a record when id is within the data`, (done) => {
    adapter.destroy(resource, new HttpRequest({data: deadpoolResponse.data}))
      .then((response: IHttpResponse) => adapter.findOne(resource, new HttpRequest({data: response.data})))
      .then((response: IHttpResponse) => {
        expect(response.data).to.be.undefined;
        done();
      });
  });
});

function checkHero(originalHero, newHero) {
  expect(newHero).not.to.be.undefined;
  expect(newHero).to.have.property("id").that.is.not.undefined;
  expect(newHero).to.have.property("name").that.deep.equal(originalHero.name);
  expect(newHero).to.have.property("colors").that.deep.equal(originalHero.colors);
  expect(newHero).to.have.property("powers").that.deep.equal(originalHero.powers);
}
