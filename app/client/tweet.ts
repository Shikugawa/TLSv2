export default class Tweet {
  tweetdata: Object;
  xLocation: number;
  yLocation: number;

  constructor(private data, private x) {
    this.tweetdata = data;
    this.xLocation = x;
    this.yLocation = Math.floor(Math.random() * (screen.height + 1));
  }
}