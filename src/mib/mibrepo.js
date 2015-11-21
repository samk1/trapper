/**
 * Created by Samuel on 21/11/2015.
 */

var snmpv2smi = require('snmpv2smi.js');
var fs = require('fs');
var path = require('path');

function MibRepo(search) {
    var self = this;

    self.modules = {};

    function parseMibs(dirPath) {
        enumFiles(dirPath).forEach(function (filePath) {
            var module = new MibModule(filePath);
            self.modules[module.name] = module;
        })
    }

    function enumFiles(dirPath) {
        dirPath = path.normalize(dirPath);
        var filePaths = [];

        if(fs.statSync(dirPath).isDirectory()) {
            fs.readdirSync(dirPath).forEach(function (fileName) {
                var filePath = path.join(dirPath, fileName);
                if(fs.statSync(filePath).isFile()) {
                    filePaths.push(filePath);
                }
            });
        }

        return filePaths;
    }

    function buildOidTree() {

    }

    if (Array.isArray(search)) {
        search.forEach(function (dirPath) {
            parseMibs(dirPath)
        })
    } else if(typeof search === 'string') {
        parseMibs(search)
    }
}

MibRepo.prototype.getObjectDefinition = function(oidString) {
    var mibOid = MibOid.parseOid(oidString);
    var node = this.oidTree[1];

    while(!mibOid.end()) {
        node = node.getChild(mibOid.nextIdentifier());

        if (!node) {
            return null;
        }
    }

    return node;
};

