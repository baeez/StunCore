# 🥊 StunCore

### Sistema háptico para **Street Fighter II + RetroArch + Arduino**

StunCore es un software para Windows que conecta **RetroArch** con un dispositivo háptico basado en **Arduino** y complementos.

El programa detecta cuando estás jugando **Street Fighter II** en RetroArch y convierte determinados eventos del juego en señales para el Arduino, permitiendo generar **efectos físicos/hápticos** durante el combate.

---

## 🎮 ¿Cómo funciona?

```text
┌──────────────────────┐
│      RETROARCH       │
│                      │
│   Street Fighter II  │
└──────────┬───────────┘
           │
           │ Información del juego
           ▼
┌──────────────────────┐
│       STUNCORE       │
│       Windows        │
└──────────┬───────────┘
           │
           │ USB / Puerto COM
           ▼
┌──────────────────────┐
│       ARDUINO        │
└──────────┬───────────┘
           │
           │ Señales
           ▼
┌──────────────────────┐
│   SISTEMA HÁPTICO    │
│                      │
│ Toques / Impacto  │
└──────────────────────┘
```

StunCore funciona como intermediario entre RetroArch y Arduino:

**Street Fighter II → RetroArch → StunCore → Arduino → Efecto háptico**

---

# ⬇️ Descargar

## 🚀 StunCore v1.0.0

### 👉 [⬇️ Descargar StunCore v1.0.0](https://github.com/baeez/StunCore/releases/tag/v1.0.0)

> **No necesitas compilar el proyecto** para utilizar la versión ejecutable.

Simplemente descarga la versión disponible en **Releases** y ejecuta el archivo correspondiente.

---

# ✨ Características

* 🥊 Integración con **Street Fighter II**
* 🎮 Integración con **RetroArch**
* 🤖 Control de Arduino mediante USB
* 💥 Generación de efectos hápticos
* 🔌 Comunicación mediante puerto COM
* 🖥️ Aplicación para Windows
* 🧩 Proyecto de código abierto

---

# 🛠️ Requisitos

## Hardware

* PC con Windows
* Arduino compatible
* Cable USB para Arduino
* Sistema/dispositivo háptico compatible con el proyecto

## Software

* [RetroArch](https://www.retroarch.com/)
* Street Fighter II
* StunCore

---

# 📥 Instalación

### 1. Descargar StunCore

Descarga la última versión desde:

👉 https://github.com/baeez/StunCore/releases

O descarga directamente la versión **v1.0.0**:

👉 https://github.com/baeez/StunCore/releases/tag/v1.0.0

---

### 2. Conectar Arduino

Conecta el Arduino a tu PC mediante USB.

Windows debería asignarle un puerto COM, por ejemplo:

```text
COM3
COM4
COM5
```

---

### 3. Preparar RetroArch

Instala y configura RetroArch.

Carga **Street Fighter II** y asegúrate de que el juego funcione correctamente antes de iniciar StunCore.

---

### 4. Ejecutar StunCore

Ejecuta:

```text
StunCore.exe
```

StunCore establecerá la comunicación con el Arduino y comenzará a recibir la información necesaria para controlar el sistema háptico.

---

### 5. Jugar

Inicia **Street Fighter II** desde RetroArch.

Cuando se produzcan los eventos compatibles con StunCore, el programa enviará las señales correspondientes al Arduino.

---

# 🤖 Arduino

El Arduino debe tener instalado el firmware correspondiente al proyecto.

La comunicación entre StunCore y Arduino se realiza mediante:

```text
PC
 │
 │ USB
 ▼
Arduino
 │
 │ Señales de control
 ▼
Sistema háptico
```

> ⚠️ **Importante:** asegúrate de utilizar correctamente las conexiones eléctricas de tu hardware antes de utilizar el sistema.

---

# 🎮 RetroArch

StunCore utiliza RetroArch como plataforma para ejecutar Street Fighter II y obtener la información necesaria para generar los efectos hápticos.

La configuración de RetroArch es importante para que StunCore pueda comunicarse correctamente con el juego.

Consulta la documentación del proyecto para conocer la configuración específica requerida.

---

# 🧪 Proyecto

StunCore es un proyecto de código abierto creado para experimentar con la integración entre:

* Videojuegos
* RetroArch
* Arduino
* Electrónica
* Sistemas hápticos

El objetivo es transformar eventos que ocurren dentro del videojuego en **feedback físico en el mundo real**.

---

# 🐛 Reportar problemas

¿Encontraste un error o StunCore no funciona correctamente?

Puedes abrir un **Issue** en GitHub:

👉 https://github.com/baeez/StunCore/issues

Cuando reportes un problema, intenta incluir:

* Versión de StunCore
* Versión de Windows
* Modelo de Arduino
* Puerto COM utilizado
* Versión de RetroArch
* Versión de Street Fighter II
* Mensaje de error
* Pasos necesarios para reproducir el problema

---

# 💡 Contribuir

¿Quieres mejorar StunCore?

Puedes:

* Reportar errores
* Proponer nuevas características
* Mejorar el código
* Mejorar la documentación
* Crear Pull Requests

Repositorio:

👉 https://github.com/baeez/StunCore

---

# 📦 Releases

Las versiones compiladas de StunCore se publican en:

👉 https://github.com/baeez/StunCore/releases

Las versiones etiquetadas como **Release** están destinadas a usuarios que simplemente quieren descargar y utilizar el programa sin necesidad de compilar el código fuente.

---

# 📄 Licencia

Este proyecto utiliza la siguiente licencia:

```text
MIT License
```

Consulta el archivo `LICENSE` incluido en el repositorio para conocer los términos de uso, modificación y distribución.

---

# 👨‍💻 Autor

**Edgar Báez**

GitHub:

👉 https://github.com/baeez

---

<div align="center">

### 🥊 Street Fighter II + Arduino + Haptic Feedback

**StunCore v1.0.0**

Made with ❤️ and Arduino

</div>
