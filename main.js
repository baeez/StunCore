const { app, BrowserWindow, ipcMain, Menu, screen } = require('electron');
const path = require('path');
const dgram = require('dgram');
const { Board, Servo } = require("johnny-five");



const board = new Board();

//Iniciamos ARDUINO
board.on("ready", () => {
  console.log("Arduino listo. Iniciando control de servos...");

  // Servo 1 en pin 9, Servo 2 en pin 10
  const servo1 = new Servo({ pin: 9, range: [0, 180], startAt: 90 });
  const servo2 = new Servo({ pin: 10, range: [0, 180], startAt: 90 });
servo1.to(0);
  //DEJAR EN 90
  servo1.to(90);

  board.repl.inject({
    servo1,
    servo2,
  });
 
  board.on("exit", () => {
    servo1.to(0);
    servo2.to(0);
  });




  //COnectando a la RAM de RETROARCH
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
    let p1_damagebefore = false; 
    let p2_damagebefore = false; 

    while (polling) {
      const p1Resp = await sendCommand('READ_CORE_RAM 83E8 1'); //83E8 = POSICION DE DAÑO p1
      const p2Resp = await sendCommand('READ_CORE_RAM 86E8 1'); //86E8 = POSICION DE DAÑO p2

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

      //Invocar funcion de daño a jugador P1
      if(p1Dec != p1_damagebefore){       
        //Registrar daño
        damage("P1",(p1_damagebefore-p1Dec),p1Dec,p1Pct);
        p1_damagebefore = p1Dec; //Guardar nuevo daño
      }

      //Invocar funcion de daño a jugador P2
      if(p2Dec != p2_damagebefore){       
        //Registrar daño
        damage("P2",(p2_damagebefore-p2Dec),p2Dec,p2Pct);
        p2_damagebefore = p2Dec; //Guardar nuevo daño
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


  //Registrar daño
  async function damage($player, $damage, $hp, $percent) {
    console.log("Jugador: "+$player+"   Daño: "+$damage+" HP:"+$hp+" "+$percent+"%");

    
    
      if($player == "P1"){
      console.log("Recibe ataque P1");      
      servo1.to(110);
      
      
    }
     
    if($player == "P2"){
      console.log("Recibe ataque P2");     
      servo1.to(70);
        
      
    }
    //ESPERAR A que se mueva el motor
    await sleep(300);  
    //RESET
    servo1.to(90);
  }

});

board.on("error", (err) => {
  console.error("Error de conexión con el Arduino:", err.message);
});


