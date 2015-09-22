var adapterModule = (function () {
	'use strict';

	// Role: takes gamepad inputs, converts them into Sphero signals, and sends via Bluetooth module.

	var radio = bluetoothModule,
		speed = 0,
		heading = 0,
		delta = 0;

	function sendCommand(inputs){
		// convert gamepad input to Sphero output:

		// Heading : First stick
		if(inputs.axes[0] > 0.15 || inputs.axes[0] < -0.15){ // threshold
			delta = Math.round(inputs.axes[0] * 10); // negative = turn left, positive = turn right
			heading = heading + delta;

			if(heading > 359){
				heading = 0;
			}

			if(heading < 0){
				heading = 359;
			}
		}

		// Forward : Right bottom shoulder
		speed = Math.round(inputs.buttons[7].value * 255);

		// Brake : Right top shoulder
		if(inputs.buttons[5].pressed){
			speed = 0;
		}

		// Send Sphero updates
		if(speed === 0){
			radio.send(roll(0, heading, 0)); // Commence optimal braking to zero speed
		} else {
			radio.send(roll(speed, heading, 1));
		}

		// Y yellow
		if(inputs.buttons[3].pressed){
			radio.send(changeColor(255, 255, 0));
		}

		// R red
		if(inputs.buttons[1].pressed){
			radio.send(changeColor(255, 0, 0));
		}

		// A green
		if(inputs.buttons[2].pressed){
			radio.send(changeColor(0, 0, 255));
		}

		// X blue
		if(inputs.buttons[0].pressed){
			radio.send(changeColor(0, 255, 0));
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
		send: sendCommand
	};
	
})();