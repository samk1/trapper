/**
 * Created by Samuel on 21/11/2015.
 */

var smiParser = require('./smiparser.js').parser;
var MibObject = require('./mibobject.js').MibObject;
var fs = require('fs');

function MibModule(mibPath) {
    var implementedMacros = new Set([
        'module_identity',
        'object_identity',
        'object_type',
        'notification_type',
        'object_group',
        'notification_group',
        'module_compliance',
        'agent_capabilities'
    ]);

    var self = this;
    var moduleName = '';
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

        if(definitionSyntax.definition_class === 'value') {
            var object = new MibObject({
                descriptor: definitionSyntax.descriptor,
                moduleName: moduleName
            });

            var definitionType = definitionSyntax.type;
            var definitionValue = definitionSyntax.value;

            if(definitionValue.class !== 'object_identifier') {
                throw new Error("non-object identifier value assignments are not implemented");
            }

            object.oidSyntax = definitionValue.value;

            if(definitionType.type_class === 'macro') {
                if(implementedMacros.has(definitionType.macro_name)) {
                    object.macroData = definitionType.macro_data;
                    object.macroName = definitionType.macro_name;
                } else {
                    throw new Error("Unimplemented macro type: " + definitionType.macro_name);
                }
            } else if (definitionType.builtin_name !== 'OBJECT IDENTIFIER') {
                throw new Error("Unimplemented type:"  + definitionType);
            }

            objects[object.descriptor] = object;
        }
    }

    function readSyntaxTree(syntaxTree) {
        moduleName = syntaxTree.module_identifier;

        syntaxTree.imports.forEach(function (importSyntax) {
            addImport(importSyntax)
        });

        syntaxTree.definitions.forEach(function (definitionSyntax) {
            addDefinition(definitionSyntax)
        });

    }

    var source = fs.readFileSync(mibPath).toString();
    try {
        var syntaxTree = smiParser.parse(source);
    } catch(err) {
        throw new Error(`${mibPath}: ${err.message}`);
    }
    readSyntaxTree(syntaxTree);

    Object.defineProperty(self, 'objects', {
        value: objects
    });

    Object.defineProperty(self, 'imports', {
        value: imports
    });

    Object.defineProperty(self, 'name', {
        value: moduleName
    });
}

MibModule.prototype.getExporterForDescriptor = function (objectDescriptor) {
    return this.imports[objectDescriptor] || null;
};

MibModule.prototype.importsDescriptor = function (objectDescriptor) {
    return !!this.imports[objectDescriptor];
};

exports.MibModule = MibModule;