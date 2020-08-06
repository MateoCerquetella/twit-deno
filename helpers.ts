import OAuth from 'https://raw.githubusercontent.com/alkihis/oauth_1.0a/3.0.0/mod.ts';
import { hmac } from 'https://deno.land/x/hmac@v1.0.2/mod.ts';

export class Helpers {
  public createOauthClient = ({ key, secret }: { key: string, secret: string }) => {
    const client = new OAuth({
      consumer: { key, secret },
      signature_method: 'HMAC-SHA1',
      hash_function(baseString: string, key: string) {
        return hmac("sha1", key, baseString, "utf8", "base64").toString();
      },
    });
    return client;
  };
}
