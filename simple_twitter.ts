import { AccessKey } from './models.ts';

export class TwitterRestApi {
  private oauth_consumer_key: string;
  private oauth_consumer_secret: string;
  private oauth_token: string;
  private oauth_token_secret: string;

  constructor(key: AccessKey) {
    this.oauth_consumer_key = key.consumer_Key;
    this.oauth_consumer_secret = key.consumer_Secret;
    this.oauth_token = key.access_Token;
    this.oauth_token_secret = key.access_Token_Secret;
  }
  
  oauthParams = {
    oauth_consumer_key: this.oauth_consumer_key,
    oauth_nonce: this.createNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: this.createTimestamp(),
    oauth_token: this.oauth_token,
    oauth_version: '1.0',
  }

  private createNonce(): string {
    const chars = [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"];
    return [...Array(42)].map(i => chars[Math.random()*chars.length|0]).join('');
  }

  private createTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }

  private createPercentEncode(str: string): string {
    return encodeURIComponent(str)
      .replace(/[!'()]/g, escape)
      .replace(/\*/g, '%2A')
  }
  
}

