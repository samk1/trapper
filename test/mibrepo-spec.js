/**
 * Created by Samuel on 21/11/2015.
 */

var MibRepo = require('../src/parser/mibrepo.js').MibRepo;
var MibModule = require('../src/parser/mibmodule.js').MibModule;
var expect = require('expect.js');

//Test mib reporitoriy mib path
var path = "C:\\usr\\share\\snmp\\mibs"; //path to test mibs

describe("MibRepo Constructor", function () {
    it("should take a string argument containing the path to search for mib files", function () {
        expect(new MibRepo(path)).not.to.be(null);
    });

    it("should take an array argument containing a list of paths to search",function () {
        expect(new MibRepo([path])).not.to.be(null);
    });

    it("should return null if the argument is invalid", function () {
        expect(new MibRepo({}).to.be(null));
    });
});

describe("moduleNames property of MibRepo", function () {
    var moduleList = ["IF-MIB"];
    var mibRepo = null;

    beforeEach(function() {
        mibRepo = new MibRepo(path);
    });

    it("should be an array", function () {
        expect(mibRepo.moduleNames).to.be.an(Array);
    });

    it("should match the list of MIB modules in the test directory", function () {
        expect(mibRepo.moduleNames).to.eql(moduleList)
    })
});

describe("modules property of MibRepo", function () {
    var mibRepo = null;

    beforeEach(function() {
        mibRepo = new MibRepo(path);
    });

    it("should be an object", function () {
        expect(mibRepo.modules).to.be.an(Object);
    });

    it("should contain IF-MIB", function () {
        expect(mibRepo.modules['IF-MIB']).not.to.be(undefined);
    });

    it("members should be MibModules", function () {
        mibRepo.moduleNames.forEach(function (name) {
            expect(mibRepo.modules[name]).to.be.a(MibModule);
        })
    })
});