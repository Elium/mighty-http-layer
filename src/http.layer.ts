import * as _ from "lodash";
import * as Request from "request";
import {Options} from "request";
import {IncomingMessage} from "http";
import {Observer, Observable} from "rxjs/Rx";
import {IDataLayer, IHttpRequest, IHttpResponse, HttpResponse} from '@elium/mighty-http-adapter';

export interface IHttpLayer extends IDataLayer {}

export class HttpLayer implements IHttpLayer {

  public find(request: IHttpRequest): Observable<IHttpResponse> {
    const localRequest: IHttpRequest = request.merge(<IHttpRequest> {method: "GET", isArray: true});
    return this._query(localRequest);
  }


  public findOne(request: IHttpRequest): Observable<IHttpResponse> {
    const localRequest: IHttpRequest = request.merge(<IHttpRequest> {method: "GET"});
    return this._query(localRequest);
  }


  public create(request: IHttpRequest): Observable<IHttpResponse> {
    const localRequest: IHttpRequest = request.merge(<IHttpRequest> {method: "POST"});
    return this._query(localRequest);
  }


  public save(request: IHttpRequest): Observable<IHttpResponse> {
    const localRequest: IHttpRequest = request.merge(<IHttpRequest> {method: "PUT"});
    return this._query(localRequest);
  }


  public destroy(request: IHttpRequest): Observable<IHttpResponse> {
    const localRequest: IHttpRequest = request.merge(<IHttpRequest> {method: "DELETE"});
    return this._query(localRequest);
  }

  protected _query(request: IHttpRequest): Observable<IHttpResponse> {
    const options = this._getOptions(request);
    return this._request(request, options);
  }

  private _request(request: IHttpRequest, options: Options): Observable<IHttpResponse> {
    return Observable.create((observer: Observer<IHttpResponse>) => {
      Request(options, (error: any, response: IncomingMessage, body: any) => {
        const httpResponse = new HttpResponse();
        if (!error) {
          if (response.statusCode == 200) {
            if (request.isArray && !Array.isArray(body)) {
              httpResponse.error = new Error("result is not an array, got :" + JSON.stringify(body));
            } else {
              httpResponse.data = body;
            }
          } else {
            httpResponse.error = new Error(error.message);
          }
        } else {
          httpResponse.error = new Error(error.message);
        }

        if (httpResponse.error) {
          observer.error(httpResponse);
        } else {
          observer.next(httpResponse);
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
