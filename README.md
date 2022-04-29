# CONTROLL

Gamepad adapter app for Sphero robotic ball.

##  What is it?

The application let's you control your Sphero with a physical gamepad. Connect and pair the Sphero to your computer via bluetooth, plug in a gamepad, and drive your robotic ball using a classic RC control scheme.

## Installation

The application is wrapped as a Chrome app for access to Chrome.Bluetooth API. Install via Chrome webstore:
https://chrome.google.com/webstore/detail/controll/hbnkhjacnbnobebofnlmkpokijceafam

(In the near future we will have access to the 'Web Bluetooth API' that enable the browser to connect to a Bluetooth device - then we don't need the Chrome app wrapper anymore.

## App architecture
It's all very simple:

🎮 -> gamepad.js -> adapter.js -> bluetooth.js -> ⚪

#### gamepad.js
The gamepad module listen for gamepad controller inputs and broadcasts changes.

#### adapter.js
The adapter module receives gamepad input, convert it to commands for Sphero ball and sends it via bluetooth module.  

#### bluetooth.js
The bluetooth module keeps a socket connection to the Sphero and sends binary commands received from gamepad module.
