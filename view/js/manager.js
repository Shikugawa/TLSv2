const {
  ipcRenderer
} = require('electron');

const target = document.querySelector('.button');
target.addEventListener('click', event => {
  ipcRenderer.sendSync('sendStatus');
});