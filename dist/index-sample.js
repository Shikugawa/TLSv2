const {
  app,
  ipcMain,
  BrowserWindow
} = require('electron');
const Twitter = require('twitter');
const queue = require('./queue');

const DEFAULT_WINDOW_WIDTH = 1800;
const DEFAULT_WINDOW_HEIGHT = 1000;

const inViewWindows = [];

class CoreWindow {
  constructor() {}

  createWindow(windowOptions, filePath, options) {
    this.win = new BrowserWindow(options);
    this.win.loadURL(`file://${filePath}`);

    if (options.ignoreMouse) {
      this.win.setIgnoreMouseEvents(true);
    }
  }
}

class ManagerWindow extends CoreWindow {
  constructor() {
    this.name = 'manager';
    this.createWindow();
    ipcMain.on('sendStatus', this.createWindow.bind(this));
  }

  sendStatus() {
    // TwitterWindowを作る
  }

  createWindow() {
    super.createWindow({
      width: 400,
      height: 400,
      resizable: false,
      webPreferences: {
        nodeIntegration: true
      }
    }, `${__dirname}/manager.html`, {
      ignoreMouse: false
    });
  }

  createChildWindow() {
    inViewWindows.push(new TwitterWindow());
  }

  getWindow() {
    return super.win;
  }
}

class TwitterWindow extends CoreWindow {
  constructor() {
    this.name = 'twitter';
    this.createWindow();
    super.win.on('ready-to-show', this.initStream.bind(this));
    ipcMain.on('sendTweet', this.sendTweet.bind(this, event, arg));
  }

  sendTweet(event, arg) {
    event.returnValue = queue.pop();
  }

  createWindow() {
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
    }, `${__dirname}/index.html`, {
      ignoreMouse: false
    });
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
          const [width, height] = win ?
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

app.on('ready', () => inViewWindows.push(new ManagerWindow()));

app.on('activate', () => {
  const isManagerExists = () => inViewWindows.filter(window => window.name === 'manager').length > 0;
  if (!isManagerExists()) {
    new ManagerWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});