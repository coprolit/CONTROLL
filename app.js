(function () {
	"use strict";

	var deviceReady = false,
		btnDisconnect = document.getElementById("btnDisconnect");

	//statusUpdate("sphero", "Waiting for Sphero API to become ready...", "yellow");
	/*
	sphero.onReady.add(function (){
		var devices;
		statusUpdate("sphero", "Sphero API ready, searching for devices...", "yellow");
		
		devices = sphero.getDevices();
		if (devices.length > 0) {
			statusUpdate("sphero", "Paired device found", "yellow");
			
			sphero.connect(0, function (error) {
				if (!!error) {
					statusUpdate("sphero", error, "red");
				} else {
					statusUpdate("sphero", "Ready", "limegreen");
					
					btnDisconnect.onclick = function(){
						sphero.disconnect();
						statusUpdate("sphero", "Offline", "grey");
					};
				}
			});
		} else {
			statusUpdate("sphero", "No devices found, make sure to pair with your Sphero first, then restart this app.", "red");
		}
	});
*/
	function sendCommand(inputs) {
		if(deviceReady) adapterModule.send(inputs);
	}

	// Event subscriptions:

	// Bluetooth events
	window.addEventListener("bluetooth:connected", function(e) {
		deviceReady = true;
	});
	window.addEventListener("bluetooth:disconnected", function(e) {
		deviceReady = false;
	});
	window.addEventListener("bluetooth:failed", function(e) {
		console.log("cannot connect to Sphero. Make sure it is turned on and in range.");
	});

	/*
    subscribe("/bluetooth/connected", function(msg){
		deviceReady = true;
	});
	subscribe("/bluetooth/disconnected", function(msg){
		deviceReady = false;
	});
	subscribe("/bluetooth/status", function(msg){
		console.log(msg);
	});
	*/

	// Gamepad events
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
	
}());