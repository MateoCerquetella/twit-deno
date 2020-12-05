# Twit Deno 🐦

Simple GET and POST methods using the new Deno framework sending authorized requests to the Twitter API.

Port of [twit](https://github.com/ttezel/twit) library to Deno.

## Features

- Promise driven via Async / Await
- REST and Stream support
- Typescript support
- Rate limiting support
- Minimal dependencies
- Test suite

## Usage:

```javascript
import { config } from "https://deno.land/x/dotenv/mod.ts";
import SimpleTwitter from "https://deno.land/x/simple_twitter_deno@0.02/simple_twitter_deno.ts";
// directly from github
// import SimpleTwitter from "https://raw.githubusercontent.com/MateoCerquetella/simple_twitter_deno/simple_twitter_deno.ts";
config({
  path: "./config/.env",
  export: true,
});

const simple_twitter = new SimpleTwitter({
  consumer_key: Deno.env.get("CONSUMER_KEY"),
  consumer_secret: Deno.env.get("CONSUMER_SECRET"),
  access_token: Deno.env.get("ACCESS_TOKEN"),
  access_token_secret: Deno.env.get("ACCESS_TOKEN_SECRET"),
  bearer_token: Deno.env.get("BEARER_TOKEN"),
});

const params = {
  q: "#Deno -filter:retweets",
  tweet_mode: "extended",
};

simple_twitter.get("search/tweets", params, function (
  error: any,
  tweets: any,
  response: any
) {
  if (!error) {
    console.log(tweets);
  }
});

//
//  tweet 'hello world!'
//
simple_twitter.post("statuses/update", { status: "hello world!" }, function (
  error: any,
  tweets: any,
  response: any
) {
  console.log(data);
});

//
//  search twitter for all tweets containing the word 'banana' since July 11, 2011
//
simple_twitter.get(
  "search/tweets",
  { q: "banana since:2011-07-11", count: 100 },
  function (err, data, response) {
    console.log(data);
  }
);

//
//  get the list of user id's that follow @tolga_tezel
//
simple_twitter.get("followers/ids", { screen_name: "tolga_tezel" }, function (
  error: any,
  tweets: any,
  response: any
) {
  console.log(data);
});

//
// Twit has promise support; you can use the callback API,
// promise API, or both at the same time.
//
simple_twitter
  .get("account/verify_credentials", { skip_status: true })
  .catch(function (err) {
    console.log("caught error", err.stack);
  })
  .then(function (result) {
    // `result` is an Object with keys "data" and "resp".
    // `data` and `resp` are the same objects as the ones passed
    // to the callback.
    // See https://github.com/ttezel/twit#tgetpath-params-callback
    // for details.

    console.log("data", result.data);
  });

//
//  retweet a tweet with id '343360866131001345'
//
simple_twitter.post(
  "statuses/retweet/:id",
  { id: "343360866131001345" },
  function (err, data, response) {
    console.log(data);
  }
);

//
//  destroy a tweet with id '343360866131001345'
//
simple_twitter.post(
  "statuses/destroy/:id",
  { id: "343360866131001345" },
  function (err, data, response) {
    console.log(data);
  }
);

//
// get `funny` twitter users
//
simple_twitter.get("users/suggestions/:slug", { slug: "funny" }, function (
  error: any,
  tweets: any,
  response: any
) {
  console.log(data);
});

//
// post a tweet with media
//
var b64content = fs.readFileSync("/path/to/img", { encoding: "base64" });

// first we must post the media to Twitter
simple_twitter.post("media/upload", { media_data: b64content }, function (
  error: any,
  tweets: any,
  response: any
) {
  // now we can assign alt text to the media, for use by screen readers and
  // other text-based presentations and interpreters
  var mediaIdStr = data.media_id_string;
  var altText = "Small flowers in a planter on a sunny balcony, blossoming.";
  var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } };

  simple_twitter.post("media/metadata/create", meta_params, function (
    error: any,
    tweets: any,
    response: any
  ) {
    if (!err) {
      // now we can reference the media and post a tweet (media will attach to the tweet)
      var params = { status: "loving life #nofilter", media_ids: [mediaIdStr] };

      simple_twitter.post("statuses/update", params, function (
        error: any,
        tweets: any,
        response: any
      ) {
        console.log(data);
      });
    }
  });
});

//
// post media via the chunked media upload API.
// You can then use POST statuses/update to post a tweet with the media attached as in the example above using `media_id_string`.
// Note: You can also do this yourself manually using simple_twitter.post() calls if you want more fine-grained
// control over the streaming. Example: https://github.com/ttezel/twit/blob/master/tests/rest_chunked_upload.js#L20
//
var filePath = "/absolute/path/to/file.mp4";
simple_twitter.postMediaChunked({ file_path: filePath }, function (
  error: any,
  tweets: any,
  response: any
) {
  console.log(data);
});

//
//  stream a sample of public statuses
//
var stream = simple_twitter.stream("statuses/sample");

stream.on("tweet", function (tweet) {
  console.log(tweet);
});

//
//  filter the twitter public stream by the word 'mango'.
//
var stream = simple_twitter.stream("statuses/filter", { track: "mango" });

stream.on("tweet", function (tweet) {
  console.log(tweet);
});

//
// filter the public stream by the latitude/longitude bounded box of San Francisco
//
var sanFrancisco = ["-122.75", "36.8", "-121.75", "37.8"];

var stream = simple_twitter.stream("statuses/filter", {
  locations: sanFrancisco,
});

stream.on("tweet", function (tweet) {
  console.log(tweet);
});

//
// filter the public stream by english tweets containing `#apple`
//
var stream = simple_twitter.stream("statuses/filter", {
  track: "#apple",
  language: "en",
});

stream.on("tweet", function (tweet) {
  console.log(tweet);
});
```

# twit API:

##`var simple_twitter = new Twit(config)`

Create a`Twit` instance that can be used to make requests to Twitter's APIs.

If authenticating with user context, `config` should be an object of the form:

```
{
    consumer_key:         '...'
  , consumer_secret:      '...'
  , access_token:         '...'
  , access_token_secret:  '...'
}
```

If authenticating with application context, `config` should be an object of the form:

```
{
    consumer_key:         '...'
  , consumer_secret:      '...'
  , app_only_auth:        true
}
```

Note that Application - only auth will not allow you to perform requests to API endpoints requiring
a user context, such as posting tweets.However, the endpoints available can have a higher rate limit.

##`simple_twitter.get(path, [params], callback)`

GET any of the REST API endpoints.

** path **

The endpoint to hit.When specifying`path` values, omit the ** '.json' ** at the end(i.e.use ** 'search/tweets' ** instead of ** 'search/tweets.json' **).

** params **

    (Optional) parameters for the request.

** callback **

      `function (err, data, response)`

      - `data` is the parsed data received from Twitter.

- `response` is the[http.IncomingMessage](http://nodejs.org/api/http.html# http_http_incomingmessage) received from Twitter.

##`simple_twitter.post(path, [params], callback)`

POST any of the REST API endpoints.Same usage as `simple_twitter.get()`.

##`simple_twitter.postMediaChunked(params, callback)`

Helper function to post media via the POST media / upload(chunked) API. `params` is an object containing a`file_path` key. `file_path` is the absolute path to the file you want to upload.

```js
var filePath = "/absolute/path/to/file.mp4";
simple_twitter.postMediaChunked({ file_path: filePath }, function (
  error: any,
  tweets: any,
  response: any
) {
  console.log(data);
});
```

You can also use the POST media / upload API via simple_twitter.post() calls if you want more fine - grained control over the streaming;[see here for an example](https://github.com/ttezel/twit/blob/master/tests/rest_chunked_upload.js# L20).

        ## `simple_twitter.getAuth()`

Get the simple_twitter's authentication tokens.

##`simple_twitter.setAuth(tokens)`

Update the simple_twitter's authentication tokens.

##`simple_twitter.stream(path, [params])`

Use this with the Streaming API.

** path **

Streaming endpoint to hit.One of:

- ** 'statuses/filter' **
- ** 'statuses/sample' **
- ** 'statuses/firehose' **
- ** 'user' **
- ** 'site' **

  For a description of each Streaming endpoint, see the[Twitter API docs](https://dev.twitter.com/streaming/overview).

** params **

(Optional) parameters for the request.Any Arrays passed in `params` get converted to comma - separated strings, allowing you to do requests like:

```javascript
//
// I only want to see tweets about my favorite fruits
//

// same result as doing { track: 'bananas,oranges,strawberries' }
var stream = simple_twitter.stream("statuses/filter", {
  track: ["bananas", "oranges", "strawberries"],
});

stream.on("tweet", function (tweet) {
  //...
});
```

# Using the Streaming API

`simple_twitter.stream(path, [params])` keeps the connection alive, and returns an`EventEmitter`.

The following events are emitted:

## event: 'message'

Emitted each time an object is received in the stream.This is a catch-all event that can be used to process any data received in the stream, rather than using the more specific events documented below.
New in version 2.1.0.

```javascript
stream.on("message", function (msg) {
  //...
});
```

## event: 'tweet'

Emitted each time a status(tweet) comes into the stream.

```javascript
stream.on("tweet", function (tweet) {
  //...
});
```

## event: 'delete'

Emitted each time a status(tweet) deletion message comes into the stream.

```javascript
stream.on("delete", function (deleteMessage) {
  //...
});
```

## event: 'limit'

Emitted each time a limitation message comes into the stream.

```javascript
stream.on("limit", function (limitMessage) {
  //...
});
```

## event: 'scrub_geo'

Emitted each time a location deletion message comes into the stream.

```javascript
stream.on("scrub_geo", function (scrubGeoMessage) {
  //...
});
```

## event: 'disconnect'

Emitted when a disconnect message comes from Twitter.This occurs if you have multiple streams connected to Twitter's API. Upon receiving a disconnect message from Twitter, `Twit` will close the connection and emit this event with the message details received from twitter.

```javascript
stream.on("disconnect", function (disconnectMessage) {
  //...
});
```

## event: 'connect'

Emitted when a connection attempt is made to Twitter.The http`request` object is emitted.

```javascript
stream.on("connect", function (request) {
  //...
});
```

## event: 'connected'

Emitted when the response is received from Twitter.The http`response` object is emitted.

```javascript
stream.on("connected", function (response) {
  //...
});
```

## event: 'reconnect'

Emitted when a reconnection attempt to Twitter is scheduled.If Twitter is having problems or we get rate limited, we schedule a reconnect according to Twitter's [reconnection guidelines](https://dev.twitter.com/streaming/overview/connecting). The last http `request` and `response` objects are emitted, along with the time (in milliseconds) left before the reconnect occurs.

```javascript
stream.on("reconnect", function (request, response, connectInterval) {
  //...
});
```

## event: 'warning'

This message is appropriate for clients using high - bandwidth connections, like the firehose.If your connection is falling behind, Twitter will queue messages for you, until your queue fills up, at which point they will disconnect you.

```javascript
stream.on("warning", function (warning) {
  //...
});
```

## event: 'status_withheld'

Emitted when Twitter sends back a`status_withheld` message in the stream.This means that a tweet was withheld in certain countries.

```javascript
stream.on("status_withheld", function (withheldMsg) {
  //...
});
```

## event: 'user_withheld'

Emitted when Twitter sends back a`user_withheld` message in the stream.This means that a Twitter user was withheld in certain countries.

```javascript
stream.on("user_withheld", function (withheldMsg) {
  //...
});
```

## event: 'friends'

Emitted when Twitter sends the["friends" preamble](https://dev.twitter.com/streaming/overview/messages-types# user_stream_messsages) when connecting to a user stream. This message contains a list of the user's friends, represented as an array of user ids. If the [stringify_friend_ids](https://dev.twitter.com/streaming/overview/request-parameters#stringify_friend_id) parameter is set, the friends
list preamble will be returned as Strings (instead of Numbers).

```javascript
var stream = simple_twitter.stream("user", { stringify_friend_ids: true });
stream.on("friends", function (friendsMsg) {
  //...
});
```

## event: 'direct_message'

Emitted when a direct message is sent to the user.Unfortunately, Twitter has not documented this event for user streams.

```javascript
stream.on("direct_message", function (directMsg) {
  //...
});
```

## event: 'user_event'

Emitted when Twitter sends back a[User stream event](https://dev.twitter.com/streaming/overview/messages-types#Events_event).
See the Twitter docs for more information on each event's structure.

    ```javascript

stream.on("user_event", function (eventMsg) {
//...
});

````

In addition, the following user stream events are provided for you to listen on:

  - `blocked`
    - `unblocked`
    - `favorite`
    - `unfavorite`
    - `follow`
    - `unfollow`
    - `mute`
    - `unmute`
    - `user_update`
    - `list_created`
    - `list_destroyed`
    - `list_updated`
    - `list_member_added`
    - `list_member_removed`
    - `list_user_subscribed`
    - `list_user_unsubscribed`
    - `quoted_tweet`
    - `retweeted_retweet`
    - `favorited_retweet`
    - `unknown_user_event`(for an event that doesn't match any of the above)

### Example:

```javascript
stream.on("favorite", function (event) {
  //...
});
````

## event: 'error'

Emitted when an API request or response error occurs.
An`Error` object is emitted, with properties:

```js
{
message:      '...',  // error message
statusCode:   '...',  // statusCode from Twitter
code:         '...',  // error code from Twitter
twitterReply: '...',  // raw response data from Twitter
allErrors:    '...'   // array of errors returned from Twitter
}
```

## stream.stop()

Call this function on the stream to stop streaming(closes the connection with Twitter).

## stream.start()

Call this function to restart the stream after you called`.stop()` on it.
Note: there is no need to call`.start()` to begin streaming. `Twit.stream` calls`.start()` for you.

---

# What do I have access to ?

Anything in the Twitter API:

- REST API Endpoints: https://dev.twitter.com/rest/public
- Public stream endpoints: https://dev.twitter.com/streaming/public
- User stream endpoints: https://dev.twitter.com/streaming/userstreams
- Site stream endpoints: https://dev.twitter.com/streaming/sitestreams

---

Go here to create an app and get OAuth credentials(if you haven't already): https://apps.twitter.com/app/new

# Advanced

You may specify an array of trusted certificate fingerprints if you want to only trust a specific set of certificates.
When an HTTP response is received, it is verified that the certificate was signed, and the peer certificate's fingerprint must be one of the values you specified. By default, the node.js trusted "root" CAs will be used.

eg.

```js
var twit = new Twit({
  consumer_key: "...",
  consumer_secret: "...",
  access_token: "...",
  access_token_secret: "...",
  trusted_cert_fingerprints: [
    "66:EA:47:62:D9:B1:4F:1A:AE:89:5F:68:BA:6B:8E:BB:F8:1D:BF:8E",
  ],
});
```

# Contributing

- Make your changes
  - Make sure your code matches the style of the code around it
    - Add tests that cover your feature / bugfix
      - Run tests
        - Submit a pull request

# How do I run the tests ?

Create two files: `config1.js` and`config2.js` at the root of the`twit` folder.They should contain two different sets of oauth credentials for twit to use(two accounts are needed for testing interactions).They should both look something like this:

```
module.exports = {
    consumer_key: '...'
  , consumer_secret: '...'
  , access_token: '...'
  , access_token_secret: '...'
}
```

Then run the tests:

```
npm test
```

You can also run the example:

```
node examples/rtd2.js
```

![iRTD2](http://dl.dropbox.com/u/32773572/RTD2_logo.png)

The example is a twitter bot named[RTD2](https://twitter.com/#!/iRTD2) written using `twit`. RTD2 tweets about **github** and curates its social graph.

    ---

    [FAQ](https://github.com/ttezel/twit/wiki/FAQ)
