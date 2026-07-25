// test-firmata.js
const { Board } = require('firmata');

const PORT_PATH = '/dev/ttyACM0'; // ajusta si es diferente
const LED_PIN = 13; // LED integrado en la mayoría de Arduinos

const board = new Board(PORT_PATH);

board.on('ready', () => {
  console.log('✅ Arduino listo y respondiendo a Firmata');
  console.log(`Firmware: ${board.firmware.name} v${board.firmware.version.major}.${board.firmware.version.minor}\n`);

  board.pinMode(LED_PIN, board.MODES.OUTPUT);

  let estado = false;

  setInterval(() => {
    estado = !estado;
    board.digitalWrite(LED_PIN, estado ? board.HIGH : board.LOW);
    console.log(`💡 LED ${estado ? 'ENCENDIDO' : 'APAGADO'}`);
  }, 3000);
});

board.on('error', (err) => {
  console.error('❌ Error de conexión:', err.message);
});