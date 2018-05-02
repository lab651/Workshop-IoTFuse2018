import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*

*/
@Injectable()
export class ApiProvider {
  // to run locally > ionic serve 
  // look for your external ip address
  // [OK] Development server running!
  // Local: http://localhost:8100
  // External: http://192.168.86.33:8100
  // replace url below with external url +/demo
  // open ionic.config.json and put in your api endpoint and path for proxy
  url: string = 'https://p7uk7d6b6k.execute-api.us-east-1.amazonaws.com/demo';

  constructor(public http: HttpClient) {
    console.log('Hello ApiProvider Provider');
  }

  shipIt(data: {}[], guid: string, classifier: string) {
    const params = new HttpParams({
      fromObject: {
        device: guid,
        class: classifier
      }
    });
    return this.http.post(this.url, data, { responseType: 'text', params: params });
  }

  streamIt(data: {}[], guid: string) {
    const params = new HttpParams({
      fromObject: {
        device: guid,
      }
    });
    return this.http.post(`${this.url}/stream`, data, { responseType: 'text', params: params });
  }



}
