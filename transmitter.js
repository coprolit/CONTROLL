var transmitterModule = (function (global) {
	var gamepad = global.gamePadModule;
	var sphero = global.sphero;
	var speed = 0;
	var heading = 0;
	var delta = 0;
	var interval;
	var hd, fw;
	
	// update loop...
	function startTransmitting(){
		//speed, heading, delta = 0;
		fw = global.document.getElementById("fw");
		hd = global.document.getElementById("hd");
		interval = setInterval(sendCommand, 100);
	}
	function stopTransmitting(){
		clearInterval(interval);
	}
	
	function sendCommand(){
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
				sphero.roll(0, heading, 0); // Commence optimal braking to zero speed
			} else {
				sphero.roll(speed, heading, 1);
			}
			
			// update UI
			hd.innerHTML = heading;
			fw.innerHTML = speed;
			
			// Y yellow
			if(gamepad.getInputs().buttons[3]){
				sphero.changeColor(255, 255, 0);
			}
			
			// R red
			if(gamepad.getInputs().buttons[1]){
				sphero.changeColor(255, 0, 0);
			}
			
			// A green
			if(gamepad.getInputs().buttons[2]){
				sphero.changeColor(0, 0, 255);
			}
			
			// X blue
			if(gamepad.getInputs().buttons[0]){
				sphero.changeColor(0, 255, 0);
			}
		} else {
			// no inputs = no controller connected
			global.publish("/gamepad/disconnected", ["disconnected"]);
		}
	}
	
	// Reveal public pointers to private functions and properties
	return {
		start: startTransmitting,
		stop: stopTransmitting
	};
	
})(this);