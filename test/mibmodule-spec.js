/**
 * Created by Samuel on 21/11/2015.
 */

var MibModule = require('../src/mib/mibmodule.js').MibModule;

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
        expect(ifMib.to.have.property('imports'));
    });

    describe("The definitions property", function () {
       it("contains a mapping of identifiers to definitions");
    });

    describe("The imports property", function () {
        it("contains a mapping of module identifiers to the list of symbols imported from that module");
    })
});

