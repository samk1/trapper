/**
 * Created by Samuel on 21/11/2015.
 */

var parseSmi = require('./snmpv2smi.js').parse;
var fs = require('fs');

function MibModule(mibPath) {
    var self = this;
    var definitions = {};
    var imports = {};

    var syntaxTree = parseSmi(fs.readFileSync(mibPath));

    Object.defineProperty(self, 'definitions', {
        value: definitions
    });

    Object.defineProperty(self, 'imports', {
        value: imports
    });
}

exports.MibModule = MibModule;