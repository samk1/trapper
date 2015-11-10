/**
 * Created by Samuel on 7/11/2015.
 */

var util = require('util');
var dgram = require('dgram');
var Ber = require('asn1').Ber;
var ip = require('ip');
var EventEmitter = require('events');

var RFC1155_SMI = {
    IpAddress: 64,
    Counter: 65,
    Gauge: 66,
    TimeTicks: 67,
    Opaque: 68
};

Ber.Reader.prototype.readIpAddress = function() {
    var value = this._readTag(RFC1155_SMI.IpAddress);
    return ip.fromLong(value);
};

Ber.Reader.prototype.readTimeTicks = function() {
    return this._readTag(RFC1155_SMI.TimeTicks);
};

function Trap(msg, rinfo) {
    var self = this;
    var reader = new Ber.Reader(msg);
    reader.readSequence();
    var version = reader.readInt();

    if(version === 0) {
        self.version = '1';
        self.community = reader.readString();
        self.sender = rinfo.address;
        self.data = {};

        reader.readSequence();
        self.data.enterpriseOid = reader.readOID();
        self.data.agentAddr = reader.readIpAddress();
        self.data.genericTrap = reader.readInt();
        self.data.specificTrap = reader.readInt();
        self.data.timeTicks = reader.readTimeTicks();
    }
    //TODO: parse trap

    return self;
}

function TrapListener() {
    var self = this;

    var socket = dgram.createSocket('udp4');
    socket.bind(162);
    socket.on('message', function (msg, rinfo) {
        self.emit('trap', new Trap(msg, rinfo));
    });
}
util.inherits(TrapListener, EventEmitter);

exports.TrapListener = TrapListener;
exports.Trap = Trap;