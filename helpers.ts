export class Helpers {
  public createNonce(): string {
    const chars = [
      ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    ];
    return [...Array(42)].map((i) => chars[Math.random() * chars.length | 0])
      .join("");
  }

  public createTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }

  public createPercentEncode(str: string): string {
    return encodeURIComponent(str)
      .replace(/[!'()]/g, escape)
      .replace(/\*/g, "%2A");
  }

  /*
  https://developer.twitter.com/en/docs/basics/authentication/oauth-1-0a/creating-a-signature

  These values need to be encoded into a single string, which will be used later on. The process to build the string is very specific:

    1. Percent encode every key and value that will be signed.
    2. Sort the list of parameters alphabetically [1] by encoded key [2].
    3. For each key/value pair:
    4. Append the encoded key to the output string.
    5. Append the ‘=’ character to the output string.
    6. Append the encoded value to the output string.
    7. If there are more key/value pairs remaining, append a ‘&’ character to the output string.
  */
  public createAuthHeader(key: string, value: string): string {
    return this.createPercentEncode(key) +
      '="' +
      this.createPercentEncode(value) +
      '"';
  }
}
