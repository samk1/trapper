/**
 * Created by Samuel on 25/11/2015.
 */
var expect = require('expect.js');
var parser = require('../src/mib/oidparser.js').parser;
var syntaxClasses = require('../src/mib/mibconstants.js').OID_SYNTAX_CLASSES;

describe("Regular Expression based OID parser", function () {
    var moduleObjectSyntax;
    var identifierListSyntax;

    function testParse(testString, expectedSyntax) {
        expect(parser.parse(testString)).to.eql(expectedSyntax);
    }

    beforeEach(function () {
        moduleObjectSyntax = {
            syntax_class: syntaxClasses.ModuleObject,
            module_name: null,
            object_name: null,
            post_identifier_list: null
        };

        identifierListSyntax = {
            syntax_class: syntaxClasses.IdentifierList,
            identifier_list: null
        };
    });

    it("should parse IF-MIB::ifEntry", function () {
        var testString = 'IF-MIB::ifEntry';
        var expectedSyntax = moduleObjectSyntax;
        expectedSyntax.module_name = 'IF-MIB';
        expectedSyntax.object_name = 'ifEntry';

        testParse(testString, expectedSyntax);
    });

    it("should parse IF-MIB::ifEntry.foo.1.bar.2.qux", function () {
        var testString = 'IF-MIB::ifEntry.foo.1.bar.2.qux';
        var expectedSyntax = moduleObjectSyntax;
        expectedSyntax.module_name = 'IF-MIB';
        expectedSyntax.object_name = 'ifEntry';
        expectedSyntax.post_identifier_list = ['foo', 1, 'bar', 2, 'qux'];

        testParse(testString, expectedSyntax);
    });

    it("should parse .foo", function () {
        var testString = '.foo';
        var expectedSyntax = identifierListSyntax;
        expectedSyntax.identifier_list = ['foo'];

        testParse(testString, expectedSyntax);
    });

    it("should parse foo", function () {
        var testString = 'foo';
        var expectedSyntax = identifierListSyntax;
        expectedSyntax.identifier_list = ['foo'];

        testParse(testString, expectedSyntax);
    });

    it("should parse .foo.1.bar.2.qux", function () {
        var testString = '.foo.1.bar.2.qux';
        var expectedSyntax = identifierListSyntax;
        expectedSyntax.identifier_list = ['foo', 1, 'bar', 2, 'qux'];

        testParse(testString, expectedSyntax);
    });

    it("should parse foo.1.bar.2.qux", function () {
        var testString = 'foo.1.bar.2.qux';
        var expectedSyntax = identifierListSyntax;
        expectedSyntax.identifier_list = ['foo', 1, 'bar', 2, 'qux'];

        testParse(testString, expectedSyntax);
    });
});