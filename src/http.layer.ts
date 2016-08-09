import * as Request from "request";
import {Options} from "request";
import {IncomingMessage} from "http";
import {IDataLayer, IHttpRequest, IHttpResponse, HttpResponse, HttpRequest} from '@elium/mighty-http-adapter';

export interface IHttpLayer extends IDataLayer {}

export class HttpLayer implements IHttpLayer {

  public find(request: IHttpRequest): Promise<IHttpResponse> {
    const localRequest: IHttpRequest = new HttpRequest(request).merge(<IHttpRequest> {method: "GET", isArray: true});
    return this._query(localRequest);
  }


  public findOne(request: IHttpRequest): Promise<IHttpResponse> {
    const localRequest: IHttpRequest = new HttpRequest(request).merge(<IHttpRequest> {method: "GET"});
    return this._query(localRequest);
  }


  public create(request: IHttpRequest): Promise<IHttpResponse> {
    const localRequest: IHttpRequest = new HttpRequest(request).merge(<IHttpRequest> {method: "POST"});
    return this._query(localRequest);
  }


  public save(request: IHttpRequest): Promise<IHttpResponse> {
    const localRequest: IHttpRequest = new HttpRequest(request).merge(<IHttpRequest> {method: "PUT"});
    return this._query(localRequest);
  }


  public destroy(request: IHttpRequest): Promise<IHttpResponse> {
    const localRequest: IHttpRequest = new HttpRequest(request).merge(<IHttpRequest> {method: "DELETE"});
    return this._query(localRequest);
  }

  protected _query(request: IHttpRequest): Promise<IHttpResponse> {
    const options = this._getOptions(request);
    return this._request(request, options);
  }

  private _request(request: IHttpRequest, options: Options): Promise<IHttpResponse> {
    return new Promise((resolve, reject) => {
      Request(options, (error: any, response: IncomingMessage, body: any) => {
        const httpResponse = new HttpResponse();
        if (!error && response.statusCode == 200) {
          if (request.isArray && !Array.isArray(body)) {
            httpResponse.error = new Error("result is not an array, got :" + JSON.stringify(body));
          } else {
            httpResponse.data = body;
          }
        } else {
          httpResponse.error = new Error(error || body);
        }

        if (httpResponse.error) {
          reject(httpResponse);
        } else {
          resolve(httpResponse);
        }
      });
    });
  }

  private _getOptions(request: IHttpRequest): Options {
    return {
      json: true,
      url: request.url,
      method: (request.method || "").toUpperCase(),
      headers: request.headers,
      body: request.data,
      qs: request.params
    }
  }
}
