/**
 * Created by philippe_simpson on 17/09/15.
 */

(function() {
    "use strict";

    var powered = false,
        socketId = 0,
        device = 0,
        uuid = '00001101-0000-1000-8000-00805f9b34fb';

    // Obtaining adapter state
    chrome.bluetooth.getAdapterState(function(adapter) {
        console.log("Adapter " + adapter.address + ": " + adapter.name);
        console.log("Adapter powered: " + adapter.powered);
        powered = adapter.powered;
        if(adapter.powered) getDevices();
    });

    // Adapter notifications
    chrome.bluetooth.onAdapterStateChanged.addListener(function(adapter) {
        if (adapter.powered != powered) {
            powered = adapter.powered;
            if (powered) {
                console.log("Adapter radio is on");
                getDevices();
            } else {
                console.log("Adapter radio is off. Please turn it on.");
            }
        }
    });

    function getDevices(){
        // Get a list of the devices known to the Bluetooth adapter
        // All devices are returned, including paired devices and devices recently discovered. It will not begin discovery of new devices
        chrome.bluetooth.getDevices(function(devices) {
            for (var i = 0; i < devices.length; i++) {
                console.log("known devices", devices[i].name, devices[i].address);
                console.log("paired", devices[i].paired);
                console.log("connected", devices[i].connected);
                if(!devices[i].connected) connect(devices[0]);
            }
        });
    }

    // whenever a device is discovered by the adapter or makes a connection to the adapter
    chrome.bluetooth.onDeviceAdded.addListener(function(device) {
        console.log("device added", device.address);
    });

    // Changes to devices, including previously discovered devices becoming paired
    chrome.bluetooth.onDeviceChanged.addListener(function(device) {
        console.log("device changed", device.address);
    });

    // whenever a paired device is removed from the system, or a discovered device has not been seen recently
    chrome.bluetooth.onDeviceRemoved.addListener(function(device) {
        console.log("device removed", device.address);
    });


    // make a connection to a device:

    // A socket to make the connection with
    var onConnectedCallback = function() {
        if (chrome.runtime.lastError) {
            console.log("Connection failed: " + chrome.runtime.lastError.message);
        } else {
            // Profile implementation here.
            console.log("Connection success: ");
            send();
        }
    };

    function connect(device){
        chrome.bluetoothSocket.create(function(createInfo) {
            socketId = createInfo.socketId; // Keep a handle to the socketId so that we can later send data (bluetoothSocket.send) to this socket
            chrome.bluetoothSocket.connect(createInfo.socketId,
                device.address, uuid, onConnectedCallback);
        });
    }

    function send(){
        var arrayBuffer = write(0x02, 0x20, 0x00, [r, g, b, 0]);

        chrome.bluetoothSocket.send(socketId, arrayBuffer, function(bytes_sent) {
            if (chrome.runtime.lastError) {
                console.log("Send failed: " + chrome.runtime.lastError.message);
            } else {
                console.log("Sent " + bytes_sent + " bytes")
            }
        })
    }
    /*
    chrome.bluetoothSocket.onRecieve.addListener(function(receiveInfo) {
        if (receiveInfo.socketId != socketId)
            return;
        // receiveInfo.data is an ArrayBuffer.
    });

    // To be notified of socket errors, including disconnection
    chrome.bluetoothSocket.onReceiveError.addListener(function(errorInfo) {
        // Cause is in errorInfo.error.
        console.log(errorInfo.errorMessage);
    });

    // hang up the connection and disconnect the socket
    // chrome.bluetoothSocket.disconnect(socketId);
    */

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
        /*
        bt.write({"socket": current_socket, "data": buffer}, function (r) {
            if (!!callback) {
                try { callback(); } catch (e) {
                    con.log("Error calling connect callback", e);
                }
            }
        });
        */
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

}());