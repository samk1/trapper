/**
 * Created by Samuel on 23/11/2015.
 */

function MibOid(spec) {
    if(!spec.string || !spec.identifiers) {
        throw(new Error("Invalid MibOid specification"));
    }

    this.string = spec.string;
    this.identifiers = spec.identifiers.slice();
}

MibOid.prototype.identifiersCopy = function () {
    return this.identifiers.slice()
};

exports.MibOid = MibOid;