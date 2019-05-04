const {
  Tweet
} = require('./data/tweet');

class Queue {
  constructor() {
    this.queue = [];
  }

  push(data, screenHeight) {
    let xpos = data.text.length * (-32);
    let ypos = Math.floor(Math.random() * (screenHeight + 1));
    this.queue.push(new Tweet(data.text, xpos, ypos));
  }

  pop() {
    return this.queue.shift();
  }
}

module.exports = new Queue();