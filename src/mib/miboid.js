/**
 * Created by Samuel on 23/11/2015.
 */

var numberRe = /[0-9+]/;

function createOidString(moduleName, objectName, names) {
    var string = `${moduleName}::${objectName}`;
    var numbers = [];

    names.forEach(function (name) {
        if (numberRe.exec(name)) {
            numbers.push(name); //actually a number
        }
    });

    if(numbers.length > 0) {
        string += `.${numbers.join('.')}`;
    }

    return string;
}

//This constructor is intended to be used by the parseOid function of MibRepo
function MibOid(spec) {
    if(!spec.moduleName || !spec.objectName || !spec.identifiers || !spec.names) {
        throw(new Error("Invalid MibOid specification"));
    }

    this.string = createOidString(spec.moduleName, spec.objectName, spec.names);
    this.names = spec.names.slice();
    this.identifiers = spec.identifiers.slice();
}

MibOid.prototype.identifiersCopy = function () {
    return this.identifiers.slice()
};

MibOid.prototype.namesCopy = function () {
    return this.names.slice()
};

exports.MibOid = MibOid;