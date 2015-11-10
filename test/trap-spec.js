/**
 * Created by Samuel on 7/11/2015.
 */

var Trap = require('../src/trap.js').Trap;
var expect = require('expect.js');

describe("Trap constructor", function () {
    var testMsg = new Buffer([48,65,2,1,0,4,6,112,117,98,108,105,99,164,52,6,10,43,6,1,4,1,191,8,2,3,1,64,4,169,254,32,141,2,1,6,2,1,17,67,5,0,206,131,17,137,48,19,48,17,6,10,43,6,1,4,1,191,8,2,1,1,2,3,1,226,64]);
    var testRinfo = {"address":"192.168.2.10","family":"IPv4","port":65068,"size":67};
    var trap = null;

    beforeEach(function() {
        trap = new Trap(testMsg, testRinfo)
    });

    it("should have a sender property", function() {
        expect(trap.sender).to.be('192.168.2.10')
    });

    it("should have a version property", function() {
        expect(trap.version).to.be('1');
    });

    it("should have a community property", function () {
        expect(trap.community).to.be('public');
    });

    it("should have a data property", function () {
        expect(trap).to.have.property('data');
    });

    it("should have the enterprise OID in the data", function () {
        expect(trap.data.enterpriseOid).to.be('1.3.6.1.4.1.8072.2.3.1');
    });

    it("should have the agent address in the data", function () {
        expect(trap.data.agentAddr).to.be('169.254.32.141');
    });

    it("should have the generic trap in the data", function () {
        expect(trap.data.genericTrap).to.be(6);
    });

    it("should have the specific trap in the data", function () {
        expect(trap.data.specificTrap).to.be(17);
    });

    it("should have the timeticks in the data", function () {
        expect(trap.data.timeTicks).to.be(3464696201);
    });

    it("should have a varbindlist in the data", function () {
        expect(trap.data).to.have.property('varBindList');
    });

    it("should correctly parse the varbindlist", function () {
        expect(trap.data.varBindList).to.eql({
            '1.3.6.1.4.1.8072.2.1.1': {
                type: 'Integer32',
                value: 123456
            }
        })
    })
});