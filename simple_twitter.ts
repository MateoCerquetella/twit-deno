'use strict';
import { AccessKey } from './models';
import { Helpers } from './helpers'

export class SimpleTwitter {
  private oauth_consumer_key: string;
  private oauth_consumer_secret: string;
  private oauth_token: string;
  private oauth_token_secret: string;
  private headers: string;

  helper = new Helpers();

  constructor(key: AccessKey) {
    this.oauth_consumer_key = key.consumer_Key;
    this.oauth_consumer_secret = key.consumer_Secret;
    this.oauth_token = key.access_Token;
    this.oauth_token_secret = key.access_Token_Secret;
    this.headers = key.headers;
  }
}