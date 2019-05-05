const p5 = require('p5');
const {
  ipcRenderer
} = require('electron');

new p5(p => {
  let flowingTweetQueue = [];

  p.setup = () => {
    p.frameRate(30);
  };

  p.draw = () => {
    p.clear();
    p.createCanvas(window.innerWidth, window.innerHeight);

    const tweet = ipcRenderer.sendSync('sendTweet');

    if (tweet) {
      flowingTweetQueue.push(tweet);
    } else {
      console.log("waiting tweet is none");
    }

    flowingTweetQueue.forEach((data) => {
      p.textSize(32);
      p.text(
        data.tweetdata,
        data.xLocation,
        data.yLocation
      );
      p.fill(255);
      data.xLocation += 10;
    });

    flowingTweetQueue = flowingTweetQueue.filter(tweet => tweet.xLocation <= window.innerWidth);
  };
}, document.querySelector('#main'));