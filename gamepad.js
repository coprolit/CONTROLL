var gamePadModule = (function() {
	var
		gamepad = false,
		prevTimestamp = null,
		ticking = false,
		connected = true,
		event = new Event('gamepadupdate');

	window.addEventListener("gamepadconnected", function(e) {
		gamepad = navigator.getGamepads()[e.gamepad.index];
		//connected = true;
		console.log("Gamepad connected");
		startPolling();
		//console.log("Gamepad connected at index " + gp.index + ": " + gp.id + ". It has " + gp.buttons.length + " buttons and " + gp.axes.length + " axes.");
	});
	window.addEventListener("gamepaddisconnected", function(e) {
		console.log("Gamepad disconnected from index %d: %s", e.gamepad.index, e.gamepad.id);
		//connected = false;
		stopPolling();
	});
	
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
		if (ticking) { // Only schedule the next frame if we haven't decided to stop via stopPolling() before.
			window.requestAnimationFrame(tick);
		}
	}

	/**
	 * Checks for the gamepad status. Monitors the necessary data and notices
	 * the differences from previous state. If differences are noticed, sends updates accordingly.
	 */
	 
	function pollStatus() {
		_gamepad = navigator.getGamepads()[0];

		if(_gamepad){
			// If current timestamp == previous one, then the state of the gamepad hasn't changed and there is no need to update.
			if (prevTimestamp && (_gamepad.timestamp === prevTimestamp)) {
				return;
			}

			prevTimestamp = _gamepad.timestamp;

			window.dispatchEvent(event); // emit that gamepad state has changed
		}
	}
	
	// Reveal public pointers to private functions and properties
	return {
		start: startPolling,
		stop: stopPolling,
		getInputs: function() { return gamepad; }
	};
	
})();