/**
 * Created by Samuel on 21/11/2015.
 */

var smiParser = require('./snmpv2smi.js').parser;
var fs = require('fs');

function MibModule(mibPath) {
    var self = this;
    var definitions = {};
    var imports = {};

    function addDefinition(definitionSyntax) {
        var identifier;
        var definition = {};

        if(definitionSyntax.assignment_class === 'value') {
            identifier = definitionSyntax.identifier;
            var definitionType = definitionSyntax.assignment_type;
            var definitionValue = definitionSyntax.assignment_value;

            if(definitionType.type_class === 'defined_macro') {
                if(definitionType.type_def.macro_type === 'module_identity') {
                    definition = readModuleIdentityDefinition(definitionType.type_def.value);
                    definition.oid = readOidValue(definitionValue);
                }
            } else if(definitionType.type_class === 'builtin') {
                if(definitionType.type_def === 'OBJECT') {
                    definition.oid = readOidValue(definitionValue)
                }
            }
        }

        Object.defineProperty(definitions, identifier, {
            enumerable: true,
            value: definition
        })
    }

    function readModuleIdentityDefinition(moduleIdDefn) {
        return moduleIdDefn;
    }

    function readOidValue(value) {
        if(value.class === 'ambiguous_bit_or_object_identifier') {
            return value.value;
        } else {
            throw new Error("Could not read object identifier value");
        }
    }

    function readSyntaxTree(syntaxTree) {
        var assignments = syntaxTree.body.assignments;

        readAssignments(assignments);
    }

    function readAssignments(assignments) {
        assignments.forEach(function (assigment) {
            addDefinition(assigment);
        });
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