/**
 * Created by Samuel on 23/11/2015.
 */

var MibOid = require('../src/mib/miboid.js').MibOid;
var expect = require('expect.js');

describe("MibOid prototype", function () {
    describe("the identifiersCopy function", function () {
        var testMibOid = null;

        beforeEach(function () {
            testMibOid = new MibOid({
                identifiers: [ 1, 2, 3 ],
                string: "TEST-MIB::testObject"
            });
        });

        it("returns an array of the identifiers in the oid", function () {
            expect(testMibOid.identifiersCopy()).to.eql([ 1, 2, 3 ]);
        });

        it("creates a new array", function () {
            testMibOid.identifiersCopy().push(4);
            expect(testMibOid.identifiersCopy()).to.eql([ 1, 2, 3 ]);
        });
    });

    describe("the string property", function () {
        var testMibOid = null;

        beforeEach(function () {
            testMibOid = new MibOid({
                identifiers: [ 1, 2, 3 ],
                string: "TEST-MIB::testObject"
            });
        });

        it("returns the string name of the oid", function () {
            expect(testMibOid.string).to.be("TEST-MIB::testObject");
        });
    });
});