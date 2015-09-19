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
        device = 0,
        uuid = ''; // '00001101-0000-1000-8000-00805f9b34fb';

    // Obtaining adapter state
    function checkAdapter(){
        chrome.bluetooth.getAdapterState(function(adapter) {
            //console.log("Adapter " + adapter.address + ": " + adapter.name);
            console.log("Adapter powered: " + adapter.powered);
            powered = adapter.powered;
            if(adapter.powered) getDevice();
        });

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
    }

    function filterByUUID(obj) {
        return !!('uuids' in obj && obj.uuids[0] === uuid); // search for Sphero uuid
    }

    function getDevice(){
        // Get a list of the devices known to the Bluetooth adapter
        // All devices are returned, including paired devices and devices recently discovered. It will not begin discovery of new devices
        chrome.bluetooth.getDevices(function(devices) {
            var spheroDevice = devices.filter(filterByUUID);

            if(spheroDevice.length > 0){
                // adapter knows of the sphero
                console.log("adapter knows of the sphero");
                if(spheroDevice.connected){
                    onConnectionReady();
                } else {
                    console.log("sphero not connected. Connecting...");
                    connect(spheroDevice[0]);
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
/*
    // Changes to devices, including previously discovered devices becoming paired
    chrome.bluetooth.onDeviceChanged.addListener(function(device) {
        console.log("device changed", device.name);
    });

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
            console.log("cannot connect to Sphero. Make sure it is turned on and in range.")
            connect();
        } else {
            onConnectionReady();
        }
    };

    // hang up the connection and disconnect the socket before app closes:
    chrome.runtime.onSuspend.addListener(function() {
        console.log("disconnect");
        chrome.bluetoothSocket.disconnect(socketId);
    });

    // make a connection to a device:
    function connect(device){
        chrome.bluetoothSocket.connect(socketId, device.address, uuid, onConnectedCallback);
    }

    function send(){
        var arrayBuffer = write(0x02, 0x20, 0x00, [255, 255, 0, 0]);

        chrome.bluetoothSocket.send(socketId, arrayBuffer, function(bytes_sent) {
            if (chrome.runtime.lastError) {
                console.log("Send failed: " + chrome.runtime.lastError.message);
            } else {
                console.log("Sent " + bytes_sent + " bytes")
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
        console.log("socket error", errorInfo.errorMessage);
        getDevice();
    });

    function write (did, cid, seq, data, callback) {
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

    function onConnectionReady(){
        console.log("connection succes!");
    }

    // Functions to actually control the sphero
    /*
    this.changeColor = function (r, g, b, callback) {
        write(0x02, 0x20, 0x00, [r, g, b, 0], callback);
    };

    this.setTailLight = function (bright, callback) {
        write(0x02, 0x21, 0x00, [bright], callback);
    };

    this.setHeading = function (heading, callback) {
        write(0x02, 0x01, 0x00, [(heading >> 8), heading], callback);
    };

    this.roll = function (speed, heading, go, callback) {
        write(0x02, 0x30, 0x00, [speed, (heading >> 8), heading, (go ? 1 : 0)], callback);
    };
    */

    // Reveal public pointers to private functions and properties
    return {
        start: checkAdapter,
        send: send
    };

})();