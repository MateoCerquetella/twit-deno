/**
 * OAuth options.
 */
export interface OAuthOptions {
    body_hash_function?: BodyHashFunction;
    consumer: OAuthConsumer;
    hash_function?: OAuthHashFunction;
    last_ampersand?: boolean;
    nonce_length?: number;
    parameter_seperator?: string;
    realm?: string;
    signature_method?: string;
    version?: string;
  }
  
  /**
   * OAuth data, including the signature.
   */
  export interface OAuthAuthorization extends OAuthData {
    oauth_signature: string;
  }
  
  /**
   * Method used to generate the body hash.
   *
   * Note: the key is used for implementation HMAC algorithms for the body hash,
   * but typically it should return SHA1 hash of base_string.
   */
  export type BodyHashFunction = (base_string: string, key: string) => string;
  
  /**
   * OAuth key/secret pair.
   */
  export interface OAuthConsumer {
    key: string;
    secret: string;
  }
  
  /**
   * OAuth data, excluding the signature.
   */
  export interface OAuthData {
    oauth_consumer_key: string;
    oauth_nonce: string;
    oauth_signature_method: string;
    oauth_timestamp: number;
    oauth_version: string;
    oauth_token?: string;
    oauth_body_hash?: string;
  }
  
  /**
   * Method used to hash the the OAuth and form/querystring data.
   */
  export type OAuthHashFunction = (base_string: string, key: string) => string;
  
  /**
   * Authorization header.
   */
  export interface OAuthHeader {
    Authorization: string;
  }
  
  /**
   * OAuth options.
   */
  export interface Options {
    body_hash_function?: BodyHashFunction;
    consumer: OAuthConsumer;
    hash_function?: OAuthHashFunction;
    last_ampersand?: boolean;
    nonce_length?: number;
    parameter_seperator?: string;
    realm?: string;
    signature_method?: string;
    version?: string;
  }
  
  /**
   * Extra data.
   */
  export interface OAuthParam {
    [key: string]: string | string[];
  }
  
  /**
   * Request options.
   */
  export interface OAuthRequestOptions {
    url: string;
    method: string;
    data?: any;
    includeBodyHash?: boolean;
  }
  
  /**
   * OAuth token key/secret pair.
   */
  export interface OAuthToken {
    key: string;
    secret: string;
  }