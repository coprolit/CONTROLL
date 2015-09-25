var gamePadModule = (function() {
	var gamepad = false,
		prevTimestamp = null,
		ticking = false;

	window.addEventListener("gamepadconnected", function(e) {
		gamepad = navigator.getGamepads()[e.gamepad.index];

		var event = new Event('gamepad:connected');
		window.dispatchEvent(event);

		startPolling();
	});
	window.addEventListener("gamepaddisconnected", function(e) {
		var event = new Event('gamepad:disconnected');
		window.dispatchEvent(event);

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

			var event = new CustomEvent('gamepad:update', { 'detail': _gamepad });
			window.dispatchEvent(event); // emit that gamepad state has changed
		}
	}
	
	// Reveal public pointers to private functions and properties
	return {
		start: startPolling,
		stop: stopPolling
	};
	
})();