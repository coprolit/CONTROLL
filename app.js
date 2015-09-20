(function () {
	"use strict";

	var deviceReady = false,
		gamepadReady = false,
		//sphero = sphero,
		btnDisconnect = document.getElementById("btnDisconnect");


/*
	if (!sphero) {
		statusUpdate("sphero", "Sphero API not loaded", "red");
		return;
	}
*/
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
	function initTransmitter() {
		if(deviceReady && gamepadReady) transmitterModule.start();
	}

	// Event subscriptions:

	// Bluetooth events
    subscribe("/bluetooth/connected", function(args){
		deviceReady = true;
		initTransmitter();
	});
/*
    subscribe("/bluetooth/status", function(args){
		var status = args[0];
		var msg = args[1];
		console.log("status", status);
		if(status === "success"){
			//console.log(msg);
			console.log('deviceReady = true');
			deviceReady = true;
			initTransmitter();
		}
		if(status === "alert"){
			console.log(msg);
			deviceReady = false;
			transmitterModule.stop();
		}
    });
*/
	// Gamepad events
	subscribe("/gamepad/connected", function(msg){
		//console.log("gamepad connected");
		console.log('gamepadReady = true');
		gamepadReady = true;
		initTransmitter();
    });
	subscribe("/gamepad/disconnected", function(msg){
		console.log("gamepad disconnected");
		gamepadReady = false;
		transmitterModule.stop();
		//statusUpdate("gamepad", "Connect gamepad and press a coloured button to activate it.", "yellow");
    });
	/*
	function initGamePadControls(){
		var gamepadSupportAvailable = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;
		if(gamepadSupportAvailable){
			gamePadModule.start();
		} else {
			console.log("gamepad support unavailable");
			//statusUpdate("gamepad", "Gamepad support unavailable", "red");
		}
	}
	*/
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
	//initGamePadControls(); // start listening for gamepad.
	bluetoothModule.start('00001101-0000-1000-8000-00805f9b34fb'); // start listening for Sphero device.
	
}());