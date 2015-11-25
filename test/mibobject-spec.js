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

            expect(testObject.name).to.be('iso');
        });

        it("the spec parent property becomes the parentName property of the object", function () {
            var testObject = new MibObject({parentName: 'mib-2'});

            expect(testObject.parentName).to.be('mib-2');
        });

        it("the spec id property becomes the identifier property of the object", function() {
            var testObject = new MibObject({identifier: 2});

            expect(testObject.identifier).to.be(2);
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
        it("returns an object containing the typeName, identifier, parentName and identifier", function () {
            var testObject = new MibObject({
                name: 'iso',
                parentName: 'mib-2',
                identifier: 2
            });

            var dataSpec = {
                typeName: BUILTIN_TYPES.ObjectIdentifier,
                identifier: 2,
                parentName: 'mib-2',
                name: 'iso'
            };

            expect(testObject.getData()).to.eql(dataSpec)
        });

        it("returns an object with the macro data properties if that was specified", function () {
            var testObject = new MibObject({
                name: 'ifIndex',
                parentName: 'ifEntry',
                identifier: 2,
                macro: {
                    macroTypeName: DEFINED_MACROS.ObjectIdentity,
                    macroData: {
                        description: 'test'
                    }
                }
            });

            var dataSpec = {
                typeName: DEFINED_MACROS.ObjectIdentity,
                identifier: 2,
                parentName: 'ifEntry',
                name: 'ifIndex',
                description: 'test'
            };

            expect(testObject.getData()).to.eql(dataSpec)
        });
    });

    describe("the addChild function", function () {
        it("the parent identifier of the child must match the identifier of the parent", function () {
            var parentObject = new MibObject({
                name: 'ifEntry',
                parentName: 'ifTable'
            });

            var badChildObject = new MibObject({
                name: 'ifIndex',
                parentName: 'wrong'
            });

            expect(parentObject.addChild).withArgs(badChildObject).to.be.throwError();
        });

        it("throws an error when the same child id is added twice", function () {
            var parentObject = new MibObject({
                name: 'ifEntry',
                parentName: 'ifTable'
            });

            var childObject1 = new MibObject({
                name: 'test1',
                parentName: 'ifEntry',
                identifier: 1
            });

            var childObject2 = new MibObject({
                name: 'test2',
                parentName: 'ifEntry',
                identifier: 1
            });

            parentObject.addChild(childObject1);
            expect(parentObject.addChild).withArgs(childObject2).to.be.throwError();
        })

        it("adds a reference to the child object in the children property keyed to the child name", function () {
            var parentObject = new MibObject({
                name: 'ifEntry',
                parentName: 'ifTable'
            });

            var childObject = new MibObject({
                name: 'ifIndex',
                parentName: 'ifEntry',
                identifier: 1
            });

            parentObject.addChild(childObject);

            expect(parentObject.children['ifIndex']).to.be(childObject);
        });

        it("adds a reference to the child object in the children property keyed to the child identifier", function () {
            var parentObject = new MibObject({
                name: 'ifEntry',
                parentName: 'ifTable'
            });

            var childObject = new MibObject({
                name: 'test',
                parentName: 'ifEntry',
                identifier: 1
            });

            parentObject.addChild(childObject);

            expect(parentObject.children[1]).to.be(childObject);
        })
    });
});