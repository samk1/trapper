/**
 * Created by Samuel on 23/11/2015.
 */

function MibOid(spec) {
    if(!spec.string || !spec.identifiers) {
        throw(new Error("Invalid MibOid specification"));
    }

    var string = spec.string;
    var identifiers = spec.identifiers;

    var curIndex = 0;

    Object.defineProperty(this, 'atEnd', {
        get: function () {
            return curIndex == identifiers.length
        }
    });

    Object.defineProperty(this, 'nextIdentifier', {
        get: function () {
            return function () {
                if(curIndex == identifiers.length) {
                    return null;
                }

                return identifiers[curIndex++];
            }
        }
    });

    Object.defineProperty(this, 'reset', {
        get: function () {
            return function () {
                curIndex = 0;
            }
        }
    });

    Object.defineProperty(this, 'identifiers', {
        get: function () {
            return identifiers.slice();
        }
    });

    Object.defineProperty(this, 'string', {
        value: string
    });
}

exports.MibOid = MibOid;