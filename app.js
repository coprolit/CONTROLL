(function () {
	"use strict";

	var deviceReady = false,
		gamepadReady = false,
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
	function sendCommand() {
		console.log('sendCommand()');
		if(deviceReady) console.log("device connected");
		//if(gamepadReady) console.log("gamepad connected");
		if(deviceReady) adapterModule.send(gamePadModule.getInputs());
	}

	// Event subscriptions:

	// Bluetooth events
    subscribe("/bluetooth/connected", function(msg){
		deviceReady = true;
		//initTransmitter();
	});
	subscribe("/bluetooth/disconnected", function(msg){
		console.log("device disconnected");
		deviceReady = false;
		//transmitterModule.stop();
	});
	subscribe("/bluetooth/status", function(msg){
		console.log(msg);
	});

	// Gamepad events
	window.addEventListener("gamepadupdate", function(e) {
		console.log('gamepad update');
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