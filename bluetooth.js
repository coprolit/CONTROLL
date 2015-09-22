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

    var powered = false,
        socketId = 0,
        targetDevice = 0,
        uuid;
        //uuid = ''; // '00001101-0000-1000-8000-00805f9b34fb';

    function init(_uuid){
        uuid = _uuid;
        checkAdapter();
    }

    // Obtaining adapter state
    function checkAdapter(){
        chrome.bluetooth.getAdapterState(function(adapter) {
            //console.log("Adapter " + adapter.address + ": " + adapter.name);
            console.log("Adapter powered: " + adapter.powered);
            powered = adapter.powered;
            if(adapter.powered) getDevice();
        });
    }

    // Adapter notifications
    chrome.bluetooth.onAdapterStateChanged.addListener(function(adapter) {
        if (adapter.powered != powered) {
            powered = adapter.powered;
            if (powered) {
                //console.log("Adapter radio is on");
                getDevice();
            } else {
                console.log("Adapter radio is off. Please turn it on.");
            }
        }
    });

    function filterUUIDs(value){
        // step through uuids array for specified uuid
        return value === uuid;
    }

    function filterDevices(device) {
        // search for specified uuid in uuids array of device
        let resultArray = device.uuids.filter(function(val){
            return (val === uuid);
        });

        return (resultArray.length > 0);
    }

    function getDevice(){
        // Get a list of the devices known to the Bluetooth adapter
        // All devices are returned, including paired devices and devices recently discovered. It will not begin discovery of new devices
        chrome.bluetooth.getDevices(function(devices) {
            //console.log("devices", devices);
            targetDevice = devices.filter(filterDevices)[0];

            if(targetDevice){
                // adapter knows of the sphero
                console.log("adapter knows of the sphero");
                if(targetDevice.connected){
                    console.log("sphero already connected.");
                    onConnectionReady();
                } else {
                    console.log("sphero not connected.");
                    connect();
                }
            } else {
                console.log("no Sphero known. Turn on Sphero and pair it.");
            }
        });
    }

    // whenever a device is discovered by the adapter or makes a connection to the adapter
    chrome.bluetooth.onDeviceAdded.addListener(function(device) {
        console.log("device added", device.name);
        getDevice();
    });

    // Changes to devices, including previously discovered devices becoming paired
    chrome.bluetooth.onDeviceChanged.addListener(function(device) {
        console.log("device changed", device.name);
        getDevice();
    });
/*
    // whenever a paired device is removed from the system, or a discovered device has not been seen recently
    chrome.bluetooth.onDeviceRemoved.addListener(function(device) {
        console.log("device removed. You need to pair it.", device.name);
    });
*/

    // A socket to make the connection with
    chrome.bluetoothSocket.create(function(createInfo) {
        socketId = createInfo.socketId; // Keep a handle to the socketId so that we can later send data (bluetoothSocket.send) to this socket
    });

    var onConnectedCallback = function() {
        if (chrome.runtime.lastError) {
            console.log("Connection failed: " + chrome.runtime.lastError.message);
            var event = new Event('bluetooth:failed');
            window.dispatchEvent(event);
            //connect();
            // Now begin the discovery process.
            /*
            chrome.bluetooth.startDiscovery(function() {
                // Stop discovery after 30 seconds.
                setTimeout(function() {
                    chrome.bluetooth.stopDiscovery(function() {});
                }, 30000);
            });
            */
            setTimeout(connect, 1000);
        } else {
            onConnectionReady();
        }
    };

    // make a connection to a device:
    function connect(){
        console.log("attempting connection...");
        chrome.bluetoothSocket.connect(socketId, targetDevice.address, uuid, onConnectedCallback);
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

    /*
    chrome.bluetoothSocket.onReceive.addListener(function(receiveInfo) {
        if (receiveInfo.socketId != socketId)
            return;
        // receiveInfo.data is an ArrayBuffer.
    });
    */
    // To be notified of socket errors, including disconnection
    chrome.bluetoothSocket.onReceiveError.addListener(function(errorInfo) {
        // Cause is in errorInfo.error.
        console.log("socket error or disconnect", errorInfo.errorMessage);
        getDevice();
        var event = new Event('bluetooth:disconnected');
        window.dispatchEvent(event);
    });

    function onConnectionReady(){
        console.log("Sphero connected");
        var event = new Event('bluetooth:connected');
        window.dispatchEvent(event);
    }

    // hang up the connection and disconnect the socket before app closes:
    chrome.runtime.onSuspend.addListener(function() {
        console.log("force disconnect");
        chrome.bluetoothSocket.disconnect(socketId);
    });

    return {
        start: init,
        send: send
    };

})();