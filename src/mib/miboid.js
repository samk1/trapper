/**
 * Created by Samuel on 23/11/2015.
 */

function MibOid(spec) {
    if(!spec.string || !spec.identifiers || !spec.names) {
        throw(new Error("Invalid MibOid specification"));
    }

    this.string = spec.string;
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