/**
 * Created by Samuel on 22/11/2015.
 */

var BUILTIN_TYPES = require('./mibconstants.js').BUILTIN_TYPES;

function MibObject(spec) {
    if(!spec.name || !spec.identifier) {
        throw(new Error('Name and Identifier must be specified'));
    }

    this.name = spec.name || null;
    this.parentName = spec.parentName || null;
    this.identifier = spec.identifier || null;
    this.moduleName = spec.moduleName || null;
    this.typeName = BUILTIN_TYPES.ObjectIdentifier;

    if(spec.macro) {
        var macro = spec.macro;
        if(!macro.macroTypeName) {
            throw(new Error("Macro type name must be specified"));
        }

        this.typeName = macro.macroTypeName;
        this.macroData = macro.macroData;
    }
}

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