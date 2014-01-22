var gamePadModule = (function (global) {
	var
		gamepad = false,
		prevTimestamp,
		ticking = false,
		connected = true;
	
	/**
	 * Starts a polling loop to check for gamepad state.
	 */
	function startPolling() {		
		// Don't accidentally start a second loop.
		if (!ticking) { 
			ticking = true;
			tick();
		}
	}

	/**
	 * Stops a polling loop by setting a flag which will prevent the next
	 * requestAnimationFrame() from being scheduled.
	 */
	function stopPolling() {
		ticking = false;
	}

	/**
	 * A function called with each requestAnimationFrame(). Polls the gamepad
	 * status and schedules another poll.
	 */  
	function tick() {
		pollStatus();
		scheduleNextTick();
	}

	function scheduleNextTick() {
	  // Only schedule the next frame if we haven't decided to stop via stopPolling() before.
		if (ticking) {
			if (window.requestAnimationFrame) {
				window.requestAnimationFrame(tick);
			} else if (window.mozRequestAnimationFrame) {
				window.mozRequestAnimationFrame(tick);
			} else if (window.webkitRequestAnimationFrame) {
				window.webkitRequestAnimationFrame(tick);
			}
			// Note lack of setTimeout since all the browsers that support Gamepad API are already supporting requestAnimationFrame().
		}    
	}

	/**
	 * Checks for the gamepad status. Monitors the necessary data and notices
	 * the differences from previous state. If differences are noticed, sends updates accordingly.
	 */
	 
	function pollStatus() {
		gamepad = navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0];
		if(gamepad){
			// If current timestamp == previous one, then the state of the gamepad hasn't changed and there is no need to update.
			if (prevTimestamp && (gamepad.timestamp == prevTimestamp)) {
				return;
			}
			
			prevTimestamp = gamepad.timestamp;
			
			if(!connected){
				global.publish("/gamepad/connected", ["connected"]);
				connected = true;
			}
		} else {
			if(connected){
				global.publish("/gamepad/disconnected", ["disconnected"]);
				connected = false;
			}
		}
	}
	
	// Reveal public pointers to private functions and properties
	return {
		start: startPolling,
		stop: stopPolling,
		getInputs: function() { return gamepad; }
	};
	
})(this);