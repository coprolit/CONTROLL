(function () {
	"use strict";

	var deviceReady = false,
		gamepadReady = false,
		consoleEl = document.getElementById("status"),
		btnDisconnect = document.getElementById("btnDisconnect");

	function sendCommand(inputs) {
		if(deviceReady) adapterModule.send(inputs);
	}

	function updateStatus(txt) {
		consoleEl.innerHTML = txt; // "initiating..."
	}

	// Event subscriptions:

	// Bluetooth events
	window.addEventListener("bluetooth:connected", function(e) {
		deviceReady = true;
		if(!gamepadReady){
			updateStatus('Plug in gamepad and press <div class="btnColor blue">X</div> <div class="btnColor yellow">Y</div> <div class="btnColor green">A</div> or <div class="btnColor red">B</div>');
		} else {
			updateStatus('<img src="imgs/CONTROLL-mapping.png">');
		}
	});
	window.addEventListener("bluetooth:disconnected", function(e) {
		deviceReady = false;
	});
	window.addEventListener("bluetooth:status", function(e) {
		updateStatus(e.detail);
	});

	// Gamepad events
	window.addEventListener("gamepad:connected", function(e) {
		gamepadReady = true;
		if(deviceReady) updateStatus('<img src="imgs/CONTROLL-mapping.png">');
	});
	window.addEventListener("gamepad:disconnected", function(e) {
		gamepadReady = false;
		updateStatus("Plug in gamepad.");
	});
	window.addEventListener("gamepad:update", function(e) {
		sendCommand(e.detail);
	});

	/*
	function statusUpdate(type, message, color){
		var el;
		
		switch(type)
		{
		case "gamepad":
			el = document.getElementById("statusGamepad");
			break;
		case "sphero":
			el = document.getElementById("statusSphero");
			break;
		case "transmit":
			el = document.getElementById("statusTransmit");
			break;
		default:
			//code to be executed
		}

		if(message.length > 0){
			var p = el.getElementsByTagName("p")[0];
			p.innerHTML = message;
			p.style.backgroundColor = color;
		}
	}
	*/
	//gamePadModule.start(); // start listening for gamepad.
	bluetoothModule.start('00001101-0000-1000-8000-00805f9b34fb'); // connect to Sphero device.

	updateStatus("Warming up...")
}());