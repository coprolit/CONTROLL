var transmitterModule = (function () {
	'use strict';

	// Role: Converts gamepad inputs into Sphero signals and sends it via Bluetooth module.

	var gamepad = gamePadModule;
	var radio = bluetoothModule;
	var speed = 0;
	var heading = 0;
	var delta = 0;
	var interval;
	var hd, fw;
	
	// update loop...
	function startTransmitting(){
		console.log("startTransmitting()");
		//speed, heading, delta = 0;
		//fw = document.getElementById("fw");
		//hd = document.getElementById("hd");
		interval = setInterval(sendCommand, 100);
	}
	function stopTransmitting(){
		clearInterval(interval);
	}
	
	function sendCommand(){
		//console.log("sendCommand", gamepad.getInputs());
		if(gamepad.getInputs()){
			// convert gamepad input to Sphero output:
					
			// Heading : Second stick
			if(gamepad.getInputs().axes[2] > 0.15 || gamepad.getInputs().axes[2] < -0.15){ // threshold
				delta = Math.round(gamepad.getInputs().axes[2] * 10); // negative = turn left, positive = turn right
				heading = heading + delta;
				
				if(heading > 359){
					heading = 0;
				}
				
				if(heading < 0){
					heading = 359;
				}
			}
				
			// Forward : Left bottom shoulder
			speed = Math.round(gamepad.getInputs().buttons[6] * 255);
			
			// Brake : Right top shoulder
			if(gamepad.getInputs().buttons[5]){
				speed = 0;
			}
			
			// Send Sphero updates 
			if(speed === 0){
				radio.send(roll(0, heading, 0)); // Commence optimal braking to zero speed
			} else {
				radio.send(roll(speed, heading, 1));
			}
			
			// update UI
			//hd.innerHTML = heading;
			//fw.innerHTML = speed;
			
			// Y yellow
			if(gamepad.getInputs().buttons[3]){
				radio.send(changeColor(255, 255, 0));
			}
			
			// R red
			if(gamepad.getInputs().buttons[1]){
				radio.send(changeColor(255, 0, 0));
			}
			
			// A green
			if(gamepad.getInputs().buttons[2]){
				radio.send(changeColor(0, 0, 255));
			}
			
			// X blue
			if(gamepad.getInputs().buttons[0]){
				radio.send(changeColor(0, 255, 0));
			}
		} else {
			// no inputs = no controller connected
			publish("/gamepad/disconnected", ["disconnected"]);
		}
	}

	// Commands to control the Sphero:
	function changeColor(r, g, b) {
	 	return write(0x02, 0x20, 0x00, [r, g, b, 0]);
	}

	function setTailLight(bright) {
		return write(0x02, 0x21, 0x00, [bright]);
	}

	function setHeading(heading) {
	 	return write(0x02, 0x01, 0x00, [(heading >> 8), heading]);
	}

	function roll(speed, heading, go) {
	 	return write(0x02, 0x30, 0x00, [speed, (heading >> 8), heading, (go ? 1 : 0)]);
	}

	// convert to binary data:
	function write (did, cid, seq, data) {
		var buffer, view, check, i;
		//if (!current_device || !current_socket) { return; }
		buffer = new ArrayBuffer(7 + data.length);
		view = new Uint8Array(buffer);
		view[0] = 0xFF;
		view[1] = 0xFE;
		view[2] = did & 0xFF;
		view[3] = cid & 0xFF;
		view[4] = seq & 0xFF;
		view[5] = data.length + 1;
		for (i = 0; i < data.length; i++) {
			view[6 + i] = data[i] & 0xFF;
		}

		check = 0;
		for (i = 2; i <= 5 + data.length; i++) {
			check += view[i];
		}
		view[6 + data.length] = check & 0xFF ^ 0xFF;

		return buffer;
	}
	
	// Reveal public pointers to private functions and properties
	return {
		start: startTransmitting,
		stop: stopTransmitting
	};
	
})();