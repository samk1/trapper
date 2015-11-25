/**
 * Created by Samuel on 22/11/2015.
 */

var BUILTIN_TYPES = require('./mibconstants.js').BUILTIN_TYPES;

function MibObject(spec) {
    this.name = spec.name || null;
    this.parentName = spec.parentName || null;
    this.identifier = spec.identifier || null;
    this.typeName = BUILTIN_TYPES.ObjectIdentifier;

    if(spec.macro) {
        var macro = spec.macro;
        if(!macro.macroTypeName) {
            throw(new Error("Macro type name must be specified"));
        }

        this.typeName = macro.macroTypeName;
        this.macroData = macro.macroData;
    }

    this.children = {};
}

MibObject.prototype.addChild = function(childObject) {
    if(this.children[childObject.identifier] || this.children[childObject.name]) {
        throw(new Error("Can not add a child with the same name or identifier twice"));
    }

    this.children[childObject.identifier] = childObject;
    this.children[childObject.name] = childObject;
};

MibObject.prototype.getData = function () {
    var objectData = {};

    objectData.identifier = this.identifier;
    objectData.parentName = this.parentName;
    objectData.name = this.name;
    objectData.typeName = this.typeName;

    if(this.macroData) {
        var macroData = this.macroData;
        Object.keys(macroData).forEach(function (macroDataKey) {
            objectData[macroDataKey] = macroData[macroDataKey]
        });
    }

    return objectData;
};

exports.MibObject = MibObject;