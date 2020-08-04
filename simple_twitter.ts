import { AccessKey } from './models.ts';
import { Helpers } from './helpers.ts'

export class TwitterRestApi {
  private oauth_consumer_key: string;
  private oauth_consumer_secret: string;
  private oauth_token: string;
  private oauth_token_secret: string;

  helper = new Helpers();

  constructor(key: AccessKey) {
    this.oauth_consumer_key = key.consumer_Key;
    this.oauth_consumer_secret = key.consumer_Secret;
    this.oauth_token = key.access_Token;
    this.oauth_token_secret = key.access_Token_Secret;
  }

  oauthParams = {
    oauth_consumer_key: this.oauth_consumer_key,
    oauth_nonce: this.helper.createNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: this.helper.createTimestamp(),
    oauth_token: this.oauth_token,
    oauth_version: '1.0',
  }

  
}

