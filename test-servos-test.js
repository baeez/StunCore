const { Board, Servo } = require("johnny-five");

const board = new Board();

board.on("ready", () => {
  console.log("Arduino listo. Iniciando control de servos...");

  // Servo 1 en pin 9, Servo 2 en pin 10
  const servo1 = new Servo({ pin: 9, range: [0, 180], startAt: 90 });
  const servo2 = new Servo({ pin: 10, range: [0, 180], startAt: 90 });

  // Ejemplo: mover ambos servos a posiciones específicas
  servo1.to(0);
  servo2.to(180);

  // Ejemplo: barrido automático (sweep) de los dos servos
  // Descomenta si quieres que se muevan solos de un lado a otro
  //servo1.sweep({ range: [0, 180] });
  // servo2.sweep({ range: [0, 180] });

  // Control por teclado desde la consola (REPL de Johnny-Five)
  // Puedes escribir comandos directamente en la terminal mientras corre:
  //   servo1.to(45)
  //   servo2.to(120)
  board.repl.inject({
    servo1,
    servo2,
  });

  // Ejemplo de secuencia con temporizadores
  setTimeout(() => servo1.to(90), 2000);
  setTimeout(() => servo2.to(90), 2000);

  board.on("exit", () => {
    servo1.to(90);
    servo2.to(90);
  });
});

board.on("error", (err) => {
  console.error("Error de conexión con el Arduino:", err.message);
});