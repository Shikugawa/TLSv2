const {
  app,
  ipcMain,
  BrowserWindow
} = require('electron');
const {
  EventEmitter
} = require('events');
const dotenv = require('dotenv').config();
const Twitter = require('twitter');
const queue = require('./queue');

const DEFAULT_WINDOW_WIDTH = 1800;
const DEFAULT_WINDOW_HEIGHT = 1000;

class ViewWindowsQueue extends EventEmitter {
  constructor() {
    super();
    this.inViewWindows = [];
  }

  push(value) {
    this.inViewWindows.push(value);
  }

  shift() {
    const value = this.unshift();
    this.emit('shift', value);
  }

  checkWindow(windowName) {
    return this.inViewWindows.filter(window => window.name === windowName).length > 0;
  }
}

const windowQueue = new ViewWindowsQueue();
windowQueue.on('shift', (event, arg) => arg.destroyWindow());

class CoreWindow {
  constructor() {}

  createWindow(windowOptions, filePath, options, invoke) {
    this.win = new BrowserWindow(windowOptions);
    this.win.loadURL(`file://${filePath}`);

    if (options.ignoreMouse) {
      this.win.setIgnoreMouseEvents(true);
    }

    if (invoke) {
      for (const func of invoke) {
        func();
      }
    }
  }

  destroyWindow() {
    this.win.close();
  }
}

class ManagerWindow extends CoreWindow {
  constructor() {
    super();
    this.name = 'manager';
    this.createWindow();
    ipcMain.on('sendStatus', this.sendStatus.bind(this));
  }

  sendStatus(event, arg) {
    this.moveTwitterWindow();
  }

  createWindow() {
    super.createWindow({
      width: 400,
      height: 400,
      resizable: false,
      webPreferences: {
        nodeIntegration: true
      }
    }, `${__dirname}/view/manager.html`, {
      ignoreMouse: false
    });
  }

  destroyWindow() {
    super.destroyWindow();
  }

  moveTwitterWindow() {
    windowQueue.push(new TwitterWindow());
    super.destroyWindow();
  }
}

class TwitterWindow extends CoreWindow {
  constructor() {
    super();
    this.name = 'twitter';
    this.createWindow();
    ipcMain.on('sendTweet', this.sendTweet.bind(this));
  }

  sendTweet(event, arg) {
    event.returnValue = queue.pop();
  }

  createWindow() {
    const invoke = [this.initStream.bind(this)]

    super.createWindow({
      width: DEFAULT_WINDOW_WIDTH,
      height: DEFAULT_WINDOW_HEIGHT,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      resizable: false,
      webPreferences: {
        nodeIntegration: true
      }
    }, `${__dirname}/view/twitter.html`, {
      ignoreMouse: false
    }, invoke);
  }

  destroyWindow() {
    super.destroyWindow();
  }

  initStream() {
    const twitter = new Twitter({
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET,
      access_token_key: process.env.ACCESS_TOKEN,
      access_token_secret: process.env.ACCESS_TOKEN_SECRET
    });

    twitter.stream('statuses/filter', {
      track: 'twitter'
    }, (stream) => {
      stream.on('data', tweet => {
        if (tweet.text !== undefined && !tweet.text.includes('RT')) {
          const [width, height] = super.win ?
            win.getSize() : [DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT];
          queue.push(tweet, height);
        }
      });

      stream.on('error', (error) => {
        console.log(error);
      });
    });
  }
}

app.on('ready', () => windowQueue.push(new ManagerWindow()));

app.on('activate', () => {
  if (!windowQueue.checkWindow('manager')) {
    new ManagerWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});