/**
 * Created by Samuel on 22/11/2015.
 */

var BUILTIN_TYPES = require('./mibconstants.js').BUILTIN_TYPES;

/* MibObject lifecycle:
 * 1. created during parsing. descriptor, identifier and moduleName are set.
 * 2. object information is defined in read-only properties.
 * 3. After parsing is complete, the oid is set as a read only property during
 * OID expansion.
 * 4. The object is added to the object tree where it is accessible by public API.
 * at this point, the object is finalised (the OID is set read only) and sealed.
 *
 * An object can also be created after parsing if it is discovered as a descriptor
 * assignment.
 */
function MibObject(spec) {
    if(!spec.descriptor || !spec.identifier) {
        throw(new Error('Descriptor and Identifier must be specified'));
    }
    if(!spec.moduleName) {
        throw(new Error('Module name must be specified'))
    }

    this.descriptor = spec.descriptor || null;
    this.parentDescriptor = spec.parentDescriptor || null;
    this.identifier = spec.identifier || null;
    this.moduleName = spec.moduleName || null;
    this.typeName = BUILTIN_TYPES.ObjectIdentifier;

    if(spec.macro) {
        var macro = spec.macro;
        if(!macro.macroTypeName) {
            throw(new Error("Macro type descriptor must be specified"));
        }

        this.typeName = macro.macroTypeName;
        this.macroData = macro.macroData;
    }
}

MibObject.prototype.getData = function () {
    var objectData = {};

    objectData.identifier = this.identifier;
    objectData.parentDescriptor = this.parentDescriptor;
    objectData.descriptor = this.descriptor;
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