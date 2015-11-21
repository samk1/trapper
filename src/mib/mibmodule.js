/**
 * Created by Samuel on 21/11/2015.
 */

var smiParser = require('./snmpv2smi.js').parser;
var fs = require('fs');

function MibModule(mibPath) {
    var self = this;
    var definitions = {};
    var imports = {};

    function addDefinition(identifier, definitionSyntax) {
        definitions[identifier] = definitionSyntax;
    }

    function readSyntaxTree(syntaxTree) {
        var assignments = syntaxTree.body.assignments;

        readAssignments(assignments);
    }

    function readAssignments(assignments) {
        Object.keys(assignments).forEach(function (identifier) {
            addDefinition(identifier, assignments[identifier])
        })
    }
    var source = fs.readFileSync(mibPath).toString();
    var syntaxTree = smiParser.parse(source);
    readSyntaxTree(syntaxTree);

    Object.defineProperty(self, 'definitions', {
        value: definitions
    });

    Object.defineProperty(self, 'imports', {
        value: imports
    });

    Object.defineProperty(self, 'name', {
        value: syntaxTree.module_identifier
    });
}

exports.MibModule = MibModule;