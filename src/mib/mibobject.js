/**
 * Created by Samuel on 22/11/2015.
 */

var BUILTIN_TYPES = require('./mibconstants.js').BUILTIN_TYPES;

function MibObject(spec) {
    this.identifier = spec.name || null;
    this.parentIdentifier = spec.parent || null;
    this.numericIdentifier = spec.id || null;
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
    if(this.children[childObject.numericIdentifier]) {
        throw(new Error("Can not add a child with the same identifier twice"));
    }

    this.children[childObject.numericIdentifier] = childObject;
};

MibObject.prototype.getChild = function(childNumericIdentifier) {
    return this.children[childNumericIdentifier];
};

MibObject.prototype.getData = function () {
    var objectData = {};

    objectData.numericIdentifier = this.numericIdentifier;
    objectData.parentIdentifier = this.parentIdentifier;
    objectData.identifier = this.identifier;
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