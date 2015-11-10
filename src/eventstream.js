/**
 * Created by Samuel on 7/11/2015.
 */

var http = require('http');
var util = require('util');
var EventEmitter = require('events');

var KEEPALIVE = 5 * 1000; //5 Seconds

function TextEvent(type, data) {
    this.getType = function() {
        return type;
    };

    this.getData = function() {
        return JSON.stringify(data);
    };
}

function EventStream(response) {
    var self = this;
    var isOpen = true;
    var keepaliveTimer = null;

    function sendKeepalive() {
        if(!isOpen) {
            return;
        }

        if (keepaliveTimer) {
            clearTimeout(keepaliveTimer);
        }
        keepaliveTimer = setTimeout(sendKeepalive, KEEPALIVE);

        response.write(':\n\n');
    }

    response.on('close', function() {
        isOpen = false;
        if(keepaliveTimer) {
            clearTimeout(keepaliveTimer);
        }
        self.emit('close');
    });

    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Access-Control-Allow-Origin", "*");
    sendKeepalive();

    self.send = function(event) {
        if(!isOpen) {
            return;
        }

        if(keepaliveTimer) {
            clearTimeout(keepaliveTimer);
        }
        keepaliveTimer = setTimeout(sendKeepalive, KEEPALIVE);

        var buf = '';
        buf += 'event:' + event.getType() + '\n';
        buf += 'data:' + event.getData() + '\n';
        buf += '\n';
        response.write(buf);
    };

    return self;
}
util.inherits(EventStream, EventEmitter);

function EventStreamer() {
    var self = this;
    var httpServer = http.createServer();
    httpServer.listen(80, 'localhost');

    httpServer.on('request', function(request, response) {
        self.emit('streamOpen', new EventStream(response));
    });
}
util.inherits(EventStreamer, EventEmitter);

exports.EventStreamer = EventStreamer;
exports.TextEvent = TextEvent;
