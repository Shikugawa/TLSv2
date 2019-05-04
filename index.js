const {
  app,
  ipcMain,
  BrowserWindow
} = require('electron');
const dotenv = require('dotenv').config();
const Twitter = require('twitter');
const queue = require('./queue');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: DEFAULT_WINDOW_WIDTH,
    height: DEFAULT_WINDOW_HEIGHT,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadURL(`file://${__dirname}/index.html`);
  win.setIgnoreMouseEvents(true);

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.on('sendTweet', (event, arg) => {
  event.returnValue = queue.pop();
});

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