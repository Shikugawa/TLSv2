import P5 from 'p5';
import queue from "./queue";
import { P5 } from "@types/p5"

export default class WindowManager {
  private p5: P5;

  constructor() {
    this.p5 = new P5(this.sketch);
  }

  sketch(p) {
    let flowingTweetQueue = [];

    p.setup = () => {
      p.frameRate(30);
    };

    p.draw = () => {
      p.clear();
      p.createCanvas(window.innerWidth, window.innerHeight);

      let tweet = queue.pop();

      if (tweet) {
        flowingTweetQueue.push(tweet);
      } else {
        console.log("waiting tweet is none");
      }

      flowingTweetQueue.forEach((data: Tweet) => {
        p.textSize(32);
        p.text(
          data.tweetdata,
          data.xLocation,
          data.yLocation
        );
        p.fill(255);
        data.xLocation += 10;
      });

      flowingTweetQueue.some((value, index) => {
        if (value.xLocation > window.width) flowingTweetQueue.splice(index, 1);
      });
    };
  }
}