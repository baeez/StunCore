const { app, BrowserWindow, ipcMain, Menu, screen } = require('electron');
const path = require('path');
const dgram = require('dgram');
const { Board, Servo } = require("johnny-five");

// Soporta tanto la versión nueva (v10+) como versiones anteriores de serialport
const SerialPortPackage = require('serialport');
const SerialPort = SerialPortPackage.SerialPort || SerialPortPackage;

// Buscar de forma simple el primer puerto COM que no sea COM1
function loadArduino(portPath) {
  
   const board = new Board({
      port: portPath,
      repl: false // Obligatorio en Electron
    });

   
    //Iniciamos ARDUINO
    board.on("ready", () => {
      console.log("Arduino listo. Iniciando control de servos...");

      // Servo 1 en pin 9, Servo 2 en pin 10
      const servo1 = new Servo({ pin: 9, range: [0, 180], startAt: 90 });

      //DEJAR EN 90 que seria la posición NEUTRAL
      servo1.to(90);
    
      board.on("exit", () => {
        servo1.to(90); //Al apagarlo, dejarlo en esta posición
      });

      //Settings de  RETROARCH
      const HOST = '127.0.0.1';
      const PORT = 55355;
      const POLL_INTERVAL_MS = 100; //Intervalo de tiempo entre cada conexión
      const SERVO_INTERVAL_MS = 300; //Intervalo de tiempo para esperar a que el servo regrese a su posición inicial

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
          const p1Resp = await sendCommand('READ_CORE_RAM 83E8 1'); //83E8 = POSICION DE DAÑO JUGADOR 1
          const p2Resp = await sendCommand('READ_CORE_RAM 86E8 1'); //86E8 = POSICION DE DAÑO JUGADOR 2

          const p1Hex = extractField3(p1Resp);
          const p2Hex = extractField3(p2Resp);

          const p1Dec = parseInt(p1Hex, 16) || 0;
          const p2Dec = parseInt(p2Hex, 16) || 0;

          const p1Pct = Math.floor((p1Dec * 100) / 144);
          const p2Pct = Math.floor((p2Dec * 100) / 144);

          //Mandar datos a la interfaz WEB
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

      
          //Esperamos hasta el siguiente ciclo
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

        //Iniciar LOOP de conexión al retro
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

      //Registrar daño al jugador P1 o P2
      async function damage($player, $damage, $hp, $percent) {
        let doneFinish = false;
        console.log("Jugador: "+$player+"   Daño: "+$damage+" HP:"+$hp+" "+$percent+"%");

        if($hp == 144){ 
          console.log("Comenzo la batalla"); 
          return;
        }else if($hp == 0){ 
          console.log("Finalizo la batalla"); 
          return;
        //Significa que acaba de perder el encuentro
        }else if($hp == 255){ 
          console.log("Perdio el jugador "+$player); 
          doneFinish = true;
        //Si el daño calculado es menor a 0 no hacer nada
        }else if($damage<0 || $hp == 0){ // $damage = -0 numero negativo de $damage y  $hp = 0 significa que se termino el encuentro y murio el jugador
          console.log("Ultimo golpe recibido en "+$player); 
          return;

        //Daño muy bajo, en teoria se cubrio el jugador pero esta recibiendo daño, pero ataques como el de bizon generan más  de 5 de daño por lo cual aunque se cubra lo detecta como daño
        //Lo correcto seria detectar en la RAM cuando esta cubierto el jugador y cancelar que se mueva el sensor
        }else if($damage <= 3){ 
          console.log("Daño demasiado  bajo: "+$damage+",  no se activara sensor de daño."); 
          return;
        }

        if($player == "P1"){
          console.log("Recibe ataque P1");      
          await damage_P1();
        

          if(doneFinish){    
            console.log("Activando  'FATALITY XD' a P2");   
            await sleep(100);
            servo1.to(90);
            await sleep(100);
            await damage_P1();

            await sleep(100);
            servo1.to(90);
            await sleep(100);
            await damage_P1();

            await sleep(100);
            servo1.to(90);
            await sleep(100);
            await damage_P1();

            await sleep(100);
            servo1.to(90);
            await sleep(100);
            await damage_P1();

            await sleep(100);
            servo1.to(90);
            await sleep(100);
            await damage_P1();       
          }
        }
        
        if($player == "P2"){
          console.log("Recibe ataque P2");     
          await damage_P2();

          if(doneFinish){    
            console.log("Activando  'FATALITY XD' a P1");   
            await sleep(100);
            servo1.to(90);
            await sleep(100);
            await damage_P2();

            await sleep(100);
            servo1.to(90);
            await sleep(100);
            await damage_P2();

            await sleep(100);
            servo1.to(90);
            await sleep(100);
            await damage_P2();

            await sleep(100);
            servo1.to(90);
            await sleep(100);
            await damage_P2();

            await sleep(100);
            servo1.to(90);
            await sleep(100);
            await damage_P2();       
          }
        }

        //Tiempo que le daremos al servo para regresar a su posición inicial
        await sleep(SERVO_INTERVAL_MS);  

        //Regresarlo a su posición inicial
        servo1.to(90);
      }


      async function damage_P1() {
        servo1.to(110);

        //Lanzar animación    
          if (mainWindow && !mainWindow.isDestroyed()) {
            console.log("Enviando animacion Electron:");
            
          mainWindow.webContents.send('show-hitP1', {
            player: 'P1',
            x: 0,
            y: 0
          });
        }
      }

      async function damage_P2() {
        servo1.to(70);

          //Lanzar animación
          if (mainWindow && !mainWindow.isDestroyed()) {
            console.log("Enviando animacion Electron:");
            
          mainWindow.webContents.send('show-hitP2', {
            player: 'P2',
            x: 0,
            y: 0
          });
        }
        
      }

    });

    board.on("error", (err) => {
      console.error("Error de conexión con el Arduino:", err.message);
    });

}





async function initArduino() {
  try {
    // Buscar de forma simple el primer puerto COM que no sea COM1

    const ports = await SerialPort.list();
    
    // COM1 suele ser el puerto serie nativo de la tarjeta madre.
    // Filtramos para tomar el puerto COM asignado al USB de tu Arduino (COM3, COM4, etc.)
    const targetPort = ports.find(p => p.path !== "COM1" && p.path.startsWith("COM"));

    if (!targetPort) {
      throw new Error("No se detectó ninguna placa conectada por puerto serie.");
    }

    console.log(`Conectando Johnny-Five a través de: ${targetPort.path}`);
     //Cargamos arduino en el puerto correcto
    loadArduino(targetPort.path);


  } catch (error) {
    console.error("Error al detectar puerto:", error.message);
  }
}

app.whenReady().then(() => {
  initArduino();
});
