import {
  Tweet
} from './tweet';


class Queue {
  constructor() {
    this.queue = [];
  }

  push(data) {
    let xpos = data.text.length * (-32);
    this.queue.push(new Tweet(data.text, xpos));
  }

  pop() {
    this.queue.shift();
  }
}

export default new Queue();