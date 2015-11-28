/**
 * Created by Samuel on 21/11/2015.
 */

var smiParser = require('./smiparser.js').parser;
var fs = require('fs');

function MibModule(mibPath) {
    var self = this;
    var objects = {};
    var types = {};
    var imports = {};

    function addImport(importSyntax) {
        var moduleName = importSyntax.module_name;
        importSyntax.object_names.forEach(function (objectDescriptor) {
            if(imports[objectDescriptor]) {
                throw(new Error(`${objectDescriptor} imported twice in module ${mibPath}`));
            }

            imports[objectDescriptor] = moduleName;
        });
    }

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

        Object.defineProperty(objects, identifier, {
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

    function readImports(imports) {
        imports.forEach(function (importSyntax) {
            addImport(importSyntax);
        });
    }
    var source = fs.readFileSync(mibPath).toString();
    var syntaxTree = smiParser.parse(source);
    readSyntaxTree(syntaxTree);

    Object.defineProperty(self, 'objects', {
        value: objects
    });

    Object.defineProperty(self, 'imports', {
        value: imports
    });

    Object.defineProperty(self, 'name', {
        value: syntaxTree.module_identifier
    });
}

MibModule.prototype.getExporterForDescriptor = function (objectDescriptor) {
    return this.imports[objectDescriptor] || null;
};

MibModule.prototype.importsDescriptor = function (objectDescriptor) {
    return !!this.imports[objectDescriptor];
};

exports.MibModule = MibModule;