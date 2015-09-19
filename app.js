(function () {
	"use strict";

	var
		//sphero = sphero,
		btnDisconnect = document.getElementById("btnDisconnect");

	bluetoothModule.start();
/*
	if (!sphero) {
		statusUpdate("sphero", "Sphero API not loaded", "red");
		return;
	}
*/
	statusUpdate("sphero", "Waiting for Sphero API to become ready...", "yellow");
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
	//subscribe
    var gamepadConnectedHandler = subscribe("/gamepad/connected", function(msg){
		statusUpdate("gamepad", "Ready", "limegreen");
		if(!!sphero.getDevice()){ // no Sphero connected == no need to transmit commands
			transmitterModule.start();
			statusUpdate("transmit", "", "limegreen");
		}
    });
	var gamepadDisconnectedHandler = subscribe("/gamepad/disconnected", function(msg){
		transmitterModule.stop();
		statusUpdate("transmit", "", "gray");
		statusUpdate("gamepad", "Connect gamepad and press a coloured button to activate it.", "yellow");
    });
	
	function initGamePadControls(){
		var gamepadSupportAvailable = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;
		if(gamepadSupportAvailable){
			gamePadModule.start();
		} else {
			statusUpdate("gamepad", "Gamepad support unavailable", "red");
		}
	}
	
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
	
	initGamePadControls();
	
}());