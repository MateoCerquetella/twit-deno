import StreamParser from "./parser.ts";
import { Credentials } from "./models.ts"
import { deepAssign as merge } from "https://deno.land/std/_util/deep_assign.ts";
// Package version
const VERSION = 0.1;

class SimpleTwitter {
  VERSION = VERSION;
  requestDefaults: any;

  constructor(public options: any) {
    this.options = merge(
      {
        consumer_key: null,
        consumer_secret: null,
        access_token_key: null,
        access_token_secret: null,
        bearer_token: null,
        rest_credential: "https://api.twitter.com/1.1",
        stream_credential: "https://stream.twitter.com/1.1",
        user_stream_credential: "https://userstream.twitter.com/1.1",
        site_stream_credential: "https://sitestream.twitter.com/1.1",
        media_credential: "https://upload.twitter.com/1.1",
        request_options: {
          headers: {
            Accept: "*/*",
            Connection: "close",
          },
        },
      },
      options,
    );

    let authentication_options: {
      oauth?: {
        consumer_key: string;
        consumer_secret: string;
        token: string;
        token_secret: string;
      };
      headers?: Headers;
    } = {
      oauth: {
        consumer_key: this.options.consumer_key,
        consumer_secret: this.options.consumer_secret,
        token: this.options.access_token_key,
        token_secret: this.options.access_token_secret,
      },
    };

    // Check to see if we are going to use User Authentication or Application Authetication
    if (this.options.bearer_token) {
      const headers = new Headers();
      headers.set("Authorization", "Bearer " + this.options.bearer_token);
      authentication_options = {
        headers: headers,
      };
    }

    // Configure default request options
    this.requestDefaults = merge(
      authentication_options,
      this.options.request_options,
    );
  }

  __buildEndpoint(path: string, credential: keyof Credentials) {
    const credentials: Credentials = {
      rest: this.options.rest_credential,
      stream: this.options.stream_credential,
      user_stream: this.options.user_stream_credential,
      site_stream: this.options.site_stream_credential,
      media: this.options.media_credential,
    };
    let endpoint = credentials.hasOwnProperty(credential) ? credentials[credential] : credentials.rest;
    // if full url is specified we use that
    let isFullUrl = false;
    try {
      isFullUrl = new URL(path).protocol !== null;
    } catch (e) { }
    if (isFullUrl) {
      endpoint = path;
    } else {
      // If the path begins with media or /media
      if (path.match(/^(\/)?media/)) {
        endpoint = credentials.media;
      }
      endpoint += path.charAt(0) === "/" ? path : "/" + path;
    }

    // Remove trailing slash
    endpoint = endpoint.replace(/\/$/, "");

    if (!isFullUrl) {
      // Add json extension if not provided in call... only if a full url is not specified
      endpoint += path.split(".").pop() !== "json" ? ".json" : "";
    }

    return endpoint;
  }

  __request(method: string, path: string, params: any, callback?: Function) {
    let credential: keyof Credentials = "rest",
      cb: Function,
      promise = false;

    // Set the callback if no params are passed
    if (typeof params === "function") {
      cb = params;
      params = {};
    } // Return promise if no callback is passed and promises available
    else if (callback === undefined) {
      promise = true;
    } else {
      cb = callback;
    }

    // Set API credential
    if (typeof params.credential !== "undefined") {
      credential = params.credential;
      delete params.credential;
    }

    // Build the options to pass to our custom request object
    const options = merge(this.requestDefaults, {
      method: method.toLowerCase(), // Request method - get || post
    });

    let url = this.__buildEndpoint(path, credential); // Generate url

    // Pass url parameters if get
    if (method === "get") {
      const qs = "?" + new URLSearchParams(params).toString();
      url += qs;
    }

    const request = new Request(url, options);

    // Promisified version
    if (promise) {
      return new Promise(function (resolve: any, reject: any) {
        fetch(request)
          .then((res) => res.json())
          .then((data) => {
            // response object errors
            // This should return an error object not an array of errors
            if (data.errors !== undefined) {
              return reject(data.errors);
            }

            // no errors
            resolve(data);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    }

    // Callback version
    fetch(request)
      .then(async (response) => {
        const data = await response.json();

        // response object errors
        // This should return an error object not an array of errors
        if (data.errors !== undefined) {
          return cb(data.errors, data, response);
        }
        // no errors
        cb(null, data, response);
      })
      .catch((error: any) => {
        cb(error);
      });
  }

  /**
   * GET
   */
  get(url: string, params: any, callback?: Function) {
    return this.__request("get", url, params, callback);
  }

  /**
   * POST
   */
  post(url: string, params: any, callback?: Function) {
    return this.__request("post", url, params, callback);
  }

  /**
   * STREAM
   */
  stream(method: string, params: any, callback?: Function) {
    if (typeof params === "function") {
      callback = params;
      params = {};
    }

    let credential: keyof Credentials = "stream";

    if (method === "user" || method === "site") {
      credential = (method + "_" + credential) as keyof Credentials;
    }

    let url = this.__buildEndpoint(method, credential);
    const qs = "?" + new URLSearchParams(params).toString();
    url += qs;

    const request = new Request(url);
    const stream = new StreamParser();

    fetch(url, request).then((response) => {
      const reader = response.body?.getReader();

      if (response.status !== 200) {
        return stream.emit("error", new Error(`CODE: ${response.status}`));
      }
      stream.emit("response", response);

      return new ReadableStream({
        start(controller) {
          return pump();
          function pump(): any {
            return reader?.read().then(({ done, value }) => {
              if (done) {
                stream.emit("end", response);
                controller.close();
              }
              if (value) {
                stream.receive(value);
                controller.enqueue(value);
              }
              return pump();
            });
          }
        },
      });
    });

    if (typeof callback === "function") {
      callback(stream);
    } else {
      return stream;
    }
  }
}

export default SimpleTwitter;