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
    if(!spec.descriptor) {
        throw(new Error('Descriptor must be specified'));
    }
    if(!spec.moduleName) {
        throw(new Error('Module name must be specified'))
    }

    this.descriptor = spec.descriptor;
    this.moduleName = spec.moduleName;
    this.from = [ spec.moduleName ];
    this.macroData = null;
}

MibObject.prototype.equals = function (other) {
    if(this.descriptor !== other.descriptor) {
        return false;
    }

    if(this.macroData || other.macroData) {
        if(!this.macroData || !other.macroData) {
            return false;
        }

        var key;
        var keys = Object.keys(this.macroData);

        for (key in keys) {
            if(!other.macroData[key]) {
                return false;
            }

            if(this.macroData[key] !== other.macroData[key]) {
                return false;
            }
        }
    }

    return true;
};

MibObject.prototype.finalise = function () {

};

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