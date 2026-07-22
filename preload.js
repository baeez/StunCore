const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sf2API', {
  onData: (callback) => {
    ipcRenderer.on('sf2-data', (event, data) => callback(data));
  }
});
