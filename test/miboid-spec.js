/**
 * Created by Samuel on 23/11/2015.
 */

var MibOid = require('../src/mib/miboid.js').MibOid;
var expect = require('expect.js');

describe("MibOid prototype", function () {
    describe("the identifiers property", function () {
        var testMibOid = null;

        beforeEach(function () {
            testMibOid = new MibOid({
                identifiers: [ 1, 2, 3 ],
                string: "TEST-MIB::testObject"
            });
        });

        it("returns an array of the identifiers in the oid", function () {
            expect(testMibOid.identifiers).to.eql([ 1, 2, 3 ]);
        });

        it("creates a new array on get", function () {
            testMibOid.identifiers.push(4);
            expect(testMibOid.identifiers).to.eql([ 1, 2, 3 ]);
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

    describe("the nextIdentifier method", function () {
        var testMibOid = null;

        beforeEach(function () {
            testMibOid = new MibOid({
                identifiers: [ 1, 2, 3 ],
                string: "TEST-MIB::testObject"
            });
        });

        it("returns the first identifier on first call", function () {
            expect(testMibOid.nextIdentifier()).to.be(1);
        });

        it("returns the second identifier on second call", function () {
            testMibOid.nextIdentifier();
            expect(testMibOid.nextIdentifier()).to.be(2);
        });

        it("returns the third identifier on third call", function () {
            testMibOid.nextIdentifier();
            testMibOid.nextIdentifier();
            expect(testMibOid.nextIdentifier()).to.be(3);
        });

        it("always returns null when there are no more identifiers", function () {
            testMibOid.nextIdentifier();
            testMibOid.nextIdentifier();
            testMibOid.nextIdentifier();
            expect(testMibOid.nextIdentifier()).to.be(null);
            expect(testMibOid.nextIdentifier()).to.be(null);
        });
    });

    describe("the reset method", function () {
        var testMibOid = null;

        beforeEach(function () {
            testMibOid = new MibOid({
                identifiers: [ 1, 2, 3 ],
                string: "TEST-MIB::testObject"
            });
        });

        it("moves the conceptual identifier pointer to the start", function () {
            testMibOid.nextIdentifier();
            testMibOid.nextIdentifier();
            testMibOid.reset();
            expect(testMibOid.nextIdentifier()).to.be(1);
        })
    });

    describe("the atEnd property", function () {
        var testMibOid = null;

        beforeEach(function () {
            testMibOid = new MibOid({
                identifiers: [ 1, 2, 3 ],
                string: "TEST-MIB::testObject"
            });
        });

        it("is false if a call to nextIdentifier will not return null", function () {
            expect(testMibOid.atEnd).to.be(false);
        });

        it("is true if a call to nextIdentifier will return null", function () {
            testMibOid.nextIdentifier();
            testMibOid.nextIdentifier();
            testMibOid.nextIdentifier();

            expect(testMibOid.atEnd).to.be(true);
        });
    });
});