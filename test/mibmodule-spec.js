/**
 * Created by Samuel on 21/11/2015.
 */

var MibModule = require('../src/mib/mibmodule.js').MibModule;
var expect = require('expect.js');

describe("MibModule constructor", function () {
    var mibPath = "C:\\usr\\share\\snmp\\mibs\\IF-MIB.txt";
    var ifMib = null;

    beforeEach(function () {
        ifMib = new MibModule(mibPath);
    });

    it("has a definitions property", function () {
        expect(ifMib).to.have.property('definitions');
    });

    it("has a imports property", function () {
        expect(ifMib).to.have.property('imports');
    });

    it("has a name property which will be set to IF-MIB in this test", function () {
        expect(ifMib.name).to.be('IF-MIB');
    });

    describe("The definitions property", function () {
        it("contains a mapping of identifiers to definitions");

        it("should contain a definition for the ifInOctets object", function () {
            expect(ifMib.definitions).to.have.property("ifinOctets");
        });

    });

    describe("The imports property", function () {
        it("contains a mapping of module identifiers to the list of symbols imported from that module");
    })
});

