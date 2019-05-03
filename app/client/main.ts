import queue from "./queue";
import * as Twitter from "twitter";

const twitter = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

twitter.stream('statuses/filter', {
  track: 'twitter'
}, stream => {
  stream.on('data', (tweet) => {
    if (tweet.text !== undefined && !tweet.text.includes('RT')) {
      queue.push(tweet)
    }
  });

  stream.on('error', (error) => {
    console.log(error);
  });
});