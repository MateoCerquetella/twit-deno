import { OAuthOptions, OAuthConsumer, OAuthHashFunction, BodyHashFunction, OAuthRequestOptions, OAuthAuthorization, OAuthToken, OAuthData, OAuthHeader, OAuthParam } from './models.ts';

export class OAuth {
  protected consumer: OAuthConsumer;
  protected nonce_length: number;
  protected version: string;
  protected parameter_seperator: string;
  protected realm?: string;
  protected last_ampersand: boolean;
  protected signature_method: string;
  protected hash_function: OAuthHashFunction;
  protected body_hash_function: BodyHashFunction;

  constructor(options: OAuthOptions) {
    this.consumer = options.consumer;
    this.nonce_length = options.nonce_length ?? 32;
    this.version = options.version ?? '1.0';
    this.parameter_seperator = options.parameter_seperator ?? ', ';
    this.realm = options.realm;
    this.last_ampersand = options.last_ampersand ?? true;
    this.signature_method = options.signature_method ?? 'PLAINTEXT';

    if (this.signature_method === 'PLAINTEXT' && !options.hash_function) {
      options.hash_function = (_, key) => key;
    }

    if (!options.hash_function)
      throw new Error('You must specify hash function.');

    this.hash_function = options.hash_function;
    this.body_hash_function = options.body_hash_function ?? this.hash_function;
  }

  authorize(request: OAuthRequestOptions, token: OAuthToken) : OAuthAuthorization {
    // @ts-ignore
    const oauth_data: OAuthAuthorization = {
      oauth_consumer_key: this.consumer.key,
      oauth_nonce: this.getNonce(),
      oauth_signature_method: this.signature_method,
      oauth_timestamp: this.getTimeStamp(),
      oauth_version: this.version,
    };

    if (!token) {
      // @ts-ignore
      token = {};
    }

    if (token.key !== undefined) {
      oauth_data.oauth_token = token.key;
    }

    if (!request.data) {
      request.data = {};
    }

    if (request.includeBodyHash) {
      oauth_data.oauth_body_hash = this.getBodyHash(request, token.secret)
    }

    oauth_data.oauth_signature = this.getSignature(request, token.secret, oauth_data);

    return oauth_data;
  }

  getSignature(request: OAuthRequestOptions, token_secret: string | undefined, oauth_data: OAuthData) {
    return this.hash_function(this.getBaseString(request, oauth_data), this.getSigningKey(token_secret));
  }

  getBodyHash(request: OAuthRequestOptions, token_secret: string | undefined) {
    var body = typeof request.data === 'string' ? request.data : JSON.stringify(request.data);

    if (!this.body_hash_function) {
      throw new Error('body_hash_function option is required');
    }

    return this.body_hash_function(body, this.getSigningKey(token_secret));
  }

  getBaseString(request: OAuthRequestOptions, oauth_data: OAuthData) {
    return request.method.toUpperCase() + '&' + this.percentEncode(this.getBaseUrl(request.url)) + '&' + this.percentEncode(this.getParameterString(request, oauth_data));
  }
  
  getParameterString(request: OAuthRequestOptions, oauth_data: OAuthData) {
    let base_string_data;
    if (oauth_data.oauth_body_hash) {
      base_string_data = this.sortObject(this.percentEncodeData(this.mergeObject(oauth_data, this.deParamUrl(request.url))));
    } else {
      base_string_data = this.sortObject(this.percentEncodeData(this.mergeObject(oauth_data, this.mergeObject(request.data, this.deParamUrl(request.url)))));
    }
  
    let data_str = '';
  
    //base_string_data to string
    for (let i = 0; i < base_string_data.length; i++) {
      let key = base_string_data[i].key as string;
      let value = base_string_data[i].value;
      // check if the value is an array
      // this means that this key has multiple values
      if (value && Array.isArray(value)){
        // sort the array first
        value.sort();

        let valString = '';
        // serialize all values for this key: e.g. formkey=formvalue1&formkey=formvalue2
        value.forEach((function(item: any, i: number){
          valString += key + '=' + item;
          if (i < value.length){
            valString += "&";
          }
        }).bind(this));
        data_str += valString;
      } else {
        data_str += key + '=' + value + '&';
      }
    }
  
    //remove the last character
    data_str = data_str.substr(0, data_str.length - 1);
    return data_str;
  }

