/**
 * Created by philippe_simpson on 17/09/15.
 */

var bluetoothModule = (function() {
    "use strict";
    /*
    Role: handle all Bluetooth related logic.

    1. check host adapter radio is powered on
        else: alert user to turn on bt radio
    2. check known/paired devices on adapter for Sphero
        - else search
            - alert user to turn on Sphero
    3. check if Sphero is connected
        - else connect
    4. broadcast 'connection:on' to app.
    */

    var socketId = 0,
        targetDevice = 0,
        uuid;

    function init(_uuid){
        uuid = _uuid;
        checkAdapter();
    }

    // Adapter notifications
    chrome.bluetooth.onAdapterStateChanged.addListener(function(adapter) {
        if(adapter.powered) {
            getDevice();
        } else {
            var event = new CustomEvent('bluetooth:status', {'detail': 'Turn on Bluetooth.' });
            window.dispatchEvent(event);
        }
    });

    // whenever a device is discovered by the adapter or makes a connection to the adapter
    chrome.bluetooth.onDeviceAdded.addListener(function(device) {
        getDevice();
    });
/*
    // Changes to devices, including previously discovered devices becoming paired
    chrome.bluetooth.onDeviceChanged.addListener(function(device) {
        console.log("device changed", device.name);

        getDevice();
    });
*/
    // whenever a paired device is unpaired
    chrome.bluetooth.onDeviceRemoved.addListener(function(device) {
        var event = new CustomEvent('bluetooth:status', {'detail': 'Device lost. Pair Sphero to continue.' });
        window.dispatchEvent(event);

        getDevice();
    });

    // To be notified of socket errors, including disconnection
    chrome.bluetoothSocket.onReceiveError.addListener(function(errorInfo) {
        // Cause is in errorInfo.error.
        //console.log("socket error or disconnect", errorInfo.errorMessage);
        var event = new Event('bluetooth:disconnected');
        window.dispatchEvent(event);

        getDevice();
    });

    // Obtaining adapter state
    function checkAdapter(){
        chrome.bluetooth.getAdapterState(function(adapter) {
            if(adapter.powered){
                getDevice();
            } else {
                var event = new CustomEvent('bluetooth:status', {'detail': 'Turn on Bluetooth.' });
                window.dispatchEvent(event);
            }
        });
    }

    function filterDevices(device) {
        // search for specified uuid in uuids array of device
        let resultArray = device.uuids.filter(function(val){
            return (val === uuid);
        });
        return (resultArray.length > 0);
    }

    function getDevice(){
        // Get a list of the devices known (including paired and recently discovered) to the host adapter
        chrome.bluetooth.getDevices(function(devices) {
            targetDevice = devices.filter(filterDevices)[0];
            if(targetDevice){ // adapter knows of the sphero
                connect();
            } else { // adapter don't know of the Sphero
                var event = new CustomEvent('bluetooth:status', {'detail': 'Pair Sphero to continue.' });
                window.dispatchEvent(event);
            }
        });
    }

    var onConnectedCallback = function() {
        if (chrome.runtime.lastError) {
            //console.log("Connection failed: " + chrome.runtime.lastError.message);
            var event = new CustomEvent('bluetooth:status', {'detail': 'Could not connect. Wake up Sphero to continue.' });
            window.dispatchEvent(event);
            setTimeout(connect, 5000);
        } else {
            onConnectionReady();
        }
    };

    // make a connection to a device:
    function connect(){
        var event = new CustomEvent('bluetooth:status', {'detail': 'Connecting Sphero...' });
        window.dispatchEvent(event);

        //chrome.bluetoothSocket.disconnect(socketId);
        // A socket to make the connection with
        chrome.bluetoothSocket.create(function(createInfo) {
            socketId = createInfo.socketId; // Keep a handle to the socketId so that we can later send data (bluetoothSocket.send) to this socket

            chrome.bluetoothSocket.connect(socketId, targetDevice.address, uuid, onConnectedCallback);
        });
    }

    function send(arrayBuffer){
        //var arrayBuffer = write(0x02, 0x20, 0x00, [255, 255, 0, 0]);
        chrome.bluetoothSocket.send(socketId, arrayBuffer, function(bytes_sent) {
            if (chrome.runtime.lastError) {
                console.log("Send failed: " + chrome.runtime.lastError.message);
            } else {
                //console.log("Sent " + bytes_sent + " bytes")
            }
        })
    }

    function onConnectionReady(){
        var event = new Event('bluetooth:connected');
        window.dispatchEvent(event);
        console.log("onConnectionReady(): Sphero connected");
    }

    // hang up the connection and disconnect the socket before app closes:
    chrome.runtime.onSuspend.addListener(function() {
        chrome.bluetoothSocket.disconnect(socketId); // force disconnect
    });

    return {
        start: init,
        send: send
    };

})();