/**
 * Created by Samuel on 21/11/2015.
 */

var MibRepo = require('../src/mib/mibrepo.js').MibRepo;
var MibModule = require('../src/mib/mibmodule.js').MibModule;
var expect = require('expect.js');

//Test mib reporitoriy mib path
var path = "C:\\usr\\share\\snmp\\mibs"; //path to test mibs
describe("MibRepo prototype", function () {
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

    });

    //Returns object definition data given MibOid object
    describe("getMibObjectData function", function () {

    });
});