  getSigningKey(token_secret: string | undefined) {
    token_secret = token_secret || '';

    if(!this.last_ampersand && !token_secret) {
      return this.percentEncode(this.consumer.secret);
    }

    return this.percentEncode(this.consumer.secret) + '&' + this.percentEncode(token_secret);
  }

  getBaseUrl(url: string) {
    return url.split('?')[0];
  }

  deParam(string: string) : OAuthParam {
    const arr = string.split('&');
    const data: any = {};

    for (let i = 0; i < arr.length; i++) {
      const item = arr[i].split('=');

      // '' value
      item[1] = item[1] || '';

      // check if the key already exists
      // this can occur if the QS part of the url contains duplicate keys like this: ?formkey=formvalue1&formkey=formvalue2
      if (data[item[0]]){
        // the key exists already
        if (!Array.isArray(data[item[0]])) {
          // replace the value with an array containing the already present value
          data[item[0]] = [data[item[0]]];
        }
        // and add the new found value to it
        data[item[0]].push(decodeURIComponent(item[1]));
      } 
      else {
        // it doesn't exist, just put the found value in the data object
        data[item[0]] = decodeURIComponent(item[1]);
      }
    }

    return data;
  }

  deParamUrl(url: string) : OAuthParam {
    const tmp = url.split('?');

    if (tmp.length === 1)
      return {};
  
    return this.deParam(tmp[1]);
  }

  percentEncode(str: string) {
    return encodeURIComponent(str)
      .replace(/\!/g, "%21")
      .replace(/\*/g, "%2A")
      .replace(/\'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29");
  }

  percentEncodeData(data: any) {
    const result: any = {};

    for (const key in data) {
      let value = data[key];
      // check if the value is an array
      if (value && Array.isArray(value)){
        const newValue: string[] = [];
        // percentEncode every value

        for (const v of value) {
          newValue.push(this.percentEncode(v));
        }

        value = newValue;
      } else {
        value = this.percentEncode(value);
      }
      result[this.percentEncode(key)] = value;
    }

    return result;
  }

  toHeader(oauth_data: OAuthAuthorization) : OAuthHeader {
    const sorted = this.sortObject(oauth_data);

    let header_value = 'OAuth ';
  
    if (this.realm) {
      header_value += 'realm="' + this.realm + '"' + this.parameter_seperator;
    }
  
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].key.indexOf('oauth_') !== 0)
        continue;

      header_value += this.percentEncode(sorted[i].key) + '="' + this.percentEncode(sorted[i].value as string) + '"' + this.parameter_seperator;
    }
  
    return {
      Authorization: header_value.substr(0, header_value.length - this.parameter_seperator.length) //cut the last chars
    };
  }

  getNonce() {
    const word_characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    for (let i = 0; i < this.nonce_length; i++) {
      result += word_characters[Math.trunc(Math.random() * word_characters.length)];
    }

    return result;
  }

  getTimeStamp() {
    return Math.trunc(new Date().getTime() / 1000);
  }

  mergeObject<T, U>(obj1: T, obj2: U) : T & U {
    // @ts-ignore
    obj1 = obj1 || {};
    // @ts-ignore
    obj2 = obj2 || {};
  
    // @ts-ignore
    let merged_obj: T & U = obj1;

    for (const key in obj2) {
      // @ts-ignore
      merged_obj[key] = obj2[key];
    }

    return merged_obj;
  }

  sortObject<O extends {[k: string]: any}, K extends string>(data: O): Array<{key: keyof O, value: O[K]}> {
    const keys = Object.keys(data);
    const result = [];

    keys.sort();

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      result.push({
        key: key,
        value: data[key],
      });
    }

    return result;
  }
}

export default OAuth;