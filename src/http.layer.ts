import * as Request from "request";
import {Options} from "request";
import {IncomingMessage} from "http";
import {IDataLayer, IHttpRequest, IHttpResponse, HttpResponse, HttpRequest} from '@elium/mighty-http-adapter';

export interface IHttpLayer extends IDataLayer {
  query(request: IHttpRequest): Promise<IHttpResponse>;
}

export class HttpLayer implements IHttpLayer {

  find(request: IHttpRequest): Promise<IHttpResponse> {
    const localRequest: IHttpRequest = new HttpRequest(request).merge(<IHttpRequest> {method: "GET", isArray: true});
    return this.query(localRequest);
  }


  findOne(request: IHttpRequest): Promise<IHttpResponse> {
    const localRequest: IHttpRequest = new HttpRequest(request).merge(<IHttpRequest> {method: "GET"});
    return this.query(localRequest);
  }


  create(request: IHttpRequest): Promise<IHttpResponse> {
    const localRequest: IHttpRequest = new HttpRequest(request).merge(<IHttpRequest> {method: "POST"});
    return this.query(localRequest);
  }


  save(request: IHttpRequest): Promise<IHttpResponse> {
    const localRequest: IHttpRequest = new HttpRequest(request).merge(<IHttpRequest> {method: "PUT"});
    return this.query(localRequest);
  }


  destroy(request: IHttpRequest): Promise<IHttpResponse> {
    const localRequest: IHttpRequest = new HttpRequest(request).merge(<IHttpRequest> {method: "DELETE"});
    return this.query(localRequest);
  }

  query(request: IHttpRequest): Promise<IHttpResponse> {
    const options = this._getOptions(request);
    return this._request(request, options);
  }

  private _request(request: IHttpRequest, options: Options): Promise<IHttpResponse> {
    return new Promise((resolve, reject) => {
      Request(options, (error: any, response: IncomingMessage, body: any) => {
        const httpResponse = new HttpResponse(<IHttpResponse> {request: request, status: response.statusCode});
        if (!error && response.statusCode == 200) {
          if (request.isArray && !Array.isArray(body)) {
            httpResponse.error = new Error("result is not an array, got :" + JSON.stringify(body));
          } else {
            httpResponse.data = body;
          }
        } else {
          httpResponse.error = this._parseError(error, body);
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
  
  private _parseError(error: any, body: any) {
    const validError = error || body;
    if(validError) {
      if(_.isString(validError)) {
        return new Error(validError);
      } else if(_.isObject(validError) && validError.hasOwnProperty("message")) {
        return new Error(validError.message)
      }
    }
    return new Error("Unknown error : " + validError);
  }
}
