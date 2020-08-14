// import crypto from 'crypto'
import OAuth from './oauth.ts'
import axiod from "https://deno.land/x/axiod/mod.ts";
import { hmac } from 'https://deno.land/x/hmac@v1.0.2/mod.ts';
import { IAxiodResponse } from "https://deno.land/x/axiod@0.20.0-0/interfaces.ts";
const baseURL = 'https://api.twitter.com/'

export interface TwitterCredentials {
  consumerKey: string;
  consumerSecret: string;
  accessToken?: string;
  accessTokenSecret?: string;
}

export class TwitterClient {

  constructor (creds: TwitterCredentials) {

    const oauth = new OAuth({
      consumer: {
        key: creds.consumerKey,
        secret: creds.consumerSecret
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
          return hmac("sha1", key, base_string, "utf8", "base64").toString();
      }
    });
const url = '/access_token'
    const asd = oauth.toHeader(oauth.authorize({
            url: `${baseURL}${url}`,
            method: 'GET',
            data: null,
            includeBodyHash: true
          }, {
            key: creds.accessToken || '',
            secret: creds.accessTokenSecret || ''
          }));
          
    console.log(asd)
    // axiod.request.use(config => {
    //   config.headers = oauth.toHeader(oauth.authorize({
    //     url: `${config.baseURL}${config.url}`,
    //     method: config.method || 'GET',
    //     data: config.data,
    //     includeBodyHash: true
    //   }, {
    //     key: creds.accessToken || '',
    //     secret: creds.accessTokenSecret || ''
    //   }))
    //   return config
    // })

  }

  get(api: string): Promise<IAxiodResponse> { 
    return axiod.get(api)
  }
  
  post(api: string, data = {}): Promise<IAxiodResponse> {
    return axiod.post(api, data)
  }

  put(api: string, data = {}): Promise<IAxiodResponse> {
    return axiod.put(api, data)
  }

  delete(api: string): Promise<IAxiodResponse> {
    return axiod.delete(api)
  }

}


export default TwitterClient;