const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sf2API', {
  onData: (callback) => { ipcRenderer.on('sf2-data', (event, data) => callback(data)); },
  onShowHitP1: (callback) => ipcRenderer.on('show-hitP1', (event, data) => callback(data)),
  onShowHitP2: (callback) => ipcRenderer.on('show-hitP2', (event, data) => callback(data))
});
