/**
 * Created by Samuel on 21/11/2015.
 */

var MibRepo = require('../src/mib/mibrepo.js').MibRepo;
var MibModule = require('../src/mib/mibmodule.js').MibModule;
var expect = require('expect.js');

//Test mib repository mib path
var path = "C:\\usr\\share\\snmp\\mibs"; //path to test mibs
describe("MibRepo prototype", function () {
    var testMibRepo = null;

    beforeEach(function () {
        testMibRepo = new MibRepo(path);
    });

    describe("Constructor", function () {
        it("should take a string argument containing the path to search for mib files", function () {
            expect(new MibRepo(path)).not.to.be(null);
        });

        it("should take an array argument containing a list of paths to search",function () {
            expect(new MibRepo([path])).not.to.be(null);
        });
    });

    //returns all modules names that were parsed
    describe("getModuleNames function", function () {
    });

    //Returns all object names in module given module name
    describe("getObjectsInModule function", function () {

    });

    //Creates an object identifier object given a oid in string format
    //accepted formats:
    // * .1.3.1.6.1
    // * 1.3.1.6.1
    // * iso.org.internet
    // * .iso.org.internet
    // * MODULE-NAME::object
    // * MODULE-NAME::object.1.0
    describe("parseOid function", function () {
        it("should parse iso", function () {
            var mibOid = testMibRepo.parseOid('iso');
            expect(mibOid.identifiers).to.eql([ 1 ]);
        });

        it("should parse IF-MIB::ifEntry", function () {
            var mibOid = testMibRepo.parseOid('IF-MIB::ifEntry');
            expect(mibOid.identifiers).to.eql([ 1, 3, 6, 1, 2, 1, 2, 2, 1 ]);
        });

        it("should parse .iso.org.dod.internet.mgmt.mib-2.interfaces.ifTable.ifEntry", function () {
            var mibOid = testMibRepo.parseOid('.iso.org.dod.internet.mgmt.mib-2.interfaces.ifTable.ifEntry');
            expect(mibOid.identifiers).to.eql([ 1, 3, 6, 1, 2, 1, 2, 2, 1 ]);
        });

        it("should parse IF-MIB::ifEntry.1", function () {
            var mibOid = testMibRepo.parseOid('IF-MIB::ifEntry.1');
            expect(mibOid.identifiers).to.eql([ 1, 3, 6, 1, 2, 1, 2, 2, 1, 1 ]);
        });

        it("should resolve the oid to a string correctly", function () {
            var mibOid = testMibRepo.parseOid('IF-MIB::ifEntry.1.2.3');
            expect(mibOid.string).to.be('IF-MIB::ifIndex.2.3');
        });
    });

    //Returns object definition data given MibOid object
    describe("getMibObjectData function", function () {

    });
});
