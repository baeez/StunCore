const { app, BrowserWindow, ipcMain, Menu, screen } = require('electron');
const path = require('path');
const dgram = require('dgram');

const HOST = '127.0.0.1';
const PORT = 55355;
const POLL_INTERVAL_MS = 100;

let mainWindow;
let polling = false;

function sendCommand(cmd, timeoutMs = 1000) {
  return new Promise((resolve) => {
    const socket = dgram.createSocket('udp4');
    let done = false;

    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        socket.close();
        resolve(null); // timeout -> equivalente a "-w 1" de nc
      }
    }, timeoutMs);

    socket.on('message', (msg) => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        socket.close();
        resolve(msg.toString().trim());
      }
    });

    socket.on('error', () => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        socket.close();
        resolve(null);
      }
    });

    socket.send(cmd, PORT, HOST);
  });
}

function extractField3(response) {
  if (!response) return '0';
  const parts = response.split(/\s+/);
  return parts[2] || '0';
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function pollLoop() {
  polling = true;
  while (polling) {
    const p1Resp = await sendCommand('READ_CORE_RAM 83E8 1');
    const p2Resp = await sendCommand('READ_CORE_RAM 86E8 1');

    const p1Hex = extractField3(p1Resp);
    const p2Hex = extractField3(p2Resp);

    const p1Dec = parseInt(p1Hex, 16) || 0;
    const p2Dec = parseInt(p2Hex, 16) || 0;

    const p1Pct = Math.floor((p1Dec * 100) / 144);
    const p2Pct = Math.floor((p2Dec * 100) / 144);

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('sf2-data', {
        p1Dec, p1Pct,
        p2Dec, p2Pct,
        p2Hex
      });
    }

    await sleep(POLL_INTERVAL_MS);
  }
}

function createWindow() {
  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: screenWidth,
    height: 100,
    resizable: false,
    frame: false,           // sin barra de título ni botones
    alwaysOnTop: true,      // siempre encima de otras ventanas
    skipTaskbar: false,     // pon true si tampoco la quieres en la barra de tareas
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Nivel más alto de "always on top" disponible en Linux
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    polling = false;
    mainWindow = null;
  });

  pollLoop();
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null); // quita la barra de menú (File/Edit/View...)
  createWindow();
});

app.on('window-all-closed', () => {
  polling = false;
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});