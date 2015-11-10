/**
 * Created by Samuel on 6/11/2015.
 */
'use strict';
var eventstream = require('./eventstream.js');
var trap = require('./trap.js');

var trapListener = new trap.TrapListener();
var eventStreamer = new eventstream.EventStreamer();

eventStreamer.on('streamOpen', function(eventStream) {
    eventStream.on('close', function() {
        console.log('Stream closed')
    });

    trapListener.on('trap', function(trap) {
        var event = new eventstream.TextEvent('trap', trap);
        eventStream.send(event);
    })
});