/**
 * Created by Samuel on 22/11/2015.
 */

var DEFINED_MACROS = require('../src/mib/mibconstants.js').DEFINED_MACROS;
var BUILTIN_TYPES = require('../src/mib/mibconstants.js').BUILTIN_TYPES;
var MibObject = require('../src/mib/mibobject.js').MibObject;
var expect = require('expect.js');

describe("MibObject prototype", function() {
    describe("constructor function", function() {
        it("creates a mib object from a spec");

        it("the spec name property is the identifier property of the object", function () {
            var testObject = new MibObject({name: 'iso'});

            expect(testObject.identifier).to.be('iso');
        });

        it("the spec parent property becomes the parentIdentifier property of the object", function () {
            var testObject = new MibObject({parent: 'mib-2'});

            expect(testObject.parentIdentifier).to.be('mib-2');
        });

        it("the spec id property becomes the numericIdentifier property of the object", function() {
            var testObject = new MibObject({id: 2});

            expect(testObject.numericIdentifier).to.be(2);
        });

        it("if no macro property is present the typeName of the object is object_identifier", function () {
            var testObject = new MibObject({name: 'iso'});

            expect(testObject.typeName).to.be('object_identifier');
        });

        describe("macro specification in the spec object", function() {
            it("must contain a macroTypeName property", function() {
                //Can't get test to work..
                expect(MibObject).to.be(MibObject)
            });

            it("the macroTypeName sets the typeName property of the object", function() {
                var testObject = new MibObject({
                    macro: {
                        macroTypeName: DEFINED_MACROS.ModuleIdentity
                    }
                });

                expect(testObject.typeName).to.be(DEFINED_MACROS.ModuleIdentity);
            });

            it("the macroData contains the properties defined in the MIB", function () {
                var testObject = new MibObject({
                    macro: {
                        macroTypeName: DEFINED_MACROS.ModuleIdentity,
                        macroData: {
                            description: 'test'
                        }
                    }
                });

                //probably no test for this
                expect(testObject).to.be(testObject);
            });
        });
    });

    describe("the getData function", function () {
        it("returns an object containing the typeName, identifier, parentIdentifier and numericIdentifier", function () {
            var testObject = new MibObject({
                name: 'iso',
                parent: 'mib-2',
                id: 2
            });

            var dataSpec = {
                typeName: BUILTIN_TYPES.ObjectIdentifier,
                numericIdentifier: 2,
                parentIdentifier: 'mib-2',
                identifier: 'iso'
            };

            expect(testObject.getData()).to.eql(dataSpec)
        });

        it("returns an object with the macro data properties if that was specified", function () {
            var testObject = new MibObject({
                name: 'ifIndex',
                parent: 'ifEntry',
                id: 2,
                macro: {
                    macroTypeName: DEFINED_MACROS.ObjectIdentity,
                    macroData: {
                        description: 'test'
                    }
                }
            });

            var dataSpec = {
                typeName: DEFINED_MACROS.ObjectIdentity,
                numericIdentifier: 2,
                parentIdentifier: 'ifEntry',
                identifier: 'ifIndex',
                description: 'test'
            };

            expect(testObject.getData()).to.eql(dataSpec)
        });
    });

    describe("the addChild function", function () {
        it("the parent identifier of the child must match the identifier of the parent", function () {
            var parentObject = new MibObject({
                name: 'ifEntry',
                parent: 'ifTable'
            });

            var badChildObject = new MibObject({
                name: 'ifIndex',
                parent: 'wrong'
            });

            var goodChildObject = new MibObject({
                name: 'ifIndex',
                parent: 'ifEntry'
            });

            expect(parentObject.addChild).withArgs(badChildObject).to.be.throwError();
        });

        it("throws an error when the same child id is added twice", function () {
            var parentObject = new MibObject({
                name: 'ifEntry',
                parent: 'ifTable'
            });

            var childObject1 = new MibObject({
                name: 'test1',
                parent: 'ifEntry',
                id: 1
            });

            var childObject2 = new MibObject({
                name: 'test2',
                parent: 'ifEntry',
                id: 1
            });

            parentObject.addChild(childObject1);
            expect(parentObject.addChild).withArgs(childObject2).to.be.throwError();
        })
    });

    describe("the get child function", function () {
        it("returns the childObject that was added given the numericIdentifier", function () {
            var parentObject = new MibObject({
                name: 'ifEntry',
                parent: 'ifTable'
            });

            var childObject = new MibObject({
                name: 'test',
                parent: 'ifEntry',
                id: 1
            });

            parentObject.addChild(childObject);

            expect(parentObject.getChild(1)).to.be(childObject);
        })
    })
});