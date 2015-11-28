/**
 * Created by Samuel on 21/11/2015.
 */

var MibModule = require('../src/mib/mibmodule.js').MibModule;
var MibObject = require('../src/mib/mibobject.js').MibObject;
var expect = require('expect.js');

describe("MibModule constructor", function () {
    var mibPath = "C:\\usr\\share\\snmp\\mibs\\IF-MIB.txt";
    var ifMib = null;

    beforeEach(function () {
        ifMib = new MibModule(mibPath);
    });

    it("has a definitions property", function () {
        expect(ifMib).to.have.property('objects');
    });

    it("has a imports property", function () {
        expect(ifMib).to.have.property('imports');
    });

    it("has a types property", function () {
        expect(ifMib).to.have.property('types');
    });

    it("has a name property which will be set to IF-MIB in this test", function () {
        expect(ifMib.name).to.be('IF-MIB');
    });

    describe("The object property", function () {
        it("contains a mapping of object names to object definitions");

        it("should contain a definition for the ifInOctets object", function () {
            expect(ifMib.objects).to.have.property("ifInOctets");
        });

        describe("The ifInOctets object definition", function () {
            var object = null;

            beforeEach(function () {
                object = ifMib.objects.ifInOctets;
            });

            it("should be a MibObject", function () {
                expect(object).to.be.a(MibObject);
            });
        })
    });

    describe("The types property", function () {
        it("contains mappings of identifiers to types define in the MIB module");

        it("should contain the OwnerString textual convention", function () {
            expect(ifMib.types).to.have.property('OwnerString');
        });

        it("should contain the ifEntry sequence", function () {
            expect(ifMib.types).to.have.property('ifEntry');
        });

        describe("The OwnerString textual convention", function () {
            var ownerString = null;

            beforeEach(function () {
                ownerString = ifMib.types.OwnerString;
            });

            it("should have a display hint property", function () {
                expect(ownerString.displayHint).to.be("(255a)");
            });

            it("should have a status property", function () {
                expect(ownerString.status).to.be("deprecated");
            });

            it("should have a description property", function () {
                expect(onwerString).to.have.property("description");
            });

            it("should have a syntax property", function () {
                var syntaxSpec = {
                    typeClass: 'builtin',
                    typeValue: 'octet_string',
                    constraints: [
                        { constraintClass: 'range', minValue: 0, maxValue: 255 }
                    ]
                };

                expect(ownerString.syntax).to.eql(syntaxSpec);
            });
        });

        describe("The ifEntry sequence", function () {

        })
    });

    describe("The imports property", function () {
        it("contains a mapping of module identifiers to the list of symbols imported from that module");
    })
});

